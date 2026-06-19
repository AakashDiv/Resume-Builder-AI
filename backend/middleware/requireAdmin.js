import ApiError from "../utils/ApiError.js";

export default function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    return next(new ApiError(403, "Admin access required"));
  }

  return next();
}
