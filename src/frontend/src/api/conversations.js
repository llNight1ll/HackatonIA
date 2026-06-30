import { supabase } from "../lib/supabase";

export async function fetchConversations() {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createConversation(title = "Nouvelle conversation") {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, title })
    .select("id, title, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateConversationTitle(conversationId, title) {
  const { error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", conversationId);

  if (error) throw new Error(error.message);
}

export async function deleteConversation(conversationId) {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (error) throw new Error(error.message);
}

export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveMessage(conversationId, role, content) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content })
    .select("id, role, content, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export function buildConversationTitle(text, maxLength = 48) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}…`;
}
