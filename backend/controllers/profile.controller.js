import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {
  extractProfileFromUpload,
  getCandidateProfileForUser,
  saveCandidateProfile,
  saveExtractedCandidateProfile
} from "../services/profile.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await getCandidateProfileForUser(req.user._id);
  res.status(200).json({ profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await saveCandidateProfile({
    userId: req.user._id,
    rawResumeText: req.body.rawResumeText,
    resumeMarkdown: req.body.resumeMarkdown,
    summary: req.body.summary,
    extractedProfile: req.body.extractedProfile || {},
    source: "manual"
  });

  res.status(200).json({ profile });
});

export const extractProfile = asyncHandler(async (req, res) => {
  let result;

  if (req.file) {
    const extracted = await extractProfileFromUpload({
      file: req.file,
      user: req.user
    });

    const profile = await saveCandidateProfile({
      userId: req.user._id,
      rawResumeText: extracted.resumeText,
      summary: extracted.summary,
      extractedProfile: extracted.extractedProfile,
      source: "upload"
    });

    result = {
      profile,
      extractedProfile: extracted.extractedProfile,
      resumeText: extracted.resumeText
    };
  } else {
    const resumeText = String(req.body.resumeText || req.body.resumeMarkdown || "").trim();
    if (resumeText.length < 40) {
      throw new ApiError(400, "Provide resume text or upload a resume file");
    }

    result = await saveExtractedCandidateProfile({
      userId: req.user._id,
      resumeText,
      resumeMarkdown: req.body.resumeMarkdown,
      source: "manual"
    });
  }

  res.status(200).json(result);
});
