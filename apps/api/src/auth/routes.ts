import { Router } from "express";
import { issueToken, refreshBrowserSession } from "./oauth.js";
import { loginLimiter } from "../util/rate-limit.js";
import { accountRouter } from "./routes/account-routes.js";
import { sessionRouter } from "./routes/session-routes.js";

export const authRouter = Router();

authRouter.post("/oauth/token", loginLimiter, issueToken());
authRouter.post("/session/refresh", refreshBrowserSession());
authRouter.use(accountRouter);
authRouter.use(sessionRouter);
