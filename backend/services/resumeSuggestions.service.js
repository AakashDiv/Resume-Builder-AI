import ResumeContentLibrary from "../models/ResumeContentLibrary.js";
import {
  EXPERIENCE_PHRASE_LIBRARY,
  SKILL_LIBRARY,
  SUMMARY_LIBRARY
} from "../data/resumePhraseLibrary.js";

// ── in-memory cache (loaded once from MongoDB on first request) ────────────
let _cache = null;

async function getCache() {
  if (_cache) return _cache;

  const docs = await ResumeContentLibrary.find({}).lean();

  _cache = {
    experience:    docs.map(d => ({ role: d.role, tags: d.tags, phrases:  d.experience })),
    skills:        docs.map(d => ({ role: d.role, tags: d.tags, skills:   d.skills })),
    summaries:     docs.map(d => ({ role: d.role, tags: d.tags, options:  d.summaries })),
    achievements:  docs.map(d => ({ role: d.role, tags: d.tags, items:    d.achievements })),
    projects:      docs.map(d => ({ role: d.role, tags: d.tags, items:    d.projects })),
    certifications: docs.map(d => ({ role: d.role, tags: d.tags, items:  d.certifications }))
  };

  return _cache;
}

// call this after any admin update to force a fresh DB read next request
export function clearSuggestionsCache() {
  _cache = null;
}

// ── helpers ────────────────────────────────────────────────────────────────
function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function findRoleMatch(library, query) {
  if (!query) return library[0] || null;
  const q = normalize(query);

  return (
    library.find(e => normalize(e.role) === q) ||
    library.find(e =>
      normalize(e.role).includes(q) ||
      e.tags.some(tag => normalize(tag).includes(q) || q.includes(normalize(tag)))
    ) ||
    null
  );
}

// ── per-type filters ───────────────────────────────────────────────────────
async function filterExperience(query) {
  const { experience } = await getCache();
  const match = findRoleMatch(experience, query);
  if (match) return match.phrases.map(text => ({ tags: match.tags, text }));

  // fallback to legacy flat library
  const q = normalize(query);
  if (!q) return EXPERIENCE_PHRASE_LIBRARY.slice(0, 8);
  const filtered = EXPERIENCE_PHRASE_LIBRARY.filter(item => {
    const tags = item.tags.join(" ").toLowerCase();
    return tags.includes(q) || item.text.toLowerCase().includes(q);
  });
  return (filtered.length ? filtered : EXPERIENCE_PHRASE_LIBRARY).slice(0, 12);
}

async function filterSkills(query) {
  const { skills } = await getCache();
  const match = findRoleMatch(skills, query);
  if (match) return match.skills;

  const q = normalize(query);
  if (!q) return SKILL_LIBRARY;
  const filtered = SKILL_LIBRARY.filter(item => item.toLowerCase().includes(q));
  return filtered.length ? filtered : SKILL_LIBRARY;
}

async function filterSummaries(query) {
  const { summaries } = await getCache();
  const match = findRoleMatch(summaries, query);
  if (match) return match.options;

  const q = normalize(query);
  if (!q) return SUMMARY_LIBRARY;
  const filtered = SUMMARY_LIBRARY.filter(item =>
    `${item.title} ${item.text}`.toLowerCase().includes(q)
  );
  return filtered.length ? filtered : SUMMARY_LIBRARY;
}

async function filterAchievements(query) {
  const { achievements } = await getCache();
  const match = findRoleMatch(achievements, query);
  return match ? match.items : [];
}

async function filterProjects(query) {
  const { projects } = await getCache();
  const match = findRoleMatch(projects, query);
  return match ? match.items : [];
}

async function filterCertifications(query) {
  const { certifications } = await getCache();
  const match = findRoleMatch(certifications, query);
  return match ? match.items : [];
}

// ── main export ────────────────────────────────────────────────────────────
export async function getResumeSuggestionLibrary({ type = "all", query = "" } = {}) {
  const t = normalize(type);

  if (t === "experience")     return { experience:     await filterExperience(query) };
  if (t === "skills")         return { skills:         await filterSkills(query) };
  if (t === "summary")        return { summaries:      await filterSummaries(query) };
  if (t === "achievements")   return { achievements:   await filterAchievements(query) };
  if (t === "projects")       return { projects:       await filterProjects(query) };
  if (t === "certifications") return { certifications: await filterCertifications(query) };

  const [experience, skills, summaries, achievements, projects, certifications] = await Promise.all([
    filterExperience(query),
    filterSkills(query),
    filterSummaries(query),
    filterAchievements(query),
    filterProjects(query),
    filterCertifications(query)
  ]);

  return { experience, skills, summaries, achievements, projects, certifications };
}
