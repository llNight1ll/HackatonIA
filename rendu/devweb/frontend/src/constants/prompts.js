export const WELCOME_MESSAGE = {
  role: "assistant",
  isSystem: true,
  content:
    "Bonjour, je suis l'assistant financier TechCorp basé sur Phi-3.5-Financial.\nJe peux vous aider sur l'analyse financière, les marchés, la gestion de budget et les concepts économiques.",
};

export const RESET_MESSAGE = {
  role: "assistant",
  isSystem: true,
  content:
    "Nouvelle conversation démarrée.\nComment puis-je vous aider sur vos sujets financiers ?",
};

export const SUGGESTED_PROMPTS = [
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
