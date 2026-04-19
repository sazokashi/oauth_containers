import { http } from "./http";
import type { SessionResponse } from "./session-api";

interface PreviewPayload {
  kind: string;
  email: string;
  token: string;
  previewUrl: string;
}

export interface MessageResponse {
  success: boolean;
  message?: string;
  preview?: PreviewPayload;
}

export const accountApi = {
  register(email: string, password: string, displayName: string) {
    return http.postJson<MessageResponse>("/users/register", { email, password, displayName });
  },

  requestVerification(email: string) {
    return http.postJson<MessageResponse>("/users/verify/request", { email });
  },

  confirmVerification(email: string, token: string) {
    return http.postJson<SessionResponse>("/users/verify/confirm", { email, token });
  },

  requestPasswordReset(email: string) {
    return http.postJson<MessageResponse>("/password/forgot", { email });
  },

  resetPassword(email: string, token: string, password: string) {
    return http.postJson<MessageResponse>("/password/reset", { email, token, password });
  }
};
