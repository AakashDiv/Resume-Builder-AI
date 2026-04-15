import OpenAI from "openai";
import openaiClient from "./openai.service.js";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";
import { extractBullets, extractTextFromUpload, parseResumeSections } from "../utils/resumeParser.js";

const MODEL = env.openAiModel;

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (_error) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new ApiError(502, "AI response was not valid JSON");
    }
    return JSON.parse(text.slice(start, end + 1));
  }
}

function clampScore(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 65;
  return Math.max(1, Math.min(100, Math.round(num)));
}

function fallbackImprove(parsed) {
  const beforeSummary = parsed.summary || "Summary not detected.";
  const beforeBullets = extractBullets(parsed.experience).slice(0, 10);

  const afterSummary = `Results-driven professional with experience delivering measurable outcomes, cross-functional collaboration, and continuous process improvement.`;
  const afterBullets = (beforeBullets.length ? beforeBullets : ["Supported team deliverables and operations."]).map(
    (bullet) => `Drove ${bullet.charAt(0).toLowerCase() + bullet.slice(1)}, improving outcomes by {X%} through structured execution and stakeholder coordination.`
  );

  return {
    comparison: {
      before: {
        summary: beforeSummary,
        bulletPoints: beforeBullets
      },
      after: {
        summary: afterSummary,
        bulletPoints: afterBullets
      }
    },
    missingKeywords: ["cross-functional collaboration", "stakeholder management", "process optimization"],
    suggestions: [
      "Replace placeholders with real metrics after validating impact.",
      "Align keywords to the exact target job description.",
      "Keep each bullet concise and action-impact oriented."
    ],
    improvementScore: 70,
    parsedSections: {
      summary: parsed.summary,
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education
    }
  };
}

export async function improveResumeFromUpload(file) {
  if (!file) {
    throw new ApiError(400, "Resume file is required");
  }

  const text = await extractTextFromUpload(file);
  if (!text || text.length < 50) {
    throw new ApiError(400, "Unable to extract enough text from resume");
  }

  const parsed = parseResumeSections(text);
  const beforeSummary = parsed.summary || "Summary not detected.";
  const beforeBullets = extractBullets(parsed.experience).slice(0, 10);

  if (!openaiClient) {
    return fallbackImprove(parsed);
  }

  const payload = {
    summary: beforeSummary,
    bullets: beforeBullets,
    skills: parsed.skills.slice(0, 50),
    education: parsed.education.slice(0, 50),
    constraints: [
      "Rewrite weak bullets into action-impact format.",
      "Add quantified placeholders like {X%} where specific metrics are missing.",
      "Suggest missing ATS keywords.",
      "Keep language concise and ATS-friendly."
    ]
  };

  try {
    const completion = await openaiClient.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a resume optimization assistant. Return JSON only with keys: afterSummary (string), improvedBullets (array of strings), missingKeywords (array of strings), suggestions (array of strings), improvementScore (number 1-100)."
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const parsedAI = safeParseJson(raw);

    const afterSummary = String(parsedAI.afterSummary || "").trim();
    const improvedBullets = Array.isArray(parsedAI.improvedBullets)
      ? parsedAI.improvedBullets.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 12)
      : [];

    if (!afterSummary || !improvedBullets.length) {
      throw new ApiError(502, "AI response missing rewritten resume sections");
    }

    return {
      comparison: {
        before: {
          summary: beforeSummary,
          bulletPoints: beforeBullets
        },
        after: {
          summary: afterSummary,
          bulletPoints: improvedBullets
        }
      },
      missingKeywords: Array.isArray(parsedAI.missingKeywords)
        ? parsedAI.missingKeywords.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 20)
        : [],
      suggestions: Array.isArray(parsedAI.suggestions)
        ? parsedAI.suggestions.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 10)
        : [],
      improvementScore: clampScore(parsedAI.improvementScore),
      parsedSections: {
        summary: parsed.summary,
        skills: parsed.skills,
        experience: parsed.experience,
        education: parsed.education
      }
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof OpenAI.APIError) {
      throw new ApiError(error.status || 502, error.message || "OpenAI request failed");
    }

    throw new ApiError(500, "Failed to improve resume");
  }
}
