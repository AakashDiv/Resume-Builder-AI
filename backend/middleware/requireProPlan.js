import ApiError from "../utils/ApiError.js";

export default function requireProPlan(req, _res, next) {
  if (!req.user || req.user.plan !== "pro") {
    return next(new ApiError(403, "Pro plan required for this feature"));
  }

  return next();
}
