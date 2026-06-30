import { IconAssistant, IconUser } from "./Icons";

export default function MessageBubble({ role, content, isTyping = false }) {
  const isUser = role === "user";
  const lines = content.split("\n");

  return (
    <article
      className={`message message--${role}${isTyping ? " message--typing" : ""}`}
    >
      <div className={`message__avatar message__avatar--${role}`} aria-hidden="true">
        {isUser ? <IconUser /> : <IconAssistant />}
      </div>

      <div className="message__body">
        <header className="message__meta">
          <span className="message__author">{isUser ? "Vous" : "Assistant IA"}</span>
          {isTyping && <span className="chip chip--warning">EN COURS</span>}
        </header>

        <div className={`card card--${isUser ? "elevated" : "default"} message__bubble`}>
          {lines.map((line, index) => (
            <p key={index}>{line || "\u00A0"}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
