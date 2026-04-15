import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { executeScraper } from "../services/scraper.service.js";

export const runScraper = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const data = await executeScraper(req.body || {});
  res.status(200).json({
    message: "Scraper completed successfully",
    jobs: data.jobs,
    outputPath: data.outputPath,
    downloadUrl: `/downloads/${data.outputFileName}`,
    stdout: data.stdout
  });
});
