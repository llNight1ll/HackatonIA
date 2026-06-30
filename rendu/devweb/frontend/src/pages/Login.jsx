import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Identifiants invalides");
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
            <h1 className="auth-card__title">TechCorp AI</h1>
            <p className="auth-card__subtitle">Connectez-vous à votre assistant financier</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="field__error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--lg auth-form__submit" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="auth-card__footer">
          Pas encore de compte ?{" "}
          <Link to="/register" className="auth-link">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
