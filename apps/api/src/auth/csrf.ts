import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { env } from "../env.js";

export const authCookieName = "session_token";
export const refreshCookieName = "refresh_token";
export const csrfCookieName = "csrf_token";
export const csrfHeaderName = "x-csrf-token";

const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.isProduction,
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7
};

const csrfCookieOptions = {
  httpOnly: false,
  sameSite: "lax" as const,
  secure: env.isProduction,
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7
};

export const generateCsrfToken = () => crypto.randomBytes(24).toString("hex");

export const setBrowserSessionCookies = (response: Response, accessToken: string) => {
  response.cookie(authCookieName, accessToken, authCookieOptions);
  response.cookie(csrfCookieName, generateCsrfToken(), csrfCookieOptions);
};

export const setRefreshCookie = (response: Response, refreshToken: string) => {
  response.cookie(refreshCookieName, refreshToken, authCookieOptions);
};

export const clearBrowserSessionCookies = (response: Response) => {
  response.clearCookie(authCookieName, { path: "/" });
  response.clearCookie(refreshCookieName, { path: "/" });
  response.clearCookie(csrfCookieName, { path: "/" });
};

export const attachCookieBearerToken = (request: Request, _response: Response, next: NextFunction) => {
  if (!request.headers.authorization && request.cookies?.[authCookieName]) {
    request.headers.authorization = `Bearer ${request.cookies[authCookieName]}`;
  }
  next();
};

export const enforceCsrf = (request: Request, response: Response, next: NextFunction) => {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    next();
    return;
  }

  if (!request.cookies?.[authCookieName]) {
    next();
    return;
  }

  const cookieToken = request.cookies?.[csrfCookieName];
  const headerToken = request.headers[csrfHeaderName] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length) {
    response.status(403).json({ success: false, message: "CSRF validation failed." });
    return;
  }

  const valid = crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
  if (!valid) {
    response.status(403).json({ success: false, message: "CSRF validation failed." });
    return;
  }

  next();
};
