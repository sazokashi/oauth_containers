import dotenv from "dotenv";

dotenv.config();

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const env = {
  apiPort: Number(required("API_PORT", "3001")),
  webOrigin: required("WEB_ORIGIN", "http://localhost:5173"),
  appBaseUrl: required("APP_BASE_URL", "http://localhost:5173"),
  mongoUrl: required("MONGO_URL"),
  mongoDbName: required("MONGO_DB_NAME", "oauth_containers"),
  redisUrl: required("REDIS_URL"),
  demoEmail: required("DEMO_EMAIL", "reader@example.com"),
  demoPassword: required("DEMO_PASSWORD", "ChangeMe123!"),
  oauthClientId: required("OAUTH_CLIENT_ID", "reader-web"),
  oauthClientSecret: process.env.OAUTH_CLIENT_SECRET ?? "",
  mailFrom: required("MAIL_FROM", "auth-demo@example.com"),
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production"
};
