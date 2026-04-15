import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import ApiError from "./ApiError.js";

export async function extractTextFromUpload(file) {
  const extension = (file.originalname.split(".").pop() || "").toLowerCase();

  if (extension === "pdf") {
    const parsed = await pdfParse(file.buffer);
    return String(parsed.text || "").trim();
  }

  if (extension === "doc" || extension === "docx") {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return String(parsed.value || "").trim();
  }

  throw new ApiError(400, "Unsupported file type");
}

function sectionAliases() {
  return {
    summary: ["professional summary", "summary", "profile", "objective"],
    experience: ["experience", "work experience", "employment", "professional experience"],
    skills: ["skills", "technical skills", "core skills"],
    education: ["education", "academic background", "qualification"]
  };
}

function normalizeLine(line) {
  return String(line || "").replace(/[:\-]/g, "").trim().toLowerCase();
}

export function parseResumeSections(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const aliases = sectionAliases();
  const sections = {
    summary: [],
    skills: [],
    experience: [],
    education: []
  };

  let current = "summary";

  for (const line of lines) {
    const normalized = normalizeLine(line);

    let switched = false;
    for (const [key, names] of Object.entries(aliases)) {
      if (names.includes(normalized)) {
        current = key;
        switched = true;
        break;
      }
    }

    if (!switched) {
      sections[current].push(line);
    }
  }

  return {
    summary: sections.summary.join(" ").trim(),
    skills: sections.skills,
    experience: sections.experience,
    education: sections.education,
    rawText: text
  };
}

export function extractBullets(lines) {
  return lines
    .map((line) => line.replace(/^[-*\u2022]\s*/, "").trim())
    .filter(Boolean)
    .filter((line) => line.length > 10);
}
