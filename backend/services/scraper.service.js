import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import xlsx from "xlsx";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const SCRAPER_DIR = path.resolve(ROOT_DIR, "scraper");
const WRAPPER_PATH = path.resolve(SCRAPER_DIR, "run_scraper_wrapper.py");
const OUTPUT_DIR = path.resolve(ROOT_DIR, "backend", "tmp");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildLocation(job = {}) {
  const parts = [
    job.job_city,
    job.job_state,
    job.job_country
  ].filter(Boolean);

  return cleanText(job.job_location || parts.join(", "));
}

function buildSalary(job = {}) {
  const min = job.job_min_salary;
  const max = job.job_max_salary;
  const currency = job.job_salary_currency || "";
  const period = job.job_salary_period || "";

  if (!min && !max) {
    return cleanText(job.job_salary || "");
  }

  return cleanText([
    currency,
    [min, max].filter(Boolean).join(" - "),
    period
  ].filter(Boolean).join(" "));
}

function normalizeJSearchJob(job = {}) {
  const externalId = cleanText(job.job_id || job.job_apply_link || job.job_google_link);
  const applyUrl = cleanText(
    job.job_apply_link ||
    job.job_google_link ||
    job.job_offer_expiration_datetime_utc ||
    ""
  );

  return {
    externalId,
    platform: cleanText(job.job_publisher || "JSearch"),
    title: cleanText(job.job_title),
    company: cleanText(job.employer_name),
    location: buildLocation(job),
    description: cleanText(job.job_description),
    salary: buildSalary(job),
    applyUrl,
    url: applyUrl,
    source: "JSearch",
    datePosted: job.job_posted_at_datetime_utc || "",
    posted_at: job.job_posted_at_datetime_utc || job.job_posted_at_timestamp || "",
    employmentType: cleanText(job.job_employment_type || "")
  };
}

function getDedupeKey(job = {}) {
  return cleanText(
    job.externalId ||
    job.job_id ||
    job.applyUrl ||
    job.url ||
    [job.platform, job.company, job.title, job.location].filter(Boolean).join("|")
  ).toLowerCase();
}

export function dedupeJobs(jobs = []) {
  const seen = new Set();
  const result = [];

  for (const job of jobs) {
    const key = getDedupeKey(job);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(job);
  }

  return result;
}

function mapTimeFilterToJSearch(timeFilter = "") {
  const value = String(timeFilter).toLowerCase();
  if (value.includes("3") || value.includes("5") || value.includes("week")) return "week";
  if (value.includes("24") || value.includes("day")) return "today";
  if (value.includes("month")) return "month";
  return "all";
}

function buildJSearchQuery(role = "", location = "") {
  const roleText = cleanText(role || "developer");
  const locationText = cleanText(location);
  return locationText ? `${roleText} jobs in ${locationText}` : `${roleText} jobs`;
}

export async function fetchJobsFromJSearch({ role = "", location = "", timeFilter = "Last 5 Days", country = "us" } = {}) {
  if (!env.rapidApiKey) {
    return {
      jobs: [],
      skipped: true,
      reason: "RAPIDAPI_KEY is not configured"
    };
  }

  const params = new URLSearchParams({
    query: buildJSearchQuery(role, location),
    page: "1",
    num_pages: String(env.jsearchNumPages),
    country: String(country || "us").toLowerCase(),
    date_posted: mapTimeFilterToJSearch(timeFilter)
  });

  const response = await fetch(`https://${env.jsearchHost}/search?${params.toString()}`, {
    method: "GET",
    headers: {
      "x-rapidapi-key": env.rapidApiKey,
      "x-rapidapi-host": env.jsearchHost,
      "Content-Type": "application/json"
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message || payload?.error || `JSearch request failed with status ${response.status}`;
    throw new Error(message);
  }

  const jobs = Array.isArray(payload?.data)
    ? payload.data.map(normalizeJSearchJob).filter((job) => job.title)
    : [];

  return {
    jobs: dedupeJobs(jobs),
    skipped: false,
    request: {
      query: params.get("query"),
      page: Number(params.get("page")),
      numPages: Number(params.get("num_pages")),
      country: params.get("country"),
      datePosted: params.get("date_posted")
    }
  };
}

function runProcess(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`Scraper exited with code ${code}: ${stderr || stdout}`));
    });
  });
}

function parseExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
}

export async function executeScraper({ role = "", location = "", platforms = ["LinkedIn"], timeFilter = "Last 5 Days" }) {
  let jsearchResult = {
    jobs: [],
    skipped: false,
    error: ""
  };

  try {
    jsearchResult = await fetchJobsFromJSearch({ role, location, timeFilter });
  } catch (error) {
    jsearchResult = {
      jobs: [],
      skipped: false,
      error: error.message || "JSearch request failed"
    };
  }

  if (jsearchResult.jobs?.length) {
    return {
      jobs: dedupeJobs(jsearchResult.jobs),
      outputPath: "",
      outputFileName: "",
      stdout: "",
      stderr: "",
      source: "jsearch",
      jsearch: {
        count: jsearchResult.jobs.length,
        skipped: false,
        request: jsearchResult.request
      },
      fallback: {
        used: false,
        reason: ""
      }
    };
  }

  const safeRole = String(role || "jobs")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "jobs";

  const outputFileName = `${safeRole}_${Date.now()}.xlsx`;
  const outputPath = path.resolve(OUTPUT_DIR, outputFileName);

  const args = [
    WRAPPER_PATH,
    "--role",
    String(role || ""),
    "--location",
    String(location || ""),
    "--platforms",
    Array.isArray(platforms) && platforms.length ? platforms.join(",") : "LinkedIn",
    "--time-filter",
    String(timeFilter || "Last 5 Days"),
    "--output-file",
    outputPath
  ];

  const processResult = await runProcess(env.pythonBin, args, ROOT_DIR);

  if (!fs.existsSync(outputPath)) {
    throw new Error("Scraper finished but output file was not generated.");
  }

  return {
    jobs: dedupeJobs(parseExcel(outputPath)),
    outputPath,
    outputFileName,
    source: "python",
    jsearch: {
      count: 0,
      skipped: Boolean(jsearchResult.skipped),
      error: jsearchResult.error || "",
      reason: jsearchResult.reason || ""
    },
    fallback: {
      used: true,
      reason: jsearchResult.error || jsearchResult.reason || "JSearch returned no jobs"
    },
    ...processResult
  };
}
