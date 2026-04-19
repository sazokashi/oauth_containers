import { upsertMockSocialUser } from "../users.js";

export const upsertSocialUser = async <T extends { email: string }>(input: T) => {
  const user = await upsertMockSocialUser({
    email: input.email,
    provider: "mock-social"
  });

  return {
    ...input,
    user
  };
};
