import OpenAI from "openai";
import openaiClient from "./openai.service.js";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";

const MODEL = env.openAiModel;

function normalizeLines(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractJson(text) {
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

function fallbackResume(payload) {
  const skills = normalizeLines(payload.skills);
  const experience = normalizeLines(payload.experience);
  const education = normalizeLines(payload.education);

  const markdownResume = [
    `# ${payload.name}`,
    `${payload.contact}`,
    "",
    "## Professional Summary",
    payload.summary,
    "",
    "## Skills",
    ...skills.map((item) => `- ${item}`),
    "",
    "## Experience",
    ...experience.map((item) => `- ${item}`),
    "",
    "## Education",
    ...education.map((item) => `- ${item}`)
  ].join("\n");

  return {
    markdownResume,
    suggestions: [
      "Add measurable impact to each experience bullet using placeholders such as {X%}, {X users}, or {X projects}.",
      "Prioritize skills and achievements that match the target job description keywords.",
      "Keep formatting ATS-safe: single column layout, consistent section headings, no tables or icons."
    ]
  };
}

export async function buildResumeWithAI(payload) {
  if (!openaiClient) {
    return fallbackResume(payload);
  }

  const skills = normalizeLines(payload.skills);
  const experience = normalizeLines(payload.experience);
  const education = normalizeLines(payload.education);

  const prompt = {
    candidate: {
      name: payload.name,
      contact: payload.contact,
      summary: payload.summary,
      skills,
      experience,
      education
    },
    requirements: [
      "Rewrite the summary professionally and concisely.",
      "Rewrite experience bullets in action-impact format.",
      "Include quantified placeholders like {X%}, {X users}, or {X projects} where exact metrics are missing.",
      "Output ATS-friendly markdown using single-column structure and no tables.",
      "Return valid JSON only with keys: markdownResume (string), suggestions (array of strings)."
    ]
  };

  try {
    const completion = await openaiClient.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Produce ATS-friendly markdown resumes and concise improvement suggestions. Return JSON only."
        },
        {
          role: "user",
          content: JSON.stringify(prompt)
        }
      ]
    });

    const text = completion.choices?.[0]?.message?.content || "";
    const parsed = extractJson(text);

    if (typeof parsed.markdownResume !== "string" || !Array.isArray(parsed.suggestions)) {
      throw new ApiError(502, "AI JSON missing required keys");
    }

    return {
      markdownResume: parsed.markdownResume.trim(),
      suggestions: parsed.suggestions
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 8)
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof OpenAI.APIError) {
      throw new ApiError(error.status || 502, error.message || "OpenAI request failed");
    }

    throw new ApiError(500, "Failed to generate resume");
  }
}
