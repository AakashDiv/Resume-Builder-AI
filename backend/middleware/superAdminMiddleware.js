import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

export default function superAdminMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Admin authorization token missing"));
  }

  try {
    const payload = jwt.verify(token, env.adminJwtSecret);
    if (payload.role !== "superadmin") {
      return next(new ApiError(403, "Super admin access required"));
    }
    req.superAdmin = { email: payload.email, role: payload.role };
    return next();
  } catch (_err) {
    return next(new ApiError(401, "Invalid or expired admin token"));
  }
}
