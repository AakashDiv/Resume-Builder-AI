import asyncHandler from "../utils/asyncHandler.js";
import { getAutomationSettings, setAutomaticWorkEnabled } from "../services/automationSettings.service.js";
import { getSchedulerRuntimeStatus, runDailyDigest, runDailyJobMatcher } from "../scheduler/jobMatcher.js";

function buildSchedulerResponse(settings) {
  return {
    automaticWorkEnabled: Boolean(settings.schedulerEnabled && settings.autoWorkEnabled),
    settings,
    runtime: getSchedulerRuntimeStatus()
  };
}

export const getSchedulerStatus = asyncHandler(async (_req, res) => {
  const settings = await getAutomationSettings();
  res.status(200).json(buildSchedulerResponse(settings));
});

export const enableScheduler = asyncHandler(async (req, res) => {
  const settings = await setAutomaticWorkEnabled(true, req.user._id);
  res.status(200).json(buildSchedulerResponse(settings));
});

export const disableScheduler = asyncHandler(async (req, res) => {
  const settings = await setAutomaticWorkEnabled(false, req.user._id);
  res.status(200).json(buildSchedulerResponse(settings));
});

export const runSchedulerNow = asyncHandler(async (_req, res) => {
  const result = await runDailyJobMatcher({ force: true });
  res.status(200).json({
    message: "Scheduler job matcher completed",
    result,
    runtime: getSchedulerRuntimeStatus()
  });
});

export const runDigestNow = asyncHandler(async (_req, res) => {
  const result = await runDailyDigest({ force: true });
  res.status(200).json({
    message: "Daily digest completed",
    result,
    runtime: getSchedulerRuntimeStatus()
  });
});
