import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { accountApi } from "../../api";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("reader@example.com");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await accountApi.requestPasswordReset(email);
      setMessage(result.preview?.previewUrl ?? result.message ?? "Reset requested.");
      navigate(`/reset-password?email=${encodeURIComponent(email)}${result.preview?.token ? `&token=${encodeURIComponent(result.preview.token)}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shell">
      <div className="panel auth-panel">
        <p className="eyebrow">Recovery Start</p>
        <h1>Request a password reset</h1>
        <p className="copy">
          Password reset uses short-lived records rather than exposing session tokens or permanently valid recovery links.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          {message ? <p className="success">{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}

          <button type="submit" disabled={submitting}>Request Reset Link</button>
        </form>

        <div className="link-row">
          <Link to="/reset-password">Have a token already?</Link>
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};
