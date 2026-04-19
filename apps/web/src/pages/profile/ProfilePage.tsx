import { useAuth } from "../../auth/auth-context";

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <section className="content-panel">
      <p className="eyebrow">Profile</p>
      <h2>Authenticated user context</h2>
      <p className="copy">
        The UI reads identity details from the authenticated session response instead of storing tokens in frontend-managed state.
      </p>

      <div className="detail-list">
        <div className="detail-row">
          <span>Name</span>
          <strong>{user?.displayName}</strong>
        </div>
        <div className="detail-row">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>
        <div className="detail-row">
          <span>Email status</span>
          <strong>{user?.emailVerified ? "Verified" : "Pending verification"}</strong>
        </div>
      </div>

      <div className="info-card">
        <h3>Granted scopes</h3>
        <div className="chip-row">
          {user?.scopes.map((scope) => (
            <span key={scope} className="scope-chip">{scope}</span>
          ))}
        </div>
      </div>
    </section>
  );
};
