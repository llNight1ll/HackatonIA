import {
  IconServer,
  IconModel,
  IconRefresh,
  IconLogOut,
  IconTrash,
  IconPlus,
} from "./Icons";
import { SUGGESTED_PROMPTS } from "../constants/prompts";
import CollapsibleSection from "./CollapsibleSection";

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

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function Sidebar({
  health,
  loading,
  activePrompt,
  profile,
  conversations,
  activeConversationId,
  loadingConversations,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onSelectPrompt,
  onSignOut,
}) {
  const handleDelete = async (event, conversationId) => {
    event.stopPropagation();
    if (!window.confirm("Supprimer cette conversation ?")) return;
    await onDeleteConversation(conversationId);
  };

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

      <div className="sidebar__scroll">
        {profile && (
          <section className="card card--default user-card">
            <p className="user-card__name">{profile.display_name || profile.email}</p>
            <p className="user-card__email">{profile.email}</p>
          </section>
        )}

        <CollapsibleSection title="Connexion" defaultOpen={false}>
          <div className="card card--default status-card status-card--compact" aria-live="polite">
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
          </div>
        </CollapsibleSection>

        {conversations.length > 0 && (
          <label className="field conversation-select-field">
            <span className="field__label">Conversation</span>
            <select
              className="input"
              value={activeConversationId || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value) onSelectConversation(value);
                else onNewConversation();
              }}
            >
              <option value="">Nouvelle conversation</option>
              {conversations.map((conversation) => (
                <option key={conversation.id} value={conversation.id}>
                  {conversation.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <CollapsibleSection
          title="Historique"
          badge={conversations.length || null}
          defaultOpen={false}
          headerAction={
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              onClick={onNewConversation}
              aria-label="Nouvelle conversation"
              title="Nouvelle conversation"
            >
              <IconPlus size={18} />
            </button>
          }
        >
          <div className="conversation-list" role="list">
            {loadingConversations && (
              <p className="conversation-list__empty">Chargement...</p>
            )}
            {!loadingConversations && conversations.length === 0 && (
              <p className="conversation-list__empty">
                Aucune conversation. Envoyez un message pour commencer.
              </p>
            )}
            {!loadingConversations &&
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  role="listitem"
                  className={`conversation-item${
                    activeConversationId === conversation.id
                      ? " conversation-item--active"
                      : ""
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="conversation-item__body">
                    <span className="conversation-item__title">{conversation.title}</span>
                    <span className="conversation-item__date">
                      {formatDate(conversation.updated_at)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost btn--icon conversation-item__delete"
                    onClick={(e) => handleDelete(e, conversation.id)}
                    aria-label="Supprimer la conversation"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Configuration">
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
        </CollapsibleSection>

        <CollapsibleSection title="Suggestions">
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
        </CollapsibleSection>
      </div>

      <div className="sidebar__actions">
        <button type="button" className="btn btn--secondary" onClick={onNewConversation}>
          <IconRefresh size={16} />
          Nouvelle conversation
        </button>
        <button type="button" className="btn btn--ghost btn--logout" onClick={onSignOut}>
          <IconLogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
