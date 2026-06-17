import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
import ApiError from "../utils/ApiError.js";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true
});

export function ensureCloudinaryConfigured() {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new ApiError(500, "Cloudinary is not configured. Add Cloudinary environment variables.");
  }
}

export default cloudinary;
