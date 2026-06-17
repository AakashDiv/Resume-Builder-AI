import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  if (!env.adminEmail || !env.adminPassword) {
    throw new ApiError(503, "Admin credentials not configured");
  }

  const emailMatch = String(email).toLowerCase().trim() === env.adminEmail.toLowerCase().trim();
  const passwordMatch = String(password) === env.adminPassword;

  if (!emailMatch || !passwordMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    { role: "superadmin", email: env.adminEmail },
    env.adminJwtSecret,
    { expiresIn: "7d" }
  );

  res.json({ token, email: env.adminEmail });
});

export const verifyAdmin = asyncHandler(async (req, res) => {
  res.json({ ok: true, email: req.superAdmin.email });
});
