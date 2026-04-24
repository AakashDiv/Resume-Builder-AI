import OpenAI from "openai";
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import openaiClient from "./openai.service.js";
import { env } from "../config/env.js";

const MODEL = env.openAiModel;

function buildFallbackCoverLetter({ name, role, company, skills, jobDescriptionText }) {
  const selectedSkills = Array.isArray(skills) && skills.length ? skills.slice(0, 3) : ["problem solving", "execution", "collaboration"];
  const companyName = company || "your team";
  const roleName = role || "this role";
  const jobHint = String(jobDescriptionText || "")
    .split(/\s+/)
    .slice(0, 24)
    .join(" ");

  return [
    `Dear Hiring Team,`,
    ``,
    `I am excited to apply for the ${roleName} position at ${companyName}. My background includes hands-on experience delivering high-quality work with a strong focus on measurable outcomes and user impact.`,
    ``,
    `Across my recent work, I have developed strengths in ${selectedSkills.join(", ")}, and I would bring that same ownership and momentum to this opportunity. I am especially interested in how this role emphasizes ${jobHint || "practical execution and collaboration"}.`,
    ``,
    `Thank you for your time and consideration. I would welcome the opportunity to discuss how my experience can support ${companyName}.`,
    ``,
    `Sincerely,`,
    name
  ].join("\n");
}

export async function generateCoverLetterForJob({
  userId,
  jobId,
  role,
  company,
  jobDescriptionText
}) {
  const [user, profile, job] = await Promise.all([
    User.findById(userId).select("_id name email"),
    CandidateProfile.findOne({ userId }),
    jobId ? Job.findById(jobId) : null
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const effectiveRole = String(role || job?.title || "").trim();
  const effectiveCompany = String(company || job?.company || "").trim();
  const effectiveDescription = String(jobDescriptionText || job?.description || "").trim();
  const skills = profile?.extractedProfile?.skills || [];

  if (!effectiveRole && !effectiveDescription) {
    throw new ApiError(400, "Provide a job description or select a saved job");
  }

  if (!openaiClient) {
    return {
      coverLetter: buildFallbackCoverLetter({
        name: profile?.extractedProfile?.fullName || user.name,
        role: effectiveRole,
        company: effectiveCompany,
        skills,
        jobDescriptionText: effectiveDescription
      }),
      role: effectiveRole,
      company: effectiveCompany
    };
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: MODEL,
      temperature: 0.45,
      messages: [
        {
          role: "system",
          content:
            "Write a concise, professional cover letter in plain text. Use three short paragraphs and close with the candidate's name."
        },
        {
          role: "user",
          content: JSON.stringify({
            candidate: {
              name: profile?.extractedProfile?.fullName || user.name,
              targetRole: profile?.extractedProfile?.targetRole || "",
              skills,
              summary: profile?.summary || ""
            },
            company: effectiveCompany,
            role: effectiveRole,
            jobDescriptionText: effectiveDescription
          })
        }
      ]
    });

    const coverLetter = String(completion.choices?.[0]?.message?.content || "").trim();
    if (!coverLetter) {
      throw new ApiError(502, "AI did not return a cover letter");
    }

    return {
      coverLetter,
      role: effectiveRole,
      company: effectiveCompany
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof OpenAI.APIError && env.nodeEnv !== "production") {
      console.warn("[cover-letter] Falling back to deterministic template:", error.message);
    }

    return {
      coverLetter: buildFallbackCoverLetter({
        name: profile?.extractedProfile?.fullName || user.name,
        role: effectiveRole,
        company: effectiveCompany,
        skills,
        jobDescriptionText: effectiveDescription
      }),
      role: effectiveRole,
      company: effectiveCompany
    };
  }
}
