import OpenAI from "openai";
import openaiClient from "./openai.service.js";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";
import { scoreResumeAgainstJobDescription } from "./resumeScore.service.js";

const MODEL = env.openAiModel;

function parseBulletLines(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets = lines
    .filter((line) => /^[-*\u2022]/.test(line))
    .map((line) => line.replace(/^[-*\u2022]\s*/, "").trim())
    .filter((line) => line.length > 15);

  if (bullets.length) {
    return bullets.slice(0, 5);
  }

  const sentenceFallback = String(text || "")
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20)
    .slice(0, 5);

  return sentenceFallback;
}

function safeJsonParse(text) {
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

function replaceFirstSummaryBlock(resumeText, newSummary) {
  const source = String(resumeText || "");
  const headingRegex = /(##?\s*(professional\s+summary|summary|profile)\s*\n)([\s\S]*?)(\n##?\s+|$)/i;

  if (headingRegex.test(source)) {
    return source.replace(headingRegex, (_match, heading, _current, nextHeading) => {
      const tail = nextHeading || "";
      return `${heading}${newSummary.trim()}\n${tail}`;
    });
  }

  return `## Professional Summary\n${newSummary.trim()}\n\n${source}`;
}

function replaceTopBullets(resumeText, improvedBullets) {
  const lines = String(resumeText || "").split(/\r?\n/);
  const output = [];
  let index = 0;

  for (const line of lines) {
    if (/^\s*[-*\u2022]/.test(line) && index < improvedBullets.length) {
      output.push(`- ${improvedBullets[index]}`);
      index += 1;
    } else {
      output.push(line);
    }
  }

  while (index < improvedBullets.length) {
    output.push(`- ${improvedBullets[index]}`);
    index += 1;
  }

  return output.join("\n");
}

function fallbackTailor({ resumeText, jobDescriptionText }) {
  const baseline = scoreResumeAgainstJobDescription({ resumeText, jobDescriptionText });
  const keywords = baseline.missing_keywords.slice(0, 8);
  const bullets = parseBulletLines(resumeText);

  const improvedSummary =
    "Results-oriented professional with demonstrated success delivering measurable outcomes, cross-functional collaboration, and role-specific execution aligned to business priorities.";

  const improvedBullets = (bullets.length ? bullets : ["Contributed to project delivery and team outcomes."]).map((bullet) =>
    `Drove ${bullet.charAt(0).toLowerCase() + bullet.slice(1)}, aligning outcomes with ${keywords[0] || "job priorities"} and improving impact by {X%}.`
  );

  let improvedResume = replaceFirstSummaryBlock(resumeText, improvedSummary);
  improvedResume = replaceTopBullets(improvedResume, improvedBullets.slice(0, 5));

  const newScore = scoreResumeAgainstJobDescription({
    resumeText: improvedResume,
    jobDescriptionText
  });

  return {
    improved_resume: improvedResume,
    rewritten_summary: improvedSummary,
    rewritten_top_5_bullets: improvedBullets.slice(0, 5),
    injected_keywords: keywords,
    new_ats_score: newScore
  };
}

export async function tailorResumeToJob({ resumeText, jobDescriptionText }) {
  if (!String(resumeText || "").trim() || !String(jobDescriptionText || "").trim()) {
    throw new ApiError(400, "resumeText and jobDescriptionText are required");
  }

  const baseline = scoreResumeAgainstJobDescription({ resumeText, jobDescriptionText });
  const missingKeywords = baseline.missing_keywords.slice(0, 12);
  const topBullets = parseBulletLines(resumeText).slice(0, 5);

  if (!openaiClient) {
    return fallbackTailor({ resumeText, jobDescriptionText });
  }

  const payload = {
    resumeText,
    jobDescriptionText,
    missingKeywords,
    topBullets,
    instructions: [
      "Inject missing keywords naturally without keyword stuffing.",
      "Rewrite top 5 bullets to align with job description and keep action-impact format.",
      "Update professional summary to match the target role.",
      "Keep ATS-friendly single-column style and markdown/plain text structure.",
      "Return JSON keys only: improvedResume, rewrittenSummary, rewrittenTop5Bullets, injectedKeywords."
    ]
  };

  try {
    const completion = await openaiClient.chat.completions.create({
      model: MODEL,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior resume strategist optimizing resumes for ATS and recruiter readability. Return JSON only."
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const parsed = safeJsonParse(raw);

    const improvedResume = String(parsed.improvedResume || "").trim();
    const rewrittenSummary = String(parsed.rewrittenSummary || "").trim();
    const rewrittenTop5Bullets = Array.isArray(parsed.rewrittenTop5Bullets)
      ? parsed.rewrittenTop5Bullets.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 5)
      : [];

    if (!improvedResume || !rewrittenSummary || !rewrittenTop5Bullets.length) {
      throw new ApiError(502, "AI response missing required tailoring fields");
    }

    const injectedKeywords = Array.isArray(parsed.injectedKeywords)
      ? parsed.injectedKeywords.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 12)
      : [];

    const newScore = scoreResumeAgainstJobDescription({
      resumeText: improvedResume,
      jobDescriptionText
    });

    return {
      improved_resume: improvedResume,
      rewritten_summary: rewrittenSummary,
      rewritten_top_5_bullets: rewrittenTop5Bullets,
      injected_keywords: injectedKeywords,
      new_ats_score: newScore
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof OpenAI.APIError) {
      throw new ApiError(error.status || 502, error.message || "OpenAI request failed");
    }

    throw new ApiError(500, "Failed to tailor resume");
  }
}
