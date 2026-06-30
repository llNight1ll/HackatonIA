import { IconServer, IconModel, IconRefresh } from "./Icons";
import { SUGGESTED_PROMPTS } from "../constants/prompts";

function StatusChip({ health, loading }) {
  if (loading) {
    return <span className="chip chip--warning">VÉRIFICATION</span>;
  }
  if (!health?.connected) {
    return <span className="chip chip--error">DÉCONNECTÉ</span>;
  }
  if (health.model_ready === false) {
    return <span className="chip chip--warning">MODÈLE ABSENT</span>;
  }
  return <span className="chip chip--success">CONNECTÉ</span>;
}

export default function Sidebar({
  health,
  loading,
  activePrompt,
  onClear,
  onSelectPrompt,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark" aria-hidden="true">
          TC
        </div>
        <div>
          <h1 className="brand__title">TechCorp AI</h1>
          <p className="brand__subtitle">Phi-3.5-Financial</p>
        </div>
      </div>

      <section className="card card--default status-card" aria-live="polite">
        <div className="status-card__header">
          <StatusChip health={health} loading={loading} />
        </div>
        <p className="status-card__detail">
          {loading && "Connexion au serveur d'inférence en cours..."}
          {!loading && health?.connected && health.model_ready !== false && (
            <>
              <IconServer size={16} />
              <span>
                {health.backend?.toUpperCase()} — {health.url}
              </span>
            </>
          )}
          {!loading && health?.connected && health.model_ready === false && (
            <>Modèle « {health.model} » non chargé sur le serveur.</>
          )}
          {!loading && !health?.connected && (
            <>{health?.error || "Serveur d'inférence indisponible."}</>
          )}
        </p>
      </section>

      <section className="sidebar__section">
        <h2 className="sidebar__heading">Configuration</h2>

        <label className="field">
          <span className="field__label">
            <IconServer size={16} />
            Backend
          </span>
          <select
            className="input"
            value={health?.configured_backend || "ollama"}
            disabled
          >
            <option value="ollama">Ollama (11434)</option>
            <option value="triton">Triton (8000)</option>
          </select>
          <span className="field__helper">Défini dans le fichier .env</span>
        </label>

        <label className="field">
          <span className="field__label">
            <IconModel size={16} />
            Modèle
          </span>
          <input
            className="input input--mono"
            type="text"
            value={health?.model || "phi3.5-financial"}
            readOnly
          />
        </label>
      </section>

      <section className="sidebar__section sidebar__section--grow">
        <h2 className="sidebar__heading">Suggestions</h2>
        <div className="chip-list" role="list">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              role="listitem"
              className={`chip chip--filter${activePrompt === prompt.label ? " chip--filter-active" : ""}`}
              onClick={() => onSelectPrompt(prompt)}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="btn btn--secondary" onClick={onClear}>
        <IconRefresh size={16} />
        Nouvelle conversation
      </button>
    </aside>
  );
}
