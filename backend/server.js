import app from "./config/app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";
import { initializeAutoApplyWorker } from "./services/queueService.js";
import { startJobMatcherScheduler } from "./scheduler/jobMatcher.js";

async function startServer() {
  await connectDB();
  initializeAutoApplyWorker();
  startJobMatcherScheduler();
  app.listen(env.port, "0.0.0.0", () => {
    console.log(`Backend running on 0.0.0.0:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
