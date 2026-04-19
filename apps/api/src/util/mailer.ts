import { randomBytes } from "crypto";
import { Resend } from "resend";
import { env } from "../env.js";
import { logger } from "./logger.js";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export const randomToken = (bytes = 24) => randomBytes(bytes).toString("hex");

const buildPreviewUrl = (path: string, token: string, email: string) => {
  const url = new URL(path, env.appBaseUrl);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  return url.toString();
};

const sendOrPreview = async ({
  to,
  subject,
  html,
  preview
}: {
  to: string;
  subject: string;
  html: string;
  preview: Record<string, unknown>;
}) => {
  if (!resend) {
    logger.info("mail.preview", preview);
    return { delivered: false, preview };
  }

  await resend.emails.send({
    from: env.mailFrom,
    to,
    subject,
    html
  });

  logger.info("mail.sent", { to, subject });
  return { delivered: true };
};

export const sendVerificationEmail = async ({ email, token }: { email: string; token: string }) => {
  const previewUrl = buildPreviewUrl("/verify-email", token, email);
  return sendOrPreview({
    to: email,
    subject: "Verify your email address",
    html: `<p>Open this link to verify your email:</p><p><a href="${previewUrl}">${previewUrl}</a></p>`,
    preview: { kind: "verify-email", email, token, previewUrl }
  });
};

export const sendPasswordResetEmail = async ({ email, token }: { email: string; token: string }) => {
  const previewUrl = buildPreviewUrl("/reset-password", token, email);
  return sendOrPreview({
    to: email,
    subject: "Reset your password",
    html: `<p>Open this link to reset your password:</p><p><a href="${previewUrl}">${previewUrl}</a></p>`,
    preview: { kind: "reset-password", email, token, previewUrl }
  });
};
