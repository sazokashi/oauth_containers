import { useAppSelector } from "../../store/hooks";

export const DashboardPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <section className="content-panel">
      <p className="eyebrow">Dashboard</p>
      <h2>Protected application shell</h2>
      <p className="copy">
        This route is reachable only after the backend authenticates the browser session and confirms the required scope.
      </p>

      <div className="hero-card">
        <div>
          <span className="stat-label">Current identity</span>
          <strong className="stat-value">{user?.displayName}</strong>
        </div>
        <div>
          <span className="stat-label">Session posture</span>
          <strong className="stat-value">{user?.emailVerified ? "Verified and active" : "Authenticated but unverified"}</strong>
        </div>
      </div>

      <div className="card-grid">
        <article className="info-card">
          <h3>Trust boundary</h3>
          <p>The browser uses cookies for session continuity while CSRF protects state-changing requests.</p>
        </article>

        <article className="info-card">
          <h3>Durable state</h3>
          <p>User records and token artifacts live in MongoDB so auth survives API restarts and cache loss.</p>
        </article>

        <article className="info-card">
          <h3>Hot-path cache</h3>
          <p>Redis accelerates access-token lookups and centralizes limiter state across API instances.</p>
        </article>
      </div>
    </section>
  );
};
