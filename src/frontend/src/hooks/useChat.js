import { useCallback, useEffect, useState } from "react";
import { sendChat } from "../api/chat";
import {
  buildConversationTitle,
  fetchMessages,
  saveMessage,
  updateConversationTitle,
} from "../api/conversations";
import { RESET_MESSAGE, WELCOME_MESSAGE } from "../constants/prompts";

export function useChat({
  canSend,
  onHealthRefresh,
  conversationId,
  ensureConversation,
  onConversationCreated,
  onConversationActivated,
}) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([WELCOME_MESSAGE]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoadingMessages(true);
      try {
        const stored = await fetchMessages(conversationId);
        if (cancelled) return;
        if (stored.length === 0) {
          setMessages([RESET_MESSAGE]);
        } else {
          setMessages(stored.map((m) => ({ role: m.role, content: m.content, id: m.id })));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Erreur chargement messages:", error.message);
          setMessages([
            {
              role: "assistant",
              content: `Impossible de charger les messages : ${error.message}`,
            },
          ]);
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

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
      if (!content || !canSend || isGenerating || loadingMessages) return;

      const userMessage = { role: "user", content };
      const nextConversation = [...conversation, userMessage];
      const isFirstMessage = conversation.length === 0;

      setMessages((prev) => [
        ...prev.filter((m) => !m.isSystem),
        userMessage,
        { role: "assistant", content: "Réflexion en cours...", isTyping: true },
      ]);
      setInput("");
      setActivePrompt(null);
      setIsGenerating(true);

      try {
        const activeId = await ensureConversation(content);
        if (isFirstMessage) {
          await updateConversationTitle(activeId, buildConversationTitle(content));
          onConversationCreated?.();
        }

        await saveMessage(activeId, "user", content);

        const assistantText = await sendChat(nextConversation, updateLastAssistant);
        updateLastAssistant(assistantText);
        await saveMessage(activeId, "assistant", assistantText);
        onConversationActivated?.(activeId);
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
      ensureConversation,
      input,
      isGenerating,
      loadingMessages,
      onConversationCreated,
      onConversationActivated,
      onHealthRefresh,
      updateLastAssistant,
    ],
  );

  return {
    messages,
    input,
    setInput,
    isGenerating,
    loadingMessages,
    activePrompt,
    clearConversation,
    selectPrompt,
    submitMessage,
  };
}
