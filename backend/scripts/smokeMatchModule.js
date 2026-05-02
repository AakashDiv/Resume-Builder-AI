import connectDB from "../config/db.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";
import JobMatch from "../models/JobMatch.js";
import User from "../models/User.js";
import { getMatchedJobsForUser, runMatchCalculationForUser, upsertJobsFromRows } from "../services/match.service.js";

const EMAIL = "codex-match-smoke@example.com";
const JOB_COUNT = 12;

async function cleanup(userId) {
  const sourceKeyPattern = /^codex-match-smoke-/;
  const jobs = await Job.find({ sourceKey: sourceKeyPattern }).select("_id");
  const jobIds = jobs.map((job) => job._id);

  await Promise.all([
    JobMatch.deleteMany({
      $or: [
        { candidateId: userId },
        { jobId: { $in: jobIds } }
      ]
    }),
    CandidateProfile.deleteMany({ userId }),
    User.deleteMany({ email: EMAIL }),
    Job.deleteMany({ sourceKey: sourceKeyPattern })
  ]);
}

function buildRows() {
  return Array.from({ length: JOB_COUNT }, (_, index) => {
    const number = index + 1;
    return {
      externalId: `codex-match-smoke-${number}`,
      platform: "JSearch",
      title: number % 2 === 0 ? `React Developer ${number}` : `Backend Developer ${number}`,
      company: "Smoke Test Company",
      location: "Remote",
      description:
        number % 2 === 0
          ? "Build React dashboards with JavaScript, REST APIs, accessibility, and frontend performance."
          : "Build Node.js APIs with MongoDB, authentication, queues, and backend services.",
      url: `https://example.com/jobs/codex-match-smoke-${number}`,
      source: "smoke-test",
      posted_at: new Date().toISOString()
    };
  });
}

async function main() {
  await connectDB();

  const existingUser = await User.findOne({ email: EMAIL }).select("_id");
  await cleanup(existingUser?._id);

  const user = await User.create({
    name: "Codex Match Smoke",
    email: EMAIL,
    password: "not-a-real-login-password",
    plan: "free"
  });

  await CandidateProfile.create({
    userId: user._id,
    rawResumeText: "Frontend engineer building React dashboards, JavaScript interfaces, REST API integrations, and accessible UI.",
    summary: "React frontend developer focused on dashboards and API-driven products.",
    extractedProfile: {
      fullName: user.name,
      email: user.email,
      targetRole: "React Developer",
      skills: ["React", "JavaScript", "REST", "accessibility", "frontend"],
      location: "Remote"
    },
    lastSource: "manual"
  });

  const savedJobs = await upsertJobsFromRows(buildRows());
  const summary = await runMatchCalculationForUser(user._id, { jobs: savedJobs });
  const freeResult = await getMatchedJobsForUser(user._id);

  user.plan = "pro";
  await user.save();
  const proResult = await getMatchedJobsForUser(user._id);

  console.log("Jobs saved:", savedJobs.length);
  console.log("Matches computed:", summary.matchesComputed);
  console.log("Free visible:", freeResult.items.length, "of", freeResult.total);
  console.log("Pro visible:", proResult.items.length, "of", proResult.total);
  console.log("Top match:", freeResult.items[0]?.job?.title || "none", `${freeResult.items[0]?.matchScore ?? 0}%`);

  if (savedJobs.length !== JOB_COUNT) {
    throw new Error(`Expected ${JOB_COUNT} saved jobs, got ${savedJobs.length}`);
  }

  if (summary.matchesComputed !== JOB_COUNT) {
    throw new Error(`Expected ${JOB_COUNT} computed matches, got ${summary.matchesComputed}`);
  }

  if (freeResult.items.length !== 10 || freeResult.total !== JOB_COUNT) {
    throw new Error("Free match limit failed");
  }

  if (proResult.items.length !== JOB_COUNT || proResult.total !== JOB_COUNT) {
    throw new Error("Pro match visibility failed");
  }

  await cleanup(user._id);
  await User.db.close();
}

main().catch(async (error) => {
  console.error(error);
  await User.db.close().catch(() => {});
  process.exit(1);
});
