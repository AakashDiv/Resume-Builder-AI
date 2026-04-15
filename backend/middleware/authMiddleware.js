import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";

export default async function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Authorization token missing"));
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).select("_id name email plan createdAt");

    if (!user) {
      return next(new ApiError(401, "Invalid token"));
    }

    req.user = user;
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}
