export interface DemoUser {
  email: string;
  passwordHash: string;
  displayName: string;
  scopes: string[];
  createdAt: Date;
}

export interface OAuthClientRecord {
  clientId: string;
  clientSecret: string;
  publicClient?: boolean;
  grants: string[];
  createdAt: Date;
}

export interface SavedTokenRecord {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
  scope: string[] | string;
  client: {
    id: string;
    grants: string[];
  };
  user: {
    email: string;
    displayName: string;
    scopes: string[];
  };
}
