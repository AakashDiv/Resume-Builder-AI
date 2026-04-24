import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { buildResumeWithAI } from "../services/resume.service.js";
import { improveResumeFromUpload } from "../services/resumeImprove.service.js";
import { scoreResumeAgainstJobDescription } from "../services/resumeScore.service.js";
import { tailorResumeToJob } from "../services/resumeTailor.service.js";
import { generateCoverLetterForJob } from "../services/coverLetter.service.js";
import { saveExtractedCandidateProfile } from "../services/profile.service.js";

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
  let profile = null;

  try {
    if (result.rawText) {
      const saved = await saveExtractedCandidateProfile({
        userId: req.user._id,
        resumeText: result.rawText,
        source: "improved"
      });
      profile = saved.profile;
    }
  } catch (error) {
    console.warn("[resume] Unable to auto-save candidate profile:", error.message);
  }

  res.status(200).json({
    ...result,
    profileSaved: Boolean(profile),
    profile
  });
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

export const generateCoverLetter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const result = await generateCoverLetterForJob({
    userId: req.user._id,
    jobId: req.body.jobId,
    role: req.body.role,
    company: req.body.company,
    jobDescriptionText: req.body.jobDescriptionText
  });

  res.status(200).json(result);
});
