import { getDb } from "../../db/mongo.js";
import { getRedis } from "../../db/redis.js";

export const deleteSessionTokens = async ({
  accessToken,
  refreshToken
}: {
  accessToken: string;
  refreshToken?: string;
}) => {
  await getDb().collection("oauth_tokens").deleteMany({
    $or: [
      { accessToken },
      ...(refreshToken ? [{ refreshToken }] : [])
    ]
  });

  await getRedis().del(`token:${accessToken}`);
};
