import asyncHandler from "../utils/asyncHandler.js";
import { getApplicationForUser, listApplicationsForUser, updateApplicationStatusForUser } from "../services/application.service.js";

export const listApplications = asyncHandler(async (req, res) => {
  const result = await listApplicationsForUser(req.user._id);
  res.status(200).json(result);
});

export const getApplication = asyncHandler(async (req, res) => {
  const item = await getApplicationForUser(req.user._id, req.params.id);
  res.status(200).json({ item });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const item = await updateApplicationStatusForUser(
    req.user._id,
    req.params.id,
    req.body.status,
    req.body.failReason
  );

  res.status(200).json({ item });
});
