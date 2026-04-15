import ApiError from "../utils/ApiError.js";

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","by","for","from","has","he","in","is","it","its","of","on","that","the","to","was","were","will","with","or","we","you","your","our","this","their","they","them","i","me","my","us","about","above","after","again","against","all","also","am","any","because","been","before","being","below","between","both","but","can","did","do","does","doing","down","during","each","few","further","had","have","having","here","how","if","into","just","more","most","other","over","same","should","some","such","than","then","there","these","those","through","too","under","until","very","what","when","where","which","while","who","whom","why","job","role","candidate","experience","work","skills","ability","responsible","requirements","preferred"
]);

const ACTION_VERBS = [
  "led","built","created","improved","increased","reduced","optimized","launched","managed","developed","delivered","implemented","designed","automated","scaled"
];

const SKILL_TERMS = [
  "javascript","typescript","react","node","nodejs","express","python","java","mongodb","mysql","postgresql","aws","azure","docker","kubernetes","rest","graphql","git","tailwind","html","css","redux","nextjs","django","flask","ai","ml","nlp","openai","selenium"
];

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word));
}

function termFrequency(words) {
  const map = new Map();
  for (const word of words) {
    map.set(word, (map.get(word) || 0) + 1);
  }
  return map;
}

function topKeywordsFromJD(jobDescriptionText, limit = 25) {
  const words = tokenize(jobDescriptionText);
  const freq = termFrequency(words);

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword]) => keyword);
}

