import { sendPasswordResetEmail, sendVerificationEmail } from "../../util/mailer.js";
import { logger } from "../../util/logger.js";

export const deliverVerificationEmail = async <
  T extends { user: { email: string }; verificationToken: string }
>(
  input: T
) => {
  const mail = await sendVerificationEmail({
    email: input.user.email,
    token: input.verificationToken
  });

  return {
    ...input,
    mail
  };
};

export const deliverVerificationEmailIfEligible = async <
  T extends { user: { email: string } | null; verificationToken?: string; shouldSend?: boolean }
>(
  input: T
) => {
  if (!input.shouldSend || !input.user || !input.verificationToken) {
    return input;
  }

  const mail = await sendVerificationEmail({
    email: input.user.email,
    token: input.verificationToken
  });

  return {
    ...input,
    mail
  };
};

export const deliverPasswordResetEmailIfEligible = async <
  T extends { user: { email: string } | null; resetToken?: string; shouldSend?: boolean }
>(
  input: T
) => {
  if (!input.shouldSend || !input.user || !input.resetToken) {
    return input;
  }

  const mail = await sendPasswordResetEmail({
    email: input.user.email,
    token: input.resetToken
  });

  logger.info("password.reset.requested", { email: input.user.email });

  return {
    ...input,
    mail
  };
};
