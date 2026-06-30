import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const data = await signUp(email, password, displayName);
      if (data.session) {
        navigate("/", { replace: true });
      } else {
        setSuccess(
          "Compte créé ! Vérifiez votre e-mail si la confirmation est activée, puis connectez-vous.",
        );
      }
    } catch (err) {
      setError(err.message || "Impossible de créer le compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card card--elevated">
        <div className="auth-card__brand">
          <div className="brand__mark" aria-hidden="true">
            TC
          </div>
          <div>
            <h1 className="auth-card__title">Créer un compte</h1>
            <p className="auth-card__subtitle">Rejoignez TechCorp AI Chat</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Nom d'affichage</span>
            <input
              className="input"
              type="text"
              autoComplete="name"
              placeholder="Marie Analyste"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Adresse e-mail</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="analyste@techcorp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Mot de passe</span>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="6 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Confirmer le mot de passe</span>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="field__error">{error}</p>}
          {success && <p className="field__success">{success}</p>}

          <button type="submit" className="btn btn--primary btn--lg auth-form__submit" disabled={loading}>
            {loading ? "Création…" : "S'inscrire"}
          </button>
        </form>

        <p className="auth-card__footer">
          Déjà un compte ?{" "}
          <Link to="/login" className="auth-link">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
