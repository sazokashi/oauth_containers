import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./env.js";
import { attachCookieBearerToken, clearBrowserSessionCookies, enforceCsrf } from "./auth/csrf.js";
import { authRouter } from "./auth/routes.js";
import { generalApiLimiter } from "./util/rate-limit.js";
import { requestLog } from "./util/logger.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: env.webOrigin,
    credentials: true
  })
);
app.use((request, _response, next) => {
  requestLog({
    method: request.method,
    path: request.path,
    ip: request.ip
  });
  next();
});
app.use(generalApiLimiter);

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.use(attachCookieBearerToken);
app.use(enforceCsrf);
app.use("/api", authRouter);

app.use((error: any, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const status = error.code === 3 ? 400 : error.status || 500;
  if (status === 401 || status === 400) {
    clearCookies(response);
  }
  response.status(status).json({
    success: false,
    message: error.message || "Internal server error."
  });
});

function clearCookies(response: express.Response) {
  clearBrowserSessionCookies(response);
}