function toSet(text) {
  return new Set(tokenize(text));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function scoreKeywordMatch(jdKeywords, resumeSet) {
  const matched = jdKeywords.filter((keyword) => resumeSet.has(keyword));
  const ratio = jdKeywords.length ? matched.length / jdKeywords.length : 0;
  return {
    score: round(ratio * 30),
    matched,
    missing: jdKeywords.filter((keyword) => !resumeSet.has(keyword))
  };
}

function scoreSkillsMatch(resumeSet, jdSet) {
  const jdSkills = SKILL_TERMS.filter((skill) => jdSet.has(skill));
  const resumeSkills = SKILL_TERMS.filter((skill) => resumeSet.has(skill));
  const targetSkills = jdSkills.length ? jdSkills : SKILL_TERMS.filter((skill) => jdSet.has(skill) || resumeSet.has(skill));
  const matched = targetSkills.filter((skill) => resumeSet.has(skill));

  const ratio = targetSkills.length ? matched.length / targetSkills.length : 0;
  return {
    score: round(ratio * 20),
    matched,
    missing: targetSkills.filter((skill) => !resumeSet.has(skill))
  };
}

function scoreExperienceRelevance(resumeSet, jdSet) {
  const overlap = [...jdSet].filter((term) => resumeSet.has(term));
  const ratio = jdSet.size ? overlap.length / jdSet.size : 0;
  return {
    score: round(clamp(ratio * 15, 0, 15)),
    overlapCount: overlap.length
  };
}

function scoreFormatting(resumeText) {
  const text = String(resumeText || "");
  let score = 15;

  const hasHeadings = /\b(summary|experience|skills|education)\b/i.test(text);
  if (!hasHeadings) score -= 4;

  const bulletCount = (text.match(/(^|\n)\s*[-*\u2022]/g) || []).length;
  if (bulletCount < 3) score -= 3;

  const hasTableSignals = /\|.+\||\t|<table|\bcolumn\b/i.test(text);
  if (hasTableSignals) score -= 5;

  const lineCount = text.split(/\r?\n/).length;
  if (lineCount < 8) score -= 2;

  return round(clamp(score, 0, 15));
}

function scoreQuantifiedAchievements(resumeText) {
  const text = String(resumeText || "");
  const numberHits = text.match(/\b\d+(?:\.\d+)?\s?(%|k|m|million|billion|\+|users|projects|clients|years|months|hrs|hours)?\b/gi) || [];
  const actionHits = ACTION_VERBS.filter((verb) => new RegExp(`\\b${verb}\\b`, "i").test(text));

  const numberComponent = clamp(numberHits.length / 6, 0, 1) * 7;
  const actionComponent = clamp(actionHits.length / 5, 0, 1) * 3;
  return round(clamp(numberComponent + actionComponent, 0, 10));
}

function scoreReadability(resumeText) {
  const clean = String(resumeText || "").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const words = tokenize(clean);

  if (!sentences.length || !words.length) return 0;

  const avgSentenceLength = words.length / sentences.length;
  let score = 10;

  if (avgSentenceLength > 28) score -= 4;
  else if (avgSentenceLength > 22) score -= 2;

  if (avgSentenceLength < 7) score -= 2;

  const longWordCount = words.filter((word) => word.length >= 13).length;
  const longWordRatio = longWordCount / words.length;
  if (longWordRatio > 0.15) score -= 2;

  if (words.length < 80) score -= 2;

  return round(clamp(score, 0, 10));
}

function topFixes(breakdown, missingKeywords) {
  const ranked = [
    { key: "keyword_match", label: "Improve keyword match", score: breakdown.keyword_match.score, max: 30 },
    { key: "skills_match", label: "Improve skills alignment", score: breakdown.skills_match.score, max: 20 },
    { key: "experience_relevance", label: "Increase experience relevance", score: breakdown.experience_relevance.score, max: 15 },
    { key: "formatting", label: "Fix ATS formatting", score: breakdown.formatting.score, max: 15 },
    { key: "quantified_achievements", label: "Add quantified achievements", score: breakdown.quantified_achievements.score, max: 10 },
    { key: "readability", label: "Improve readability", score: breakdown.readability.score, max: 10 }
  ]
    .map((item) => ({ ...item, deficit: item.max - item.score }))
    .sort((a, b) => b.deficit - a.deficit)
    .slice(0, 3);

  return ranked.map((item, index) => {
    if (item.key === "keyword_match") {
      const sample = missingKeywords.slice(0, 5).join(", ");
      return `Add high-priority JD keywords to summary and experience bullets: ${sample || "relevant domain terms"}.`;
    }
    if (item.key === "quantified_achievements") {
      return "Rewrite impact bullets with measurable outcomes, e.g. improved KPI by {X%}, reduced time by {X hours}.";
    }
    if (item.key === "formatting") {
      return "Use ATS-safe single-column structure with clear headings and bullet points, avoid tables and multi-column layouts.";
    }
    if (item.key === "skills_match") {
      return "Mirror required technical and domain skills from the job description in your Skills and Experience sections.";
    }
    if (item.key === "experience_relevance") {
      return "Prioritize experience bullets directly tied to the role responsibilities and remove unrelated content.";
    }
    if (item.key === "readability") {
      return "Shorten long sentences and keep bullets concise (1-2 lines) with action-first phrasing.";
    }
    return `Improve ${index + 1}`;
  });
}

export function scoreResumeAgainstJobDescription({ resumeText, jobDescriptionText }) {
  if (!String(resumeText || "").trim() || !String(jobDescriptionText || "").trim()) {
    throw new ApiError(400, "resumeText and jobDescriptionText are required");
  }

  const jdKeywords = topKeywordsFromJD(jobDescriptionText, 25);
  const resumeSet = toSet(resumeText);
  const jdSet = toSet(jobDescriptionText);

  const keywordMatch = scoreKeywordMatch(jdKeywords, resumeSet);
  const skillsMatch = scoreSkillsMatch(resumeSet, jdSet);
  const experienceRelevance = scoreExperienceRelevance(resumeSet, jdSet);
  const formatting = scoreFormatting(resumeText);
  const quantifiedAchievements = scoreQuantifiedAchievements(resumeText);
  const readability = scoreReadability(resumeText);

  const breakdown = {
    keyword_match: {
      score: keywordMatch.score,
      max: 30
    },
    skills_match: {
      score: skillsMatch.score,
      max: 20
    },
    experience_relevance: {
      score: experienceRelevance.score,
      max: 15
    },
    formatting: {
      score: formatting,
      max: 15
    },
    quantified_achievements: {
      score: quantifiedAchievements,
      max: 10
    },
    readability: {
      score: readability,
      max: 10
    }
  };

  const totalScore = round(
    breakdown.keyword_match.score +
      breakdown.skills_match.score +
      breakdown.experience_relevance.score +
      breakdown.formatting.score +
      breakdown.quantified_achievements.score +
      breakdown.readability.score
  );

  const missingKeywords = keywordMatch.missing.slice(0, 25);
  const fixes = topFixes(breakdown, missingKeywords);

  return {
    total_score: totalScore,
    breakdown,
    missing_keywords: missingKeywords,
    top_3_high_impact_fixes: fixes
  };
}
