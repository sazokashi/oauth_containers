import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser, socialSignIn } from "../../store/auth-slice";

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const authError = useAppSelector((state) => state.auth.error);
  const navigate = useNavigate();
  const [email, setEmail] = useState("reader@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate("/app/dashboard");
    } catch {
      // error is captured in authSlice state
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = async () => {
    setSubmitting(true);

    try {
      await dispatch(socialSignIn({ email })).unwrap();
      navigate("/app/dashboard");
    } catch {
      // error is captured in authSlice state
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

          {authError ? <p className="error">{authError}</p> : null}

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
