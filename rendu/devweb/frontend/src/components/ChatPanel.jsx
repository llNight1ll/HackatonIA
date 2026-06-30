import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";
import { IconSpark } from "./Icons";

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
        <div className="chat-header__icon" aria-hidden="true">
          <IconSpark />
        </div>
        <div>
          <h2 className="chat-header__title">Assistant Financier</h2>
          <p className="chat-header__subtitle">
            Posez vos questions sur la finance, l'investissement et l'analyse
            économique.
          </p>
        </div>
      </header>

      <section className="messages" ref={messagesRef} aria-label="Conversation">
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
