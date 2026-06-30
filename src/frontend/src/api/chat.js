export async function fetchHealth() {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error("Impossible de contacter l'API");
  }
  return response.json();
}

export async function sendChat(messages, onChunk) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, stream: true }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Erreur lors de la génération");
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return data.message?.content || "";
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onChunk?.(text);
  }

  return text;
}
