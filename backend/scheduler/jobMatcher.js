import cron from "node-cron";
import CandidateProfile from "../models/CandidateProfile.js";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { fetchJobsFromJSearch } from "../services/scraper.service.js";
import { runMatchCalculationForUser, upsertJobsFromRows } from "../services/match.service.js";
import { isAutomaticWorkEnabled } from "../services/automationSettings.service.js";
import { sendDailyDigestToAllPremiumUsers } from "../services/emailService.js";

let matcherTask = null;
let digestTask = null;
let runningMatcher = false;
let runningDigest = false;
let lastMatcherRun = null;
let lastDigestRun = null;
let lastMatcherResult = null;
let lastDigestResult = null;

function getProfileSearch(profile) {
  const extracted = profile.extractedProfile || {};
  return {
    role: extracted.targetRole || extracted.skills?.[0] || "developer",
    location: extracted.location || extracted.preferredLocations?.[0] || ""
  };
}

export async function runDailyJobMatcher({ force = false } = {}) {
  if (!force && !(await isAutomaticWorkEnabled())) {
    lastMatcherResult = {
      skipped: true,
      reason: "Automatic work is disabled"
    };
    return lastMatcherResult;
  }

  if (runningMatcher) {
    return {
      skipped: true,
      reason: "Job matcher is already running"
    };
  }

  runningMatcher = true;
  lastMatcherRun = new Date();

  const summary = {
    usersProcessed: 0,
    jobsFetched: 0,
    jobsSaved: 0,
    matchesComputed: 0,
    autoQueuedCount: 0,
    errors: []
  };

  try {
    const profiles = await CandidateProfile.find({}).limit(200);

    for (const profile of profiles) {
      const user = await User.findById(profile.userId).select("_id plan autoApplyEnabled");
      if (!user) {
        continue;
      }

      const search = getProfileSearch(profile);
      if (!search.role) {
        continue;
      }

      try {
        const result = await fetchJobsFromJSearch({
          role: search.role,
          location: search.location,
          timeFilter: "Last 24 Hours"
        });
        const jobs = result.jobs || [];
        const savedJobs = await upsertJobsFromRows(jobs);
        const matchSummary = await runMatchCalculationForUser(user._id, { jobs: savedJobs });

        summary.usersProcessed += 1;
        summary.jobsFetched += jobs.length;
        summary.jobsSaved += savedJobs.length;
        summary.matchesComputed += matchSummary.matchesComputed || 0;
        summary.autoQueuedCount += matchSummary.autoQueuedCount || 0;
      } catch (error) {
        summary.errors.push({
          userId: String(user._id),
          message: error.message || "Job matcher failed for user"
        });
      }
    }

    lastMatcherResult = summary;
    return summary;
  } finally {
    runningMatcher = false;
  }
}

export async function runDailyDigest({ force = false } = {}) {
  if (!force && !(await isAutomaticWorkEnabled())) {
    lastDigestResult = {
      skipped: true,
      reason: "Automatic work is disabled"
    };
    return lastDigestResult;
  }

  if (runningDigest) {
    return {
      skipped: true,
      reason: "Daily digest is already running"
    };
  }

  runningDigest = true;
  lastDigestRun = new Date();

  try {
    lastDigestResult = await sendDailyDigestToAllPremiumUsers();
    return lastDigestResult;
  } finally {
    runningDigest = false;
  }
}

export function startJobMatcherScheduler() {
  if (!env.schedulerEnabled) {
    console.log("[scheduler] Disabled by SCHEDULER_ENABLED=false");
    return;
  }

  if (matcherTask || digestTask) {
    return;
  }

  matcherTask = cron.schedule(
    env.jobMatcherCron,
    () => {
      runDailyJobMatcher().catch((error) => {
        console.error("[scheduler] Daily job matcher failed:", error.message || error);
      });
    },
    {
      timezone: env.schedulerTimezone
    }
  );

  digestTask = cron.schedule(
    env.dailyDigestCron,
    () => {
      runDailyDigest().catch((error) => {
        console.error("[scheduler] Daily digest failed:", error.message || error);
      });
    },
    {
      timezone: env.schedulerTimezone
    }
  );

  console.log("[scheduler] Started", {
    jobMatcherCron: env.jobMatcherCron,
    dailyDigestCron: env.dailyDigestCron,
    timezone: env.schedulerTimezone
  });

  if (env.schedulerRunOnStart) {
    runDailyJobMatcher().catch((error) => {
      console.error("[scheduler] Run-on-start matcher failed:", error.message || error);
    });
  }
}

export function getSchedulerRuntimeStatus() {
  return {
    configured: env.schedulerEnabled,
    jobMatcherCron: env.jobMatcherCron,
    dailyDigestCron: env.dailyDigestCron,
    timezone: env.schedulerTimezone,
    matcherRunning: runningMatcher,
    digestRunning: runningDigest,
    lastMatcherRun,
    lastDigestRun,
    lastMatcherResult,
    lastDigestResult
  };
}
