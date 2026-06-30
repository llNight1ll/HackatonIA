import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";

export default function ChatPanel({
  messages,
  input,
  onInputChange,
  onSubmit,
  canSend,
  isGenerating,
}) {
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="chat-panel">
      <header className="chat-header">
        <div>
          <h2>Assistant Financier</h2>
          <p>
            Posez vos questions sur la finance, l'investissement et l'analyse
            économique.
          </p>
        </div>
      </header>

      <section className="messages" ref={messagesRef}>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
            isTyping={message.isTyping}
          />
        ))}
      </section>

      <Composer
        value={input}
        onChange={onInputChange}
        onSubmit={onSubmit}
        disabled={!canSend || isGenerating}
      />
    </main>
  );
}
