import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { registerUser } from "../../store/auth-slice";

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Example Reader");
  const [email, setEmail] = useState("reader@example.com");
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
      const result = await dispatch(registerUser({ email, password, displayName })).unwrap();
      setMessage(result.previewUrl ?? result.message ?? "Account created.");
      navigate(`/verify-email?email=${encodeURIComponent(email)}${result.token ? `&token=${encodeURIComponent(result.token)}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shell">
      <div className="panel auth-panel">
        <p className="eyebrow">Account Creation</p>
        <h1>Create a password account</h1>
        <p className="copy">
          Registration persists the user record, generates a verification artifact, and optionally exposes a
          preview URL when live mail delivery is not configured.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>Display name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>

          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          {message ? <p className="success">{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}

          <button type="submit" disabled={submitting}>Create Account</button>
        </form>

        <div className="link-row">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};
