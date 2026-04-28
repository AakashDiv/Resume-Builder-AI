import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(backendRoot, "..");
const externalEnv = { ...process.env };

const nodeEnv = process.env.NODE_ENV || "development";
const envFile = `.env.${nodeEnv}`;

if (nodeEnv === "test") {
  dotenv.config({ path: path.resolve(backendRoot, ".env.test") });
  dotenv.config({ path: path.resolve(projectRoot, ".env.test"), override: false });
} else {
  dotenv.config({ path: path.resolve(backendRoot, ".env") });
  dotenv.config({ path: path.resolve(backendRoot, envFile), override: true });
  dotenv.config({ path: path.resolve(projectRoot, ".env"), override: false });
  dotenv.config({ path: path.resolve(projectRoot, envFile), override: true });
}

Object.assign(process.env, externalEnv);

const requiredVars = ["MONGO_URI", "JWT_SECRET"];
for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  clientBaseUrl: process.env.CLIENT_BASE_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID || "",
  pythonBin: process.env.PYTHON_BIN || "python"
};
