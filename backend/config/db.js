import mongoose from "mongoose";
import { env } from "./env.js";

export default async function connectDB() {
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production"
  });
  console.log("MongoDB connected");
}
