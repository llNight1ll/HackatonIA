export default function MessageBubble({ role, content, isTyping = false }) {
  const lines = content.split("\n");

  return (
    <article className={`message ${role}${isTyping ? " typing-indicator" : ""}`}>
      <div className="avatar">{role === "user" ? "Vous" : "AI"}</div>
      <div className="bubble">
        {lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </article>
  );
}
