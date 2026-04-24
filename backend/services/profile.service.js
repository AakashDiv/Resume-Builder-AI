import OpenAI from "openai";
import CandidateProfile from "../models/CandidateProfile.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import openaiClient from "./openai.service.js";
import { env } from "../config/env.js";
import { getEmbedding } from "./embedding.service.js";
import { extractBullets, extractTextFromUpload, parseResumeSections } from "../utils/resumeParser.js";

const MODEL = env.openAiModel;

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (_error) {
    const start = String(text || "").indexOf("{");
    const end = String(text || "").lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new ApiError(502, "AI response was not valid JSON");
    }
    return JSON.parse(String(text).slice(start, end + 1));
  }
}

function uniqueList(input) {
  const seen = new Set();
  const output = [];

  for (const rawItem of input || []) {
    const item = String(rawItem || "").trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

function parseList(value) {
  if (Array.isArray(value)) {
    return uniqueList(value);
  }

  return uniqueList(
    String(value || "")
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function detectEmail(text, fallback = "") {
  const match = String(text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : fallback;
}

function detectPhone(text) {
  const match = String(text || "").match(/(?:\+?\d{1,3}[\s-]?)?(?:\d[\s-]?){9,14}\d/);
  return match ? match[0].replace(/\s+/g, " ").trim() : "";
}

function detectName(text, fallback = "") {
  const firstLine = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return fallback;
  }

  if (/[@\d]/.test(firstLine) || firstLine.length > 80) {
    return fallback;
  }

  return firstLine;
}

function detectEducationLevel(text) {
  const source = String(text || "").toLowerCase();
  if (/\bphd|doctorate\b/.test(source)) return "Doctorate";
  if (/\bmaster|m\.?tech|mca|mba|m\.?s\b/.test(source)) return "Master's";
  if (/\bbachelor|b\.?tech|bca|b\.?e\b/.test(source)) return "Bachelor's";
  if (/\bdiploma\b/.test(source)) return "Diploma";
  return "";
}

function detectExperienceYears(text) {
  const source = String(text || "");
  const directMatch = source.match(/(\d+)\+?\s+years?/i);
  if (directMatch) {
    return Math.max(0, Number(directMatch[1] || 0));
  }

  const years = [...source.matchAll(/\b(20\d{2}|19\d{2})\b/g)].map((match) => Number(match[1]));
  if (years.length >= 2) {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    if (maxYear >= minYear) {
      return Math.max(0, Math.min(40, maxYear - minYear));
    }
  }

  return 0;
}

function extractSkillKeywords(parsed) {
  const explicitSkills = parseList(parsed.skills);
  if (explicitSkills.length) {
    return explicitSkills.slice(0, 30);
  }

  const bullets = extractBullets(parsed.experience).slice(0, 20);
  const joined = bullets.join(" ");
  const matches = joined.match(/\b[A-Za-z][A-Za-z0-9.+#/-]{1,20}\b/g) || [];
  return uniqueList(matches).slice(0, 20);
}

function fallbackExtractProfile(resumeText, user) {
  const parsed = parseResumeSections(resumeText);
  const combinedEducation = parsed.education.join(" ");
  const combinedText = `${parsed.summary}\n${parsed.experience.join("\n")}\n${parsed.education.join("\n")}`;

  return {
    summary: parsed.summary || extractBullets(parsed.experience).slice(0, 2).join(" "),
    extractedProfile: {
      fullName: detectName(resumeText, user.name),
      email: detectEmail(resumeText, user.email),
      phone: detectPhone(resumeText),
      targetRole: "",
      skills: extractSkillKeywords(parsed),
      experienceYears: detectExperienceYears(combinedText),
      location: "",
      preferredLocations: [],
      salaryMin: 0,
      salaryMax: 0,
      educationLevel: detectEducationLevel(combinedEducation)
    }
  };
}

function normalizeExtractedProfile(profile = {}, user) {
  return {
    fullName: String(profile.fullName || user?.name || "").trim(),
    email: String(profile.email || user?.email || "")
      .trim()
      .toLowerCase(),
    phone: String(profile.phone || "").trim(),
    targetRole: String(profile.targetRole || "").trim(),
    skills: parseList(profile.skills).slice(0, 40),
    experienceYears: Math.max(0, Number(profile.experienceYears || 0)),
    location: String(profile.location || "").trim(),
    preferredLocations: parseList(profile.preferredLocations).slice(0, 20),
    salaryMin: Math.max(0, Number(profile.salaryMin || 0)),
    salaryMax: Math.max(0, Number(profile.salaryMax || 0)),
    educationLevel: String(profile.educationLevel || "").trim()
  };
}

function buildEmbeddingSource(profileDoc) {
  const extracted = profileDoc?.extractedProfile || {};
  return [
    profileDoc?.rawResumeText || "",
    profileDoc?.resumeMarkdown || "",
    profileDoc?.summary || "",
    extracted.targetRole || "",
    Array.isArray(extracted.skills) ? extracted.skills.join(", ") : "",
    extracted.location || ""
  ]
    .filter(Boolean)
    .join("\n");
}

function profileDefaults(user) {
  return {
    userId: user._id,
    rawResumeText: "",
    resumeMarkdown: "",
    summary: "",
    embedding: [],
    extractedProfile: normalizeExtractedProfile({}, user),
    lastSource: "manual",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function extractProfileFromResumeText({ resumeText, user }) {
  const input = String(resumeText || "").trim();
  if (input.length < 40) {
    throw new ApiError(400, "Resume text must be at least 40 characters");
  }

  if (!openaiClient) {
    return fallbackExtractProfile(input, user);
  }

  const fallback = fallbackExtractProfile(input, user);

  try {
    const completion = await openaiClient.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract a candidate profile from the resume. Return JSON only with keys: summary, extractedProfile. extractedProfile must include fullName, email, phone, targetRole, skills, experienceYears, location, preferredLocations, salaryMin, salaryMax, educationLevel."
        },
        {
          role: "user",
          content: JSON.stringify({
            candidateDefaults: { fullName: user.name, email: user.email },
            resumeText: input
          })
        }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(raw);
    const extractedProfile = normalizeExtractedProfile(parsed.extractedProfile || {}, user);

    return {
      summary: String(parsed.summary || fallback.summary || "").trim(),
      extractedProfile
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof OpenAI.APIError && env.nodeEnv !== "production") {
      console.warn("[profile] Falling back to heuristic extraction:", error.message);
    }

    return fallback;
  }
}

export async function extractProfileFromUpload({ file, user }) {
  if (!file) {
    throw new ApiError(400, "Resume file is required");
  }

  const resumeText = await extractTextFromUpload(file);
  return {
    resumeText,
    ...(await extractProfileFromResumeText({ resumeText, user }))
  };
}

export async function getCandidateProfileForUser(userId) {
  const [user, profile] = await Promise.all([
    User.findById(userId).select("_id name email createdAt updatedAt"),
    CandidateProfile.findOne({ userId })
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return profile || profileDefaults(user);
}

export async function saveCandidateProfile({
  userId,
  rawResumeText,
  resumeMarkdown,
  summary,
  extractedProfile,
  source = "manual"
}) {
  const [user, existing] = await Promise.all([
    User.findById(userId).select("_id name email"),
    CandidateProfile.findOne({ userId })
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const profile = existing || new CandidateProfile({ userId });
  const currentObject = profile.toObject();

  if (rawResumeText !== undefined) {
    profile.rawResumeText = String(rawResumeText || "").trim();
  }

  if (resumeMarkdown !== undefined) {
    profile.resumeMarkdown = String(resumeMarkdown || "").trim();
  }

  if (summary !== undefined) {
    profile.summary = String(summary || "").trim();
  }

  profile.extractedProfile = normalizeExtractedProfile(
    {
      ...(currentObject.extractedProfile || {}),
      ...(extractedProfile || {})
    },
    user
  );
  profile.lastSource = source;

  const embeddingSource = buildEmbeddingSource(profile);
  profile.embedding = embeddingSource ? await getEmbedding(embeddingSource) : [];

  await profile.save();
  return profile;
}

export async function saveExtractedCandidateProfile({
  userId,
  resumeText,
  resumeMarkdown,
  source = "upload"
}) {
  const user = await User.findById(userId).select("_id name email");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const extracted = await extractProfileFromResumeText({ resumeText, user });
  const profile = await saveCandidateProfile({
    userId,
    rawResumeText: resumeText,
    resumeMarkdown,
    summary: extracted.summary,
    extractedProfile: extracted.extractedProfile,
    source
  });

  return {
    profile,
    extractedProfile: extracted.extractedProfile
  };
}
