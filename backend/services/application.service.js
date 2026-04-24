import Application from "../models/Application.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";
import JobMatch from "../models/JobMatch.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { queueTopMatchesForAutoApply } from "./match.service.js";
import { tailorResumeToJob } from "./resumeTailor.service.js";
import { generateCoverLetterForJob } from "./coverLetter.service.js";

const VALID_STATUSES = ["queued", "applied", "viewed", "responded", "rejected", "failed"];

function buildApplicationItem(application) {
  const job = application.jobId || {};
  return {
    id: application._id,
    status: application.status,
    source: application.source,
    matchScore: application.matchScore,
    appliedAt: application.appliedAt,
    failReason: application.failReason,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    coverLetter: application.coverLetter,
    resumeVersion: application.resumeVersion,
    job: {
      id: job._id,
      title: job.title,
      company: job.company,
      platform: job.platform,
      location: job.location,
      applyUrl: job.applyUrl
    }
  };
}

export async function setAutoApplyEnabled(userId, enabled) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.autoApplyEnabled = Boolean(enabled);
  await user.save();

  const queueResult = user.autoApplyEnabled
    ? await queueTopMatchesForAutoApply(userId)
    : { queuedCount: await Application.countDocuments({ candidateId: userId, status: "queued" }), createdCount: 0 };

  return {
    autoApplyEnabled: user.autoApplyEnabled,
    autoApplyLimit: user.autoApplyLimit,
    queuedCount: queueResult.queuedCount,
    createdCount: queueResult.createdCount
  };
}

export async function getQueueStatus(userId) {
  const user = await User.findById(userId).select("_id autoApplyEnabled autoApplyLimit");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const queuedCount = await Application.countDocuments({ candidateId: userId, status: "queued" });
  return {
    autoApplyEnabled: user.autoApplyEnabled,
    autoApplyLimit: user.autoApplyLimit,
    queuedCount
  };
}

export async function applyToJobManually(userId, jobId) {
  const [user, job, profile, match] = await Promise.all([
    User.findById(userId).select("_id name email"),
    Job.findById(jobId),
    CandidateProfile.findOne({ userId }),
    JobMatch.findOne({ candidateId: userId, jobId })
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  if (!profile) {
    throw new ApiError(400, "Create your profile before applying to jobs");
  }

  const existing = await Application.findOne({ candidateId: userId, jobId }).populate("jobId");
  if (existing && existing.status === "applied") {
    return buildApplicationItem(existing);
  }

  let tailoredResume = profile.resumeMarkdown || profile.rawResumeText || "";
  if (profile.rawResumeText && job.description) {
    const tailored = await tailorResumeToJob({
      resumeText: profile.rawResumeText,
      jobDescriptionText: job.description
    });
    tailoredResume = tailored.improved_resume || tailoredResume;
  }

  const coverLetterResult = await generateCoverLetterForJob({
    userId,
    jobId,
    role: job.title,
    company: job.company,
    jobDescriptionText: job.description
  });

  const application = await Application.findOneAndUpdate(
    { candidateId: userId, jobId },
    {
      candidateId: userId,
      jobId,
      matchScore: match?.matchScore || 0,
      resumeVersion: tailoredResume,
      coverLetter: coverLetterResult.coverLetter,
      source: existing?.source || "manual",
      status: "applied",
      appliedAt: new Date(),
      failReason: ""
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  ).populate("jobId");

  return buildApplicationItem(application);
}

export async function listApplicationsForUser(userId) {
  const applications = await Application.find({ candidateId: userId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .populate("jobId");

  const summary = applications.reduce(
    (accumulator, application) => {
      accumulator.total += 1;
      accumulator[application.status] = (accumulator[application.status] || 0) + 1;
      return accumulator;
    },
    { total: 0, queued: 0, applied: 0, viewed: 0, responded: 0, rejected: 0, failed: 0 }
  );

  return {
    items: applications.map(buildApplicationItem),
    summary
  };
}

export async function getApplicationForUser(userId, applicationId) {
  const application = await Application.findOne({ _id: applicationId, candidateId: userId }).populate("jobId");
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  return buildApplicationItem(application);
}

export async function updateApplicationStatusForUser(userId, applicationId, status, failReason = "") {
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid application status");
  }

  const update = {
    status,
    failReason: status === "failed" ? String(failReason || "").trim() : "",
    appliedAt: status === "applied" ? new Date() : undefined
  };

  const application = await Application.findOneAndUpdate(
    { _id: applicationId, candidateId: userId },
    update,
    { new: true }
  ).populate("jobId");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  return buildApplicationItem(application);
}
