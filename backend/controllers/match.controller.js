import asyncHandler from "../utils/asyncHandler.js";
import { getMatchedJobDetailForUser, getMatchedJobsForUser, runMatchCalculationForUser } from "../services/match.service.js";

export const getMatchedJobs = asyncHandler(async (req, res) => {
  const result = await getMatchedJobsForUser(req.user._id);
  res.status(200).json(result);
});

export const runMatches = asyncHandler(async (req, res) => {
  const result = await runMatchCalculationForUser(req.user._id);
  res.status(200).json({
    message: "Match calculation completed",
    ...result
  });
});

export const getMatchedJob = asyncHandler(async (req, res) => {
  const item = await getMatchedJobDetailForUser(req.user._id, req.params.jobId);
  res.status(200).json({ item });
});
