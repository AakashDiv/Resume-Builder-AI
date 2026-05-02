import Application from "../models/Application.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";
import JobMatch from "../models/JobMatch.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { buildJobEmbeddingText, cosineSimilarity, getEmbedding, hasUsableEmbedding, toPercentageScore } from "./embedding.service.js";
import { enqueueAutoApply } from "./queueService.js";

const MATCH_THRESHOLD = Math.max(0, Math.min(100, Number(process.env.MATCH_THRESHOLD || 72)));

const STOP_WORDS = new Set([
  "about", "after", "again", "along", "also", "among", "and", "been", "being", "both", "built", "candidate",
  "company", "customer", "daily", "deliver", "description", "develop", "experience", "from", "have", "with",
  "into", "job", "join", "looking", "manage", "more", "must", "need", "our", "role", "skills", "team", "that",
  "their", "them", "they", "this", "through", "using", "will", "work", "years", "your"
]);

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractKeywords(text, limit = 12) {
  const counts = new Map();
  const tokens = cleanText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s+#./-]/g, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2 && !STOP_WORDS.has(item));

  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([token]) => token);
}

function generateSourceKey(job) {
  return (
    job.externalId ||
    job.applyUrl ||
    [job.platform, job.company, job.title, job.location].filter(Boolean).join("|")
  );
}

export function normalizeJobRow(row = {}) {
  const platform = cleanText(row.platform || row.portal || row.source || "LinkedIn");
  const title = cleanText(row.title || row.job_title || row.role || "");
  const company = cleanText(row.company || row.company_name || row.employer_name || "");
  const location = cleanText(row.location || row.job_location || row.city || "");
  const applyUrl = cleanText(row.url || row.job_url || row.job_apply_link || row.apply_url || "");
  const description = cleanText(
    row.description || row.job_description || row.summary || row.responsibilities || ""
  );
  const externalId = cleanText(row.externalId || row.external_id || row.job_id || "");
  const source = cleanText(row.source || row.source_keyword || platform);
  const salary = cleanText(row.salary || row.compensation || "");
  const datePosted = parseDate(row.datePosted || row.date_posted || row.posted_at || row.job_posted_at_datetime_utc);

  if (!title) {
    return null;
  }

  const normalized = {
    externalId,
    platform,
    title,
    company,
    location,
    description,
    salary,
    applyUrl,
    source,
    datePosted,
    scrapedAt: new Date()
  };

  normalized.sourceKey = slugify(generateSourceKey(normalized)) || `${slugify(title)}-${Date.now()}`;
  normalized.keywords = extractKeywords(`${title} ${description}`, 12);
  return normalized;
}

