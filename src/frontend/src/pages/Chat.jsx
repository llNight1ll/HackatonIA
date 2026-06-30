import { useChat } from "../hooks/useChat";
import { useHealth } from "../hooks/useHealth";
import { useConversations } from "../hooks/useConversations";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatPanel from "../components/ChatPanel";

export default function Chat() {
  const { user, profile, signOut } = useAuth();
  const { health, loading, canSend, refresh } = useHealth();
  const {
    conversations,
    activeConversationId,
    loading: loadingConversations,
    refresh: refreshConversations,
    startNewConversation,
    selectConversation,
    removeConversation,
    ensureConversation,
    setActiveConversationId,
  } = useConversations(user?.id);

  const {
    messages,
    input,
    setInput,
    isGenerating,
    loadingMessages,
    activePrompt,
    selectPrompt,
    submitMessage,
  } = useChat({
    canSend,
    onHealthRefresh: refresh,
    conversationId: activeConversationId,
    ensureConversation,
    onConversationCreated: refreshConversations,
    onConversationActivated: setActiveConversationId,
  });

  return (
    <div className="app">
      <Sidebar
        health={health}
        loading={loading}
        activePrompt={activePrompt}
        profile={profile}
        conversations={conversations}
        activeConversationId={activeConversationId}
        loadingConversations={loadingConversations}
        onNewConversation={startNewConversation}
        onSelectConversation={selectConversation}
        onDeleteConversation={removeConversation}
        onSelectPrompt={selectPrompt}
        onSignOut={signOut}
      />
      <ChatPanel
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSubmit={submitMessage}
        canSend={canSend}
        isGenerating={isGenerating}
        loadingMessages={loadingMessages}
      />
    </div>
  );
}
