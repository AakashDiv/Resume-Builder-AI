import asyncHandler from "../utils/asyncHandler.js";
import { applyToJobManually, getQueueStatus, setAutoApplyEnabled } from "../services/application.service.js";

export const enableAutoApply = asyncHandler(async (req, res) => {
  const result = await setAutoApplyEnabled(req.user._id, req.body.enabled);
  res.status(200).json(result);
});

export const manualApply = asyncHandler(async (req, res) => {
  const application = await applyToJobManually(req.user._id, req.params.jobId);
  res.status(200).json({ application });
});

export const queueStatus = asyncHandler(async (req, res) => {
  const result = await getQueueStatus(req.user._id);
  res.status(200).json(result);
});
