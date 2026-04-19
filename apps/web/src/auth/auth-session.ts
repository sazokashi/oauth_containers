import { sessionApi, type SessionUser } from "../api";
import { pipeAsync } from "../util/fp";
import { createSessionBootstrap } from "./auth-session.helpers";

export const bootstrapSession = async (): Promise<SessionUser | null> => {
  const run = createSessionBootstrap({
    loadSession: async () => {
      const result = await sessionApi.me();
      return result.user;
    },
    refreshSession: () => sessionApi.refresh()
  });

  return pipeAsync(run)(undefined);
};
