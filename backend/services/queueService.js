import Queue from "bull";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { env } from "../config/env.js";
import { getRedisConnectionOptions } from "../config/redis.js";
import { autoApplyToJob } from "./autoApplyService.js";

const AUTO_APPLY_QUEUE_NAME = "auto-apply";
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000
  },
  removeOnComplete: 100,
  removeOnFail: 200
};

let autoApplyQueue = null;
let workerStarted = false;
let lastConnectionWarningAt = 0;

function warnQueueError(error) {
  const now = Date.now();
  if (now - lastConnectionWarningAt < 30000) {
    return;
  }

  lastConnectionWarningAt = now;
  console.warn("[queue] Redis/Bull warning:", error.message || error);
}

export function getAutoApplyQueue() {
  if (!env.queueEnabled) {
    return null;
  }

  if (!autoApplyQueue) {
    autoApplyQueue = new Queue(AUTO_APPLY_QUEUE_NAME, {
      redis: getRedisConnectionOptions(),
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
      limiter: {
        max: 1,
        duration: env.autoApplyDelayMs
      }
    });

    autoApplyQueue.on("error", warnQueueError);
    autoApplyQueue.on("failed", (job, error) => {
      console.error(`[queue] Auto-apply queue job ${job.id} failed:`, error.message || error);
    });
    autoApplyQueue.on("completed", (job) => {
      console.log(`[queue] Auto-apply queue job ${job.id} completed`);
    });
  }

  return autoApplyQueue;
}

export async function enqueueAutoApply(application) {
  if (!application?._id) {
    return {
      queued: false,
      reason: "Application is required"
    };
  }

  const queue = getAutoApplyQueue();
  if (!queue) {
    return {
      queued: false,
      reason: "Queue is disabled"
    };
  }

  const jobId = `application:${application._id}`;
  const job = await queue.add(
    "auto-apply",
    {
      applicationId: String(application._id),
      candidateId: String(application.candidateId),
      jobId: String(application.jobId),
      matchScore: application.matchScore || 0,
      source: application.source || "auto"
    },
    {
      jobId
    }
  );

  return {
    queued: true,
    queueJobId: job.id
  };
}

export async function enqueueQueuedApplicationsForUser(userId, limit = 50) {
  const applications = await Application.find({
    candidateId: userId,
    status: "queued"
  })
    .sort({ createdAt: 1 })
    .limit(limit);

  let queuedCount = 0;
  for (const application of applications) {
    const result = await enqueueAutoApply(application);
    if (result.queued) {
      queuedCount += 1;
    }
  }

  return {
    scannedCount: applications.length,
    queuedCount
  };
}

export function initializeAutoApplyWorker() {
  const queue = getAutoApplyQueue();
  if (!queue || workerStarted) {
    return queue;
  }

  workerStarted = true;

  queue.process("auto-apply", 1, async (job) => {
    const { applicationId, candidateId, jobId, matchScore } = job.data || {};
    const application = await Application.findById(applicationId);
    const savedJob = await Job.findById(jobId).select("title company platform applyUrl");

    if (!application) {
      console.warn("[queue] Application not found for auto-apply job:", applicationId);
      return {
        ok: false,
        reason: "Application not found"
      };
    }

    console.log("[queue] Auto-apply worker received job", {
      applicationId,
      candidateId,
      jobId,
      matchScore,
      title: savedJob?.title || "",
      company: savedJob?.company || "",
      platform: savedJob?.platform || "",
      applyUrl: savedJob?.applyUrl || ""
    });

    const result = await autoApplyToJob({ applicationId });

    return {
      ok: result.success,
      applicationId,
      jobId,
      status: result.status,
      reason: result.reason || "",
      dryRun: Boolean(result.dryRun)
    };
  });

  console.log("[queue] Auto-apply worker started");
  return queue;
}

export async function getAutoApplyQueueStatus() {
  const queue = getAutoApplyQueue();
  if (!queue) {
    return {
      enabled: false,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0
    };
  }

  const counts = await queue.getJobCounts("waiting", "active", "completed", "failed", "delayed");
  return {
    enabled: true,
    ...counts
  };
}

export async function closeAutoApplyQueue() {
  if (!autoApplyQueue) {
    return;
  }

  await autoApplyQueue.close();
  autoApplyQueue = null;
  workerStarted = false;
}
