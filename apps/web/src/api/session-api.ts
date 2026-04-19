import { http } from "./http";

export interface SessionUser {
  email: string;
  displayName: string;
  scopes: string[];
  emailVerified?: boolean;
}

export interface SessionResponse {
  success: true;
  user: SessionUser;
}

export interface LogoutResponse {
  success: true;
}

export const sessionApi = {
  login(email: string, password: string) {
    const body = new URLSearchParams({
      grant_type: "password",
      client_id: "reader-web",
      username: email,
      password,
      scope: "profile:read profile:write"
    });

    return http.postForm("/oauth/token", body);
  },

  me() {
    return http.get<SessionResponse>("/session/me");
  },

  refresh() {
    return http.postJson("/session/refresh", {});
  },

  socialSignIn(email: string) {
    return http.postJson<SessionResponse>("/social/mock", {
      email,
      providerToken: "reader-social-token"
    });
  },

  logout() {
    return http.postJson<LogoutResponse>("/session/logout", {});
  },

  users() {
    return http.get<{ success: true; users: Array<Record<string, unknown>> }>("/users");
  }
};
