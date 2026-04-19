import type { Request } from "express";
import { badRequest } from "../../util/http-response.js";

export interface RegistrationInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface EmailInput {
  email: string;
}

export interface EmailTokenInput {
  email: string;
  token: string;
}

export interface PasswordResetInput {
  email: string;
  token: string;
  password: string;
}

export interface SocialSignInInput {
  email: string;
  providerToken: string;
}

export const parseRegistrationRequest = (request: Request): RegistrationInput => {
  const { email, password, displayName } = request.body ?? {};

  return {
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
    displayName: typeof displayName === "string" ? displayName : undefined
  };
};

export const validateRegistrationInput = (input: RegistrationInput): RegistrationInput => {
  if (!input.email.trim()) {
    badRequest("Email is required.");
  }

  if (!input.password) {
    badRequest("Password is required.");
  }

  return input;
};

export const parseEmailRequest = (request: Request): EmailInput => {
  const { email } = request.body ?? {};

  return {
    email: typeof email === "string" ? email : ""
  };
};

export const validateEmailInput = (input: EmailInput): EmailInput => {
  if (!input.email.trim()) {
    badRequest("Email is required.");
  }

  return input;
};

export const parseVerificationConfirmRequest = (request: Request): EmailTokenInput => {
  const { email, token } = request.body ?? {};

  return {
    email: typeof email === "string" ? email : "",
    token: typeof token === "string" ? token : ""
  };
};

export const validateEmailTokenInput = (input: EmailTokenInput): EmailTokenInput => {
  if (!input.email.trim()) {
    badRequest("Email is required.");
  }

  if (!input.token.trim()) {
    badRequest("Token is required.");
  }

  return input;
};

export const parsePasswordResetRequest = (request: Request): PasswordResetInput => {
  const { email, token, password } = request.body ?? {};

  return {
    email: typeof email === "string" ? email : "",
    token: typeof token === "string" ? token : "",
    password: typeof password === "string" ? password : ""
  };
};

export const validatePasswordResetInput = (input: PasswordResetInput): PasswordResetInput => {
  if (!input.email.trim()) {
    badRequest("Email is required.");
  }

  if (!input.token.trim()) {
    badRequest("Token is required.");
  }

  if (!input.password) {
    badRequest("Password is required.");
  }

  return input;
};

export const parseSocialSignInRequest = (request: Request): SocialSignInInput => {
  const { email, providerToken } = request.body ?? {};

  return {
    email: typeof email === "string" ? email : "",
    providerToken: typeof providerToken === "string" ? providerToken : ""
  };
};

export const validateSocialSignInInput = (input: SocialSignInInput): SocialSignInInput => {
  if (!input.email.trim()) {
    badRequest("Email is required.");
  }

  if (!input.providerToken.trim()) {
    badRequest("Provider token is required.");
  }

  return input;
};
