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
    jobs: parseExcel(outputPath),
    outputPath,
    outputFileName,
    ...processResult
  };
}
