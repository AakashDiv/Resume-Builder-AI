import http from "http";
import connectDB from "../config/db.js";
import Application from "../models/Application.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { autoApplyToJob } from "../services/autoApplyService.js";

const EMAIL = "codex-auto-apply-smoke@example.com";
const SOURCE_KEY = "codex-auto-apply-smoke-job";

function startMockApplyServer() {
  const html = `<!doctype html>
    <html>
      <body>
        <button id="easy">Easy Apply</button>
        <main id="form" style="display:none">
          <label for="name">Full name</label>
          <input id="name" name="name" />
          <label for="email">Email</label>
          <input id="email" name="email" type="email" />
          <label for="phone">Phone</label>
          <input id="phone" name="phoneNumber" />
          <label for="summary">Cover note</label>
          <textarea id="summary" name="summary"></textarea>
          <button id="submit">Submit application</button>
        </main>
        <script>
          document.getElementById("easy").addEventListener("click", () => {
            document.getElementById("form").style.display = "block";
          });
          document.getElementById("submit").addEventListener("click", () => {
            document.body.innerHTML = "<p>Application submitted</p>";
          });
        </script>
      </body>
    </html>`;

  const server = http.createServer((_, response) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(html);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        server,
        url: `http://127.0.0.1:${address.port}/apply`
      });
    });
  });
}

async function cleanup() {
  const user = await User.findOne({ email: EMAIL }).select("_id");
  const job = await Job.findOne({ sourceKey: SOURCE_KEY }).select("_id");

  await Promise.all([
    user ? CandidateProfile.deleteMany({ userId: user._id }) : Promise.resolve(),
    user ? Application.deleteMany({ candidateId: user._id }) : Promise.resolve(),
    job ? Application.deleteMany({ jobId: job._id }) : Promise.resolve(),
    User.deleteMany({ email: EMAIL }),
    Job.deleteMany({ sourceKey: SOURCE_KEY })
  ]);
}

async function main() {
  const { server, url } = await startMockApplyServer();

  try {
    await connectDB();
    await cleanup();

    const user = await User.create({
      name: "Codex Auto Apply Smoke",
      email: EMAIL,
      password: "not-a-real-login-password",
      plan: "pro",
      autoApplyEnabled: true
    });

    await CandidateProfile.create({
      userId: user._id,
      summary: "Frontend developer with React dashboard experience.",
      extractedProfile: {
        fullName: user.name,
        email: user.email,
        phone: "9999999999",
        targetRole: "React Developer",
        skills: ["React", "JavaScript"],
        location: "Remote",
        experienceYears: 3
      },
      lastSource: "manual"
    });

    const job = await Job.create({
      sourceKey: SOURCE_KEY,
      externalId: SOURCE_KEY,
      platform: "LinkedIn",
      title: "Mock LinkedIn Easy Apply",
      company: "Smoke Test Company",
      location: "Remote",
      description: "Mock job for Puppeteer dry-run",
      applyUrl: url,
      source: "LinkedIn"
    });

    const application = await Application.create({
      candidateId: user._id,
      jobId: job._id,
      matchScore: 95,
      source: "auto",
      status: "queued"
    });

    const result = await autoApplyToJob({
      applicationId: application._id,
      dryRun: true
    });

    const updated = await Application.findById(application._id);
    console.log("Auto-apply result:", result);
    console.log("Application status:", updated.status);
    console.log("Fail reason:", updated.failReason);

    if (!result.success || updated.status !== "viewed") {
      throw new Error("Auto-apply smoke test failed");
    }

    await cleanup();
    await User.db.close();
  } finally {
    server.close();
  }
}

main().catch(async (error) => {
  console.error(error);
  await User.db.close().catch(() => {});
  process.exit(1);
});
