import { accepted, created } from "../../util/http-response.js";

export const buildRegistrationResponse = <T extends { mail?: Record<string, any> }>(input: T) =>
  created({
    success: true,
    message: "Account created. Verify the email address before signing in.",
    preview: input.mail && "preview" in input.mail ? input.mail.preview : undefined
  });

export const buildVerificationRequestResponse = <T extends { mail?: Record<string, any>; shouldSend?: boolean }>(input: T) =>
  accepted(
    input.shouldSend
      ? {
          success: true,
          message: "Verification email queued.",
          preview: input.mail && "preview" in input.mail ? input.mail.preview : undefined
        }
      : {
          success: true,
          message: "If the account exists, a verification email has been sent."
        }
  );

export const buildVerificationConfirmResponse = <T extends { user: Record<string, any> }>(input: T) =>
  accepted({
    success: true,
    message: "Email verified.",
    user: {
      email: input.user.email,
      displayName: input.user.displayName,
      scopes: input.user.scopes,
      emailVerified: true
    }
  });

export const buildPasswordResetRequestResponse = <T extends { mail?: Record<string, any>; shouldSend?: boolean }>(input: T) =>
  accepted(
    input.shouldSend
      ? {
          success: true,
          message: "If the account exists, a reset email has been sent.",
          preview: input.mail && "preview" in input.mail ? input.mail.preview : undefined
        }
      : {
          success: true,
          message: "If the account exists, a reset email has been sent."
        }
  );

export const buildPasswordResetConfirmResponse = () =>
  accepted({
    success: true,
    message: "Password updated. You can now sign in."
  });

export const buildSocialSignInResponse = <T extends { user: Record<string, any> }>(input: T) =>
  accepted({
    success: true,
    user: {
      email: input.user.email,
      displayName: input.user.displayName,
      scopes: input.user.scopes
    }
  });

export const buildSessionResponse = <T extends { user: Record<string, any> }>(input: T) =>
  accepted({
    success: true,
    user: {
      email: input.user.email,
      displayName: input.user.displayName,
      scopes: input.user.scopes,
      emailVerified: input.user.emailVerified ?? true
    }
  });

export const buildLogoutResponse = () =>
  accepted({
    success: true
  });

export const buildUsersResponse = <T extends { users: Array<Record<string, unknown>> }>(input: T) =>
  accepted({
    success: true,
    users: input.users
  });
