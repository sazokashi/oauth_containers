import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountApi } from "../../api";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "reader@example.com");
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("ChangeMe123!");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await accountApi.resetPassword(email, token, password);
      setMessage(result.message ?? "Password updated.");
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shell">
      <div className="panel auth-panel">
        <p className="eyebrow">Recovery Completion</p>
        <h1>Set a new password</h1>
        <p className="copy">
          The reset token and the new credential are submitted in a dedicated flow, separate from regular sign-in.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label>
            <span>Reset token</span>
            <input value={token} onChange={(event) => setToken(event.target.value)} />
          </label>

          <label>
            <span>New password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          {message ? <p className="success">{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}

          <button type="submit" disabled={submitting}>Update Password</button>
        </form>

        <div className="link-row">
          <Link to="/forgot-password">Request a new token</Link>
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};
