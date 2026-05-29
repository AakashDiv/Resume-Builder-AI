import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import authRoutes from "../routes/auth.routes.js";
import billingRoutes from "../routes/billing.routes.js";
import scraperRoutes from "../routes/scraper.routes.js";
import protectedRoutes from "../routes/protected.routes.js";
import resumeRoutes from "../routes/resume.routes.js";
import profileRoutes from "../routes/profile.routes.js";
import matchRoutes from "../routes/match.routes.js";
import applyRoutes from "../routes/apply.routes.js";
import applicationsRoutes from "../routes/applications.routes.js";
import schedulerRoutes from "../routes/scheduler.routes.js";
import { stripeWebhook } from "../controllers/billing.controller.js";
import { env } from "./env.js";

import notFound from "../middleware/notFound.js";
import errorHandler from "../middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOADS_DIR = path.resolve(__dirname, "..", "tmp");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  })
);
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use("/downloads", express.static(DOWNLOADS_DIR));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (_, res) => {
  res.json({ ok: true, service: "backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/scraper", scraperRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/apply", applyRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/scheduler", schedulerRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
