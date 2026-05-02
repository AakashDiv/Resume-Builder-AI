import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { executeScraper } from "../services/scraper.service.js";
import { runMatchCalculationForUser, upsertJobsFromRows } from "../services/match.service.js";

export const runScraper = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const data = await executeScraper(req.body || {});
  const savedJobs = await upsertJobsFromRows(data.jobs || []);

  let matchSummary = {
    processedJobs: 0,
    matchesComputed: 0,
    autoQueuedCount: 0,
    queuedCount: 0
  };

  if (savedJobs.length) {
    try {
      matchSummary = await runMatchCalculationForUser(req.user._id, { jobs: savedJobs });
    } catch (error) {
      if (!(error instanceof ApiError) || error.statusCode !== 400) {
        throw error;
      }
    }
  }

  res.status(200).json({
    message: "Scraper completed successfully",
    jobs: data.jobs,
    outputPath: data.outputPath,
    downloadUrl: data.outputFileName ? `/downloads/${data.outputFileName}` : "",
    stdout: data.stdout,
    source: data.source,
    jsearch: data.jsearch,
    fallback: data.fallback,
    savedJobsCount: savedJobs.length,
    matchedJobsCount: matchSummary.matchesComputed,
    autoQueuedCount: matchSummary.autoQueuedCount
  });
});
