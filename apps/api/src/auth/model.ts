import bcrypt from "bcrypt";
import { getDb } from "../db/mongo.js";
import { getRedis } from "../db/redis.js";
import type { SavedTokenRecord } from "./types.js";

const normalizeToken = (value: any): SavedTokenRecord | false => {
  if (!value?.accessToken) return false;
  return {
    accessToken: value.accessToken,
    accessTokenExpiresAt: new Date(value.accessTokenExpiresAt),
    refreshToken: value.refreshToken,
    refreshTokenExpiresAt: value.refreshTokenExpiresAt ? new Date(value.refreshTokenExpiresAt) : undefined,
    scope: value.scope,
    client: value.client,
    user: value.user
  };
};

export const storageModel = {
  getClient: async (clientId: string, clientSecret: string) => {
    const client = await getDb().collection("oauth_clients").findOne(
      clientSecret
        ? { clientId, clientSecret }
        : { clientId, publicClient: true }
    );
    if (!client) return false;

    return {
      id: client.clientId,
      grants: client.grants
    };
  },

  getUser: async (username: string, password: string) => {
    const user = await getDb().collection("users").findOne({ email: username });
    if (!user) return false;
    if (user.authMethod === "password" && user.emailVerified !== true) return false;
    if (!user.passwordHash) return false;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return false;

    return {
      email: user.email,
      displayName: user.displayName,
      scopes: user.scopes,
      emailVerified: user.emailVerified
    };
  },

  saveToken: async (token: any, client: any, user: any) => {
    const record: SavedTokenRecord = {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scope: token.scope ?? user.scopes,
      client,
      user
    };

    await getDb().collection("oauth_tokens").updateOne(
      { accessToken: record.accessToken },
      { $set: record },
      { upsert: true }
    );

    await getRedis().set(
      `token:${record.accessToken}`,
      JSON.stringify(record),
      { EX: 300 }
    );

    return record;
  },

  getAccessToken: async (accessToken: string) => {
    const cached = await getRedis().get(`token:${accessToken}`);
    if (cached) {
      return normalizeToken(JSON.parse(cached));
    }

    const record = await getDb().collection("oauth_tokens").findOne({ accessToken });
    if (!record) return false;

    await getRedis().set(`token:${accessToken}`, JSON.stringify(record), { EX: 300 });
    return normalizeToken(record);
  },

  getRefreshToken: async (refreshToken: string) => {
    const record = await getDb().collection("oauth_tokens").findOne({ refreshToken });
    if (!record) return false;
    return normalizeToken(record);
  },

  revokeToken: async (token: any) => {
    const deleted = await getDb().collection("oauth_tokens").deleteOne({ refreshToken: token.refreshToken });

    if (token.accessToken) {
      await getRedis().del(`token:${token.accessToken}`);
    }

    return deleted.deletedCount > 0;
  },

  validateScope: (user: any, _client: any, scope: string | string[]) => {
    const requested = typeof scope === "string" ? scope.split(" ") : scope;
    const granted = requested.filter((item) => user.scopes.includes(item));
    return granted.length > 0 ? granted : false;
  },

  verifyScope: (token: any, scope: string | string[]) => {
    const requested = typeof scope === "string" ? scope.split(" ") : scope;
    const actual = Array.isArray(token.scope) ? token.scope : String(token.scope || "").split(" ");
    return requested.every((item) => actual.includes(item));
  }
};
