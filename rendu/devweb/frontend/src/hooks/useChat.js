import { useCallback, useState } from "react";
import { sendChat } from "../api/chat";
import { RESET_MESSAGE, WELCOME_MESSAGE } from "../constants/prompts";

export function useChat({ canSend, onHealthRefresh }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);

  const conversation = messages
    .filter((message) => !message.isSystem)
    .map(({ role, content }) => ({ role, content }));

  const clearConversation = useCallback(() => {
    setMessages([{ ...RESET_MESSAGE }]);
    setInput("");
    setActivePrompt(null);
  }, []);

  const updateLastAssistant = useCallback((content) => {
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: "assistant", content };
      return updated;
    });
  }, []);

  const selectPrompt = useCallback((prompt) => {
    setInput(prompt.text);
    setActivePrompt(prompt.label);
  }, []);

  const submitMessage = useCallback(
    async (event) => {
      event.preventDefault();
      const content = input.trim();
      if (!content || !canSend || isGenerating) return;

      const userMessage = { role: "user", content };
      const nextConversation = [...conversation, userMessage];

      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: "assistant", content: "Réflexion en cours...", isTyping: true },
      ]);
      setInput("");
      setActivePrompt(null);
      setIsGenerating(true);

      try {
        const assistantText = await sendChat(nextConversation, updateLastAssistant);
        updateLastAssistant(assistantText);
      } catch (error) {
        updateLastAssistant(`Erreur : ${error.message}`);
      } finally {
        setIsGenerating(false);
        onHealthRefresh?.();
      }
    },
    [
      canSend,
      conversation,
      input,
      isGenerating,
      onHealthRefresh,
      updateLastAssistant,
    ],
  );

  return {
    messages,
    input,
    setInput,
    isGenerating,
    activePrompt,
    clearConversation,
    selectPrompt,
    submitMessage,
  };
}
