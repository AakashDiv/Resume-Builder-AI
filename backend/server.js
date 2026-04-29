import app from "./config/app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  await connectDB();
  app.listen(env.port, "0.0.0.0", () => {
    console.log(`Backend running on 0.0.0.0:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