async function upsertSingleJob(row) {
  const normalized = normalizeJobRow(row);
  if (!normalized) {
    return null;
  }

  const existing = await Job.findOne({ sourceKey: normalized.sourceKey });
  const embeddingSource = buildJobEmbeddingText(normalized);
  const embedding = existing?.description === normalized.description && hasUsableEmbedding(existing.embedding)
    ? existing.embedding
    : await getEmbedding(embeddingSource);

  const payload = {
    ...normalized,
    embedding
  };

  return Job.findOneAndUpdate(
    { sourceKey: normalized.sourceKey },
    payload,
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

export async function upsertJobsFromRows(rows = []) {
  const items = [];
  for (const row of rows) {
    const saved = await upsertSingleJob(row);
    if (saved) {
      items.push(saved);
    }
  }
  return items;
}

function getCandidateSkills(profile) {
  return Array.isArray(profile?.extractedProfile?.skills) ? profile.extractedProfile.skills : [];
}

function buildProfileEmbeddingText(profile = {}) {
  return [
    profile.rawResumeText,
    profile.resumeMarkdown,
    profile.summary,
    profile.extractedProfile?.targetRole,
    getCandidateSkills(profile).join(", "),
    profile.extractedProfile?.location
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function scoreSkillOverlap(candidateSkills, jobKeywords) {
  if (!candidateSkills.length || !jobKeywords.length) {
    return {
      skillScore: 0,
      matchedSkills: [],
      missingSkills: jobKeywords.slice(0, 6)
    };
  }

  const candidateSet = new Set(candidateSkills.map((item) => String(item).toLowerCase()));
  const matchedSkills = jobKeywords.filter((item) => candidateSet.has(String(item).toLowerCase()));
  const missingSkills = jobKeywords.filter((item) => !candidateSet.has(String(item).toLowerCase()));
  const skillScore = Math.round((matchedSkills.length / Math.max(jobKeywords.length, 1)) * 100);

  return {
    skillScore,
    matchedSkills: matchedSkills.slice(0, 8),
    missingSkills: missingSkills.slice(0, 8)
  };
}

async function createOrUpdateMatch({ userId, profile, job }) {
  const profileText = buildProfileEmbeddingText(profile);
  const candidateEmbedding = hasUsableEmbedding(profile.embedding)
    ? profile.embedding
    : await getEmbedding(profileText);

  if (!hasUsableEmbedding(profile.embedding) && hasUsableEmbedding(candidateEmbedding)) {
    profile.embedding = candidateEmbedding;
    await profile.save();
  }
  let jobEmbedding = hasUsableEmbedding(job.embedding)
    ? job.embedding
    : await getEmbedding(buildJobEmbeddingText(job));

  if (!hasUsableEmbedding(job.embedding) && hasUsableEmbedding(jobEmbedding)) {
    await Job.updateOne({ _id: job._id }, { $set: { embedding: jobEmbedding } });
  }

  const embeddingScore = toPercentageScore(cosineSimilarity(candidateEmbedding, jobEmbedding));
  const jobKeywords = Array.isArray(job.keywords) && job.keywords.length
    ? job.keywords
    : extractKeywords(`${job.title} ${job.description}`, 12);
  const overlap = scoreSkillOverlap(getCandidateSkills(profile), jobKeywords);
  const matchScore = Math.round((embeddingScore * 0.75) + (overlap.skillScore * 0.25));

  const highlights = [
    embeddingScore >= 70 ? "Strong semantic fit with your resume" : "Needs more resume alignment",
    overlap.matchedSkills.length
      ? `Matched skills: ${overlap.matchedSkills.slice(0, 3).join(", ")}`
      : "Add more role-specific skills to improve match",
    job.location ? `Location: ${job.location}` : ""
  ].filter(Boolean);

  return JobMatch.findOneAndUpdate(
    { candidateId: userId, jobId: job._id },
    {
      candidateId: userId,
      jobId: job._id,
      matchScore,
      embeddingScore,
      skillScore: overlap.skillScore,
      matchedSkills: overlap.matchedSkills,
      missingSkills: overlap.missingSkills,
      highlights,
      computedAt: new Date()
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

export async function queueTopMatchesForAutoApply(userId) {
  const [user, topMatches] = await Promise.all([
    User.findById(userId).select("_id plan autoApplyEnabled autoApplyLimit"),
    JobMatch.find({ candidateId: userId, matchScore: { $gte: MATCH_THRESHOLD } })
      .sort({ matchScore: -1, computedAt: -1 })
      .limit(50)
  ]);

  if (!user || user.plan !== "pro" || !user.autoApplyEnabled) {
    return { queuedCount: 0, createdCount: 0 };
  }

  const limit = Math.max(1, Number(user.autoApplyLimit || 10));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysApplications = await Application.countDocuments({
    candidateId: userId,
    createdAt: { $gte: today }
  });
  const remaining = Math.max(0, limit - todaysApplications);
  if (!remaining) {
    return {
      queuedCount: await Application.countDocuments({ candidateId: userId, status: "queued" }),
      createdCount: 0
    };
  }

  let createdCount = 0;
  for (const match of topMatches.slice(0, remaining)) {
    const existing = await Application.findOne({ candidateId: userId, jobId: match.jobId });
    if (existing) {
      continue;
    }

    const application = await Application.create({
      candidateId: userId,
      jobId: match.jobId,
      matchScore: match.matchScore,
      source: "auto",
      status: "queued"
    });

    try {
      await enqueueAutoApply(application);
    } catch (error) {
      console.warn("[queue] Failed to enqueue auto-apply application:", error.message || error);
    }

    createdCount += 1;
  }

  const queuedCount = await Application.countDocuments({ candidateId: userId, status: "queued" });
  return { queuedCount, createdCount };
}

export async function runMatchCalculationForUser(userId, options = {}) {
  const user = await User.findById(userId).select("_id plan");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const profile = await CandidateProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(400, "Create your candidate profile before running job matches");
  }

  if (!buildProfileEmbeddingText(profile)) {
    throw new ApiError(400, "Add resume text, target role, or skills before running job matches");
  }

  const jobs = Array.isArray(options.jobs) && options.jobs.length
    ? options.jobs
    : await Job.find({ isActive: true }).sort({ scrapedAt: -1 }).limit(200);

  let computed = 0;
  for (const job of jobs) {
    await createOrUpdateMatch({ userId, profile, job });
    computed += 1;
  }

  const queueResult = await queueTopMatchesForAutoApply(userId);

  return {
    processedJobs: jobs.length,
    matchesComputed: computed,
    autoQueuedCount: queueResult.createdCount,
    queuedCount: queueResult.queuedCount
  };
}

function buildMatchItem(matchDoc) {
  const job = matchDoc.jobId || {};
  return {
    id: matchDoc._id,
    matchScore: matchDoc.matchScore,
    embeddingScore: matchDoc.embeddingScore,
    skillScore: matchDoc.skillScore,
    matchedSkills: matchDoc.matchedSkills || [],
    missingSkills: matchDoc.missingSkills || [],
    highlights: matchDoc.highlights || [],
    computedAt: matchDoc.computedAt,
    job: {
      id: job._id,
      title: job.title,
      company: job.company,
      platform: job.platform,
      location: job.location,
      description: job.description,
      salary: job.salary,
      applyUrl: job.applyUrl,
      source: job.source,
      keywords: job.keywords || [],
      datePosted: job.datePosted,
      scrapedAt: job.scrapedAt
    }
  };
}

export async function getMatchedJobsForUser(userId) {
  const user = await User.findById(userId).select("_id plan");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hasProfile = !!(await CandidateProfile.exists({ userId }));
  if (!hasProfile) {
    return {
      hasProfile: false,
      items: [],
      total: 0
    };
  }

  const query = JobMatch.find({ candidateId: userId })
    .sort({ matchScore: -1, computedAt: -1 })
    .populate("jobId");

  if (user.plan !== "pro") {
    query.limit(10);
  }

  const [matches, total] = await Promise.all([
    query,
    JobMatch.countDocuments({ candidateId: userId })
  ]);

  return {
    hasProfile: true,
    items: matches.map(buildMatchItem),
    total
  };
}

export async function getMatchedJobDetailForUser(userId, jobId) {
  const match = await JobMatch.findOne({ candidateId: userId, jobId }).populate("jobId");
  if (!match) {
    throw new ApiError(404, "Matched job not found");
  }

  return buildMatchItem(match);
}
