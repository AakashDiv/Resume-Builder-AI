import { validationResult } from "express-validator";
import { loginUser, registerUser } from "../services/auth.service.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

function ensureValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    throw new ApiError(400, firstError.msg);
  }
}

export const register = asyncHandler(async (req, res) => {
  ensureValid(req);
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  ensureValid(req);
  const result = await loginUser(req.body);
  res.status(200).json(result);
});
