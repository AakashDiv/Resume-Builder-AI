import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { buildResumeWithAI } from "../services/resume.service.js";
import { improveResumeFromUpload } from "../services/resumeImprove.service.js";
import { scoreResumeAgainstJobDescription } from "../services/resumeScore.service.js";
import { tailorResumeToJob } from "../services/resumeTailor.service.js";

export const generateResume = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const result = await buildResumeWithAI(req.body);

  res.status(200).json({
    markdownResume: result.markdownResume,
    suggestions: result.suggestions
  });
});

export const improveResume = asyncHandler(async (req, res) => {
  const result = await improveResumeFromUpload(req.file);

  res.status(200).json(result);
});

export const scoreResume = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const result = scoreResumeAgainstJobDescription(req.body);
  res.status(200).json(result);
});

export const tailorResume = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const result = await tailorResumeToJob(req.body);
  res.status(200).json(result);
});
