const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const statusDot = document.getElementById("statusDot");
const statusLabel = document.getElementById("statusLabel");
const statusDetail = document.getElementById("statusDetail");
const backendSelect = document.getElementById("backendSelect");
const modelName = document.getElementById("modelName");

const conversation = [];

function autoResizeTextarea() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 180)}px`;
}

function createMessage(role, content, extraClass = "") {
  const article = document.createElement("article");
  article.className = `message ${role} ${extraClass}`.trim();

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "Vous" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (content.includes("\n")) {
    content.split("\n").forEach((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      bubble.appendChild(paragraph);
    });
  } else {
    const paragraph = document.createElement("p");
    paragraph.textContent = content;
    bubble.appendChild(paragraph);
  }

  article.appendChild(avatar);
  article.appendChild(bubble);
  messagesEl.appendChild(article);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();

    backendSelect.value = data.configured_backend || "ollama";
    modelName.value = data.model || "phi3.5-financial";

    if (data.connected) {
      statusDot.className = "status-dot connected";
      statusLabel.textContent = "Connecté";
      statusDetail.textContent = data.model_ready === false
        ? `Serveur OK, modèle "${data.model}" non chargé`
        : `${data.backend.toUpperCase()} — ${data.url}`;
      sendBtn.disabled = data.model_ready === false;
    } else {
      statusDot.className = "status-dot disconnected";
      statusLabel.textContent = "Déconnecté";
      statusDetail.textContent = data.error || "Serveur d'inférence indisponible";
      sendBtn.disabled = true;
    }
  } catch (error) {
    statusDot.className = "status-dot disconnected";
    statusLabel.textContent = "Déconnecté";
    statusDetail.textContent = error.message;
    sendBtn.disabled = true;
  }
}

async function sendMessage(content) {
  conversation.push({ role: "user", content });
  createMessage("user", content);

  messageInput.value = "";
  autoResizeTextarea();
  sendBtn.disabled = true;

  const typingBubble = createMessage("assistant", "Réflexion en cours...", "typing-indicator");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation, stream: true }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Erreur lors de la génération");
    }

    const contentType = response.headers.get("content-type") || "";
    typingBubble.innerHTML = "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      const assistantText = data.message?.content || "";
      typingBubble.innerHTML = `<p>${assistantText}</p>`;
      conversation.push({ role: "assistant", content: assistantText });
    } else {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      const paragraph = document.createElement("p");
      typingBubble.appendChild(paragraph);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        paragraph.textContent = assistantText;
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }

      conversation.push({ role: "assistant", content: assistantText });
    }
  } catch (error) {
    typingBubble.innerHTML = `<p>Erreur : ${error.message}</p>`;
  } finally {
    sendBtn.disabled = false;
    await checkHealth();
  }
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = messageInput.value.trim();
  if (!content) return;
  await sendMessage(content);
});

messageInput.addEventListener("input", autoResizeTextarea);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

clearBtn.addEventListener("click", () => {
  conversation.length = 0;
  messagesEl.innerHTML = `
    <article class="message assistant welcome">
      <div class="avatar">AI</div>
      <div class="bubble">
        <p>Nouvelle conversation démarrée.</p>
        <p>Comment puis-je vous aider sur vos sujets financiers ?</p>
      </div>
    </article>
  `;
});

document.querySelectorAll(".prompt-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    messageInput.value = chip.dataset.prompt;
    autoResizeTextarea();
    messageInput.focus();
  });
});

checkHealth();
setInterval(checkHealth, 10000);
