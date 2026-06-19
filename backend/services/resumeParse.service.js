import openaiClient from "./openai.service.js";
import { extractTextFromUpload, parseResumeSections } from "../utils/resumeParser.js";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";

const MODEL = env.openAiModel || "gpt-4o-mini";

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

// Ensure a value is always an array of non-empty strings
function toStringArray(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function buildFallbackResult(rawText) {
  const sections = parseResumeSections(rawText);
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const phoneMatch = rawText.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  const linkedinMatch = rawText.match(/linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = rawText.match(/github\.com\/[\w-]+/i);
  const portfolioMatch = rawText.match(/https?:\/\/(?!linkedin|github)[\w.-]+\.[a-z]{2,}[\w/.-]*/i);

  const fullName = lines[0]?.length < 60 ? lines[0] : "";
  const skillsList = sections.skills.join(", ");
  const expText = sections.experience.slice(0, 8).join("\n");
  const eduText = sections.education.slice(0, 6).join("\n");

  return {
    header: {
      fullName,
      email: emailMatch?.[0] || "",
      phone: phoneMatch?.[0]?.trim() || "",
      location: "",
      headline: "",
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
      github: githubMatch ? `https://${githubMatch[0]}` : "",
      portfolio: portfolioMatch?.[0] || ""
    },
    summary: { text: sections.summary || "" },
    experience: expText
      ? [{ jobTitle: "", employer: "", city: "", country: "", startDate: "", endDate: "", currentlyWorking: false, bullets: expText }]
      : [],
    education: eduText
      ? [{ degree: "", fieldOfStudy: "", institution: "", city: "", country: "", startDate: "", endDate: "", currentlyStudying: false, details: eduText }]
      : [],
    skills: { primarySkills: skillsList },
    certifications: [],
    languages: [],
    projects: [],
    rawText,
    parsedByAi: false,
    atsScore: 55,
    atsSuggestions: [
      "Add a professional summary if missing",
      "Include measurable achievements in experience",
      "List technical and soft skills clearly"
    ]
  };
}

// Template-compatible pipe format: "Name | Issuer | Date"
function normalizeCertItem(cert) {
  const s = String(cert || "").trim();
  if (!s) return null;
  // If it already has pipes, pass through
  if (s.includes("|")) return s;
  return s; // plain string is fine — templates render it as text
}

// Template-compatible pipe format: "Name | Type | Year | Description"
function normalizeProjectItem(proj) {
  const s = String(proj || "").trim();
  if (!s) return null;
  // If already pipe-delimited pass through; otherwise treat as name-only
  return s;
}

const PARSE_PROMPT = `You are a resume parsing assistant. Extract structured data from the resume text and return ONLY a valid JSON object (no markdown, no prose):

{
  "header": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "headline": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "summary": { "text": "" },
  "experience": [
    {
      "jobTitle": "",
      "employer": "",
      "city": "",
      "country": "",
      "startDate": "",
      "endDate": "",
      "currentlyWorking": false,
      "bullets": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "fieldOfStudy": "",
      "institution": "",
      "city": "",
      "country": "",
      "startDate": "",
      "endDate": "",
      "currentlyStudying": false,
      "details": ""
    }
  ],
  "skills": { "primarySkills": "" },
  "certifications": ["CertName | Issuer | Month Year"],
  "languages": ["English (Native)", "Spanish (Conversational)"],
  "projects": ["ProjectName | Type | Year | Brief description of what was built"],
  "atsScore": 70,
  "atsSuggestions": ["tip1", "tip2", "tip3"]
}

Extraction rules:
- bullets: join all bullet points for one job with newlines (\\n)
- primarySkills: comma-separated string of ALL skills found
- certifications: array of strings, format each as "CertName | Issuer | Date" (leave fields blank if unknown, e.g. "AWS Cloud Practitioner | Amazon | 2024")
- languages: array of individual language strings, e.g. ["English (Native)", "Hindi (Fluent)"]
- projects: array of strings, format each as "ProjectName | Type | Year | Description" (leave fields blank if unknown)
- startDate / endDate: keep the original date text from the resume (e.g. "Jan 2020", "2019")
- currentlyWorking: true only if the latest job end date says "Present" or "Current" or is blank
- atsScore: integer 1–100 estimate of ATS compatibility
- atsSuggestions: 3–5 concise actionable improvement tips
- linkedin: full URL if found (e.g. https://linkedin.com/in/username)
- github: full URL if found (e.g. https://github.com/username)
- Return ONLY the JSON object, nothing else`;

export async function parseResumeFile(file) {
  if (!file) throw new ApiError(400, "No file uploaded");

  const rawText = await extractTextFromUpload(file);
  if (!rawText || rawText.length < 50) {
    throw new ApiError(422, "Could not extract readable text from the uploaded file");
  }

  if (!openaiClient) {
    return buildFallbackResult(rawText);
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      messages: [
        { role: "system", content: PARSE_PROMPT },
        { role: "user", content: `Resume text:\n\n${rawText.slice(0, 12000)}` }
      ]
    });

    const content = completion.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

    if (!parsed || !parsed.header) {
      return buildFallbackResult(rawText);
    }

    return {
      header: {
        fullName: parsed.header?.fullName || "",
        email: parsed.header?.email || "",
        phone: parsed.header?.phone || "",
        location: parsed.header?.location || "",
        headline: parsed.header?.headline || "",
        linkedin: parsed.header?.linkedin || "",
        github: parsed.header?.github || "",
        portfolio: parsed.header?.portfolio || "",
        photo: ""
      },
      summary: { text: parsed.summary?.text || "" },
      experience: Array.isArray(parsed.experience) && parsed.experience.length
        ? parsed.experience.map(e => ({
            jobTitle: e.jobTitle || "",
            employer: e.employer || "",
            city: e.city || "",
            country: e.country || "",
            startDate: e.startDate || "",
            endDate: e.endDate || "",
            currentlyWorking: Boolean(e.currentlyWorking),
            bullets: e.bullets || ""
          }))
        : [],
      education: Array.isArray(parsed.education) && parsed.education.length
        ? parsed.education.map(e => ({
            degree: e.degree || "",
            fieldOfStudy: e.fieldOfStudy || "",
            institution: e.institution || "",
            city: e.city || "",
            country: e.country || "",
            startDate: e.startDate || "",
            endDate: e.endDate || "",
            currentlyStudying: Boolean(e.currentlyStudying),
            details: e.details || ""
          }))
        : [],
      skills: { primarySkills: parsed.skills?.primarySkills || "" },
      certifications: toStringArray(parsed.certifications).map(normalizeCertItem).filter(Boolean),
      languages: toStringArray(parsed.languages),
      projects: toStringArray(parsed.projects).map(normalizeProjectItem).filter(Boolean),
      atsScore: Number.isFinite(Number(parsed.atsScore)) ? Math.max(1, Math.min(100, Math.round(Number(parsed.atsScore)))) : 65,
      atsSuggestions: Array.isArray(parsed.atsSuggestions) ? parsed.atsSuggestions.slice(0, 5) : [],
      rawText,
      parsedByAi: true
    };
  } catch (err) {
    console.warn("[resumeParse] OpenAI failed, using fallback:", err.message);
    return buildFallbackResult(rawText);
  }
}
