import StatusCard from "./StatusCard";

const PROMPTS = [
  {
    label: "Diversification de portefeuille",
    text: "Explique-moi la diversification de portefeuille pour un analyste junior.",
  },
  {
    label: "Indicateurs financiers clés",
    text: "Quels indicateurs surveiller pour évaluer la santé financière d'une entreprise ?",
  },
  {
    label: "Comprendre les ETF",
    text: "Comment fonctionne un ETF et quels sont ses avantages ?",
  },
];

export default function Sidebar({ health, loading, onClear, onSelectPrompt }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">TC</div>
        <div>
          <h1>TechCorp AI</h1>
          <p>Phi-3.5-Financial</p>
        </div>
      </div>

      <StatusCard health={health} loading={loading} />

      <div className="sidebar-section">
        <h2>Paramètres</h2>
        <label className="field">
          <span>Backend</span>
          <select value={health?.configured_backend || "ollama"} disabled>
            <option value="ollama">Ollama (11434)</option>
            <option value="triton">Triton (8000)</option>
          </select>
        </label>
        <label className="field">
          <span>Modèle</span>
          <input type="text" value={health?.model || "phi3.5-financial"} readOnly />
        </label>
      </div>

      <div className="sidebar-section">
        <h2>Suggestions</h2>
        {PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            type="button"
            className="prompt-chip"
            onClick={() => onSelectPrompt(prompt.text)}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      <button type="button" className="btn-secondary" onClick={onClear}>
        Nouvelle conversation
      </button>
    </aside>
  );
}
