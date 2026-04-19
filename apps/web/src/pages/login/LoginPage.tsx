import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-context";

export const LoginPage = () => {
  const { login, socialSignIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("reader@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = async () => {
    setSubmitting(true);
    setError("");

    try {
      await socialSignIn(email);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mock social sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shell">
      <div className="panel auth-panel">
        <p className="eyebrow">Session Entry</p>
        <h1>Sign in to the template portal</h1>
        <p className="copy">
          The browser never handles raw access tokens directly. The API translates successful authentication
          into cookie-backed session state and guards writes with CSRF validation.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          {error ? <p className="error">{error}</p> : null}

          <div className="button-column">
            <button type="submit" disabled={submitting}>Password Sign In</button>
            <button type="button" className="ghost-button" disabled={submitting} onClick={() => void handleSocial()}>
              Mock Social Sign In
            </button>
          </div>
        </form>

        <div className="link-row">
          <Link to="/register">Create account</Link>
          <Link to="/verify-email">Verify email</Link>
          <Link to="/forgot-password">Reset password</Link>
        </div>
      </div>
    </div>
  );
};
