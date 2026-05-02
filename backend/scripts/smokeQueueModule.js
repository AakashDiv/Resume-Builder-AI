import connectDB from "../config/db.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { pingRedis } from "../config/redis.js";
import { closeAutoApplyQueue, enqueueAutoApply, getAutoApplyQueue, getAutoApplyQueueStatus, initializeAutoApplyWorker } from "../services/queueService.js";

const EMAIL = "codex-queue-smoke@example.com";
const SOURCE_KEY = "codex-queue-smoke-job";

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForJobCompletion(queue, queueJobId, timeoutMs = 10000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const job = await queue.getJob(queueJobId);
    const state = job ? await job.getState() : "missing";

    if (state === "completed") {
      return state;
    }

    if (state === "failed") {
      const failedReason = job?.failedReason || "Unknown queue failure";
      throw new Error(failedReason);
    }

    await wait(250);
  }

  throw new Error("Timed out waiting for queue job to complete");
}

async function cleanup() {
  const user = await User.findOne({ email: EMAIL }).select("_id");
  const job = await Job.findOne({ sourceKey: SOURCE_KEY }).select("_id");

  await Promise.all([
    user ? Application.deleteMany({ candidateId: user._id }) : Promise.resolve(),
    job ? Application.deleteMany({ jobId: job._id }) : Promise.resolve(),
    User.deleteMany({ email: EMAIL }),
    Job.deleteMany({ sourceKey: SOURCE_KEY })
  ]);
}

async function main() {
  const redisPong = await pingRedis();
  console.log("Redis ping:", redisPong);

  await connectDB();
  await cleanup();

  const user = await User.create({
    name: "Codex Queue Smoke",
    email: EMAIL,
    password: "not-a-real-login-password",
    plan: "pro",
    autoApplyEnabled: true
  });

  const job = await Job.create({
    sourceKey: SOURCE_KEY,
    externalId: SOURCE_KEY,
    platform: "JSearch",
    title: "Queue Smoke Developer",
    company: "Smoke Test Company",
    location: "Remote",
    description: "Queue test job",
    applyUrl: "https://example.com/apply",
    source: "smoke-test"
  });

  const application = await Application.create({
    candidateId: user._id,
    jobId: job._id,
    matchScore: 91,
    source: "auto",
    status: "queued"
  });

  initializeAutoApplyWorker();
  const queue = getAutoApplyQueue();
  const enqueueResult = await enqueueAutoApply(application);
  console.log("Enqueued:", enqueueResult);

  await waitForJobCompletion(queue, enqueueResult.queueJobId);
  const status = await getAutoApplyQueueStatus();
  console.log("Queue status:", status);

  await cleanup();
  await closeAutoApplyQueue();
  await User.db.close();
}

main().catch(async (error) => {
  console.error(error.message || error);
  await closeAutoApplyQueue().catch(() => {});
  await User.db.close().catch(() => {});
  process.exit(1);
});
