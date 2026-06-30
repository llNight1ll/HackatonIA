import { useState } from "react";
import { sendChat } from "./api/chat";
import { useHealth } from "./hooks/useHealth";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";

const WELCOME_MESSAGES = [
  {
    role: "assistant",
    content:
      "Bonjour, je suis l'assistant financier TechCorp basé sur Phi-3.5-Financial.\nJe peux vous aider sur l'analyse financière, les marchés, la gestion de budget et les concepts économiques.",
  },
];

const RESET_MESSAGES = [
  {
    role: "assistant",
    content:
      "Nouvelle conversation démarrée.\nComment puis-je vous aider sur vos sujets financiers ?",
  },
];

export default function App() {
  const { health, loading, canSend, refresh } = useHealth();
  const [messages, setMessages] = useState(WELCOME_MESSAGES);
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClear = () => {
    setConversation([]);
    setMessages(RESET_MESSAGES);
    setInput("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || !canSend || isGenerating) return;

    const userMessage = { role: "user", content };
    const nextConversation = [...conversation, userMessage];

    setConversation(nextConversation);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    const placeholderIndex = nextConversation.length;
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Réflexion en cours...", isTyping: true },
    ]);

    try {
      const assistantText = await sendChat(nextConversation, (partial) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[placeholderIndex + 1] = {
            role: "assistant",
            content: partial,
          };
          return updated;
        });
      });

      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: assistantText },
      ]);
      setMessages((prev) => {
        const updated = [...prev];
        updated[placeholderIndex + 1] = {
          role: "assistant",
          content: assistantText,
        };
        return updated;
      });
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[placeholderIndex + 1] = {
          role: "assistant",
          content: `Erreur : ${error.message}`,
        };
        return updated;
      });
    } finally {
      setIsGenerating(false);
      refresh();
    }
  };

  return (
    <div className="app">
      <Sidebar
        health={health}
        loading={loading}
        onClear={handleClear}
        onSelectPrompt={setInput}
      />
      <ChatPanel
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        canSend={canSend}
        isGenerating={isGenerating}
      />
    </div>
  );
}
