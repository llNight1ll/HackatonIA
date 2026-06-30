import { useEffect, useRef } from "react";
import { IconSend } from "./Icons";

export default function Composer({ value, onChange, onSubmit, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit(event);
    }
  };

  return (
    <form className="composer" onSubmit={onSubmit}>
      <label className="composer__field">
        <span className="field__label">Votre message</span>
        <textarea
          ref={textareaRef}
          className="input input--textarea"
          rows={1}
          placeholder="Posez une question sur la finance, l'investissement..."
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <span className="field__helper">Entrée pour envoyer · Maj+Entrée pour un retour à la ligne</span>
      </label>

      <button
        type="submit"
        className="btn btn--primary btn--lg composer__submit"
        disabled={disabled || !value.trim()}
        aria-label="Envoyer le message"
      >
        <IconSend size={18} />
        Envoyer
      </button>
    </form>
  );
}
