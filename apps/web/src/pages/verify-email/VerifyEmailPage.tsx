import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountApi } from "../../api";
import { useAuth } from "../../auth/auth-context";

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { reloadUser } = useAuth();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "reader@example.com");
  const [token, setToken] = useState(params.get("token") ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const requestVerification = async () => {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await accountApi.requestVerification(email);
      setMessage(result.preview?.previewUrl ?? result.message ?? "Verification email requested.");
      if (result.preview?.token) {
        setToken(result.preview.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmVerification = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await accountApi.confirmVerification(email, token);
      await reloadUser();
      navigate("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shell">
      <div className="panel auth-panel">
        <p className="eyebrow">Email Verification</p>
        <h1>Confirm account ownership</h1>
        <p className="copy">
          Verification proves the address is live before password sign-in is permitted. In preview mode, the
          tokenized verification link is surfaced directly in the UI.
        </p>

        <form onSubmit={confirmVerification} className="form">
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label>
            <span>Verification token</span>
            <input value={token} onChange={(event) => setToken(event.target.value)} />
          </label>

          {message ? <p className="success">{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}

          <div className="button-column">
            <button type="submit" disabled={submitting}>Verify Email</button>
            <button type="button" className="ghost-button" disabled={submitting} onClick={() => void requestVerification()}>
              Request Verification Link
            </button>
          </div>
        </form>

        <div className="link-row">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};
