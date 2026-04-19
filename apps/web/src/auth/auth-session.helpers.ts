import type { SessionUser } from "../api";

export const createSessionBootstrap = ({
  loadSession,
  refreshSession
}: {
  loadSession: () => Promise<SessionUser>;
  refreshSession: () => Promise<unknown>;
}) => {
  return async (): Promise<SessionUser | null> => {
    try {
      return await loadSession();
    } catch {
      try {
        await refreshSession();
        return await loadSession();
      } catch {
        return null;
      }
    }
  };
};
