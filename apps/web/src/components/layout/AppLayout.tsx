import { NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser, refreshSession } from "../../store/auth-slice";

export const AppLayout = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <p className="eyebrow">oauth_containers</p>
        <h1 className="app-title">Browser Session Template</h1>
        <p className="sidebar-copy">
          A generic teaching portal for cookie-backed sessions, CSRF-protected writes, scoped API access,
          and account lifecycle flows.
        </p>

        <nav className="app-nav">
          <NavLink to="/app/dashboard" className="nav-link">Dashboard</NavLink>
          <NavLink to="/app/profile" className="nav-link">Profile</NavLink>
          <NavLink to="/app/users" className="nav-link">Users</NavLink>
        </nav>

        <div className="sidebar-card">
          <span className="sidebar-label">Active identity</span>
          <strong>{user?.displayName}</strong>
          <span>{user?.email}</span>
          <span>{user?.emailVerified ? "Verified email" : "Verification pending"}</span>
        </div>

        <div className="button-column">
          <button type="button" onClick={() => void dispatch(refreshSession())}>Refresh Session</button>
          <button type="button" className="ghost-button" onClick={() => void dispatch(logoutUser())}>Log Out</button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};
