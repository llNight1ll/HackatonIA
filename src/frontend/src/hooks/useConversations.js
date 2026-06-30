import { useCallback, useEffect, useState } from "react";
import {
  createConversation,
  deleteConversation,
  fetchConversations,
} from "../api/conversations";

export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error("Erreur chargement conversations:", error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  const selectConversation = useCallback((id) => {
    setActiveConversationId(id);
  }, []);

  const addConversation = useCallback((conversation) => {
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
    return conversation;
  }, []);

  const removeConversation = useCallback(
    async (conversationId) => {
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId],
  );

  const ensureConversation = useCallback(
    async (firstMessageText) => {
      if (activeConversationId) {
        return activeConversationId;
      }

      const title =
        firstMessageText.trim().slice(0, 48) +
        (firstMessageText.trim().length > 48 ? "…" : "");
      const conversation = await createConversation(title || "Nouvelle conversation");
      setConversations((prev) => [conversation, ...prev]);
      return conversation.id;
    },
    [activeConversationId],
  );

  return {
    conversations,
    activeConversationId,
    loading,
    refresh,
    startNewConversation,
    selectConversation,
    addConversation,
    removeConversation,
    ensureConversation,
    setActiveConversationId,
  };
}
