export default function StatusCard({ health, loading }) {
  const connected = health?.connected;
  const dotClass = loading
    ? "status-dot"
    : connected
      ? "status-dot connected"
      : "status-dot disconnected";

  const label = loading
    ? "Vérification..."
    : connected
      ? "Connecté"
      : "Déconnecté";

  let detail = "Connexion au serveur d'inférence";
  if (!loading && health) {
    if (connected) {
      detail =
        health.model_ready === false
          ? `Serveur OK, modèle "${health.model}" non chargé`
          : `${health.backend?.toUpperCase()} — ${health.url}`;
    } else {
      detail = health.error || "Serveur d'inférence indisponible";
    }
  }

  return (
    <div className="status-card">
      <div className="status-row">
        <span className={dotClass} />
        <span>{label}</span>
      </div>
      <p className="status-detail">{detail}</p>
    </div>
  );
}
