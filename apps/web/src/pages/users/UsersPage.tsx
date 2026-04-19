import { useEffect, useState } from "react";
import { sessionApi } from "../../api";

export const UsersPage = () => {
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void sessionApi.users()
      .then((result) => {
        setUsers(result.users);
        setError("");
      })
      .catch((err) => {
        setUsers([]);
        setError(err instanceof Error ? err.message : "Failed to load users.");
      });
  }, []);

  return (
    <section className="content-panel">
      <p className="eyebrow">User Records</p>
      <h2>Durable account state</h2>
      <p className="copy">
        This view demonstrates a protected read from the API after session bootstrap has already succeeded.
      </p>

      {error ? <p className="error">{error}</p> : null}

      <div className="table-card">
        <div className="users-header">
          <span>Name</span>
          <span>Email</span>
          <span>Method</span>
        </div>

        {users.map((entry) => (
          <div key={String(entry.email)} className="users-row">
            <span>{String(entry.displayName)}</span>
            <span>{String(entry.email)}</span>
            <span>{String(entry.authMethod ?? "password")}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
