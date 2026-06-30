import { useChat } from "./hooks/useChat";
import { useHealth } from "./hooks/useHealth";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  const { health, loading, canSend, refresh } = useHealth();
  const {
    messages,
    input,
    setInput,
    isGenerating,
    activePrompt,
    clearConversation,
    selectPrompt,
    submitMessage,
  } = useChat({ canSend, onHealthRefresh: refresh });

  return (
    <div className="app">
      <Sidebar
        health={health}
        loading={loading}
        activePrompt={activePrompt}
        onClear={clearConversation}
        onSelectPrompt={selectPrompt}
      />
      <ChatPanel
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSubmit={submitMessage}
        canSend={canSend}
        isGenerating={isGenerating}
      />
    </div>
  );
}
