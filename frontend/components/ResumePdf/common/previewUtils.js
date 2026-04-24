import DOMPurify from "dompurify";

const PLACEHOLDER_VALUES = new Set([
  "available on request",
  "certification name",
  "portfolio: https://",
  "volunteer / extracurricular activity",
  "your name",
  "professional title",
  "phone | email | location | linkedin",
  "email@example.com | +91 99999 99999 | city, country"
]);

export function splitByCommaOrLine(text) {
  const normalized = extractPlainText(text);
  return normalized
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitBullets(text) {
  const raw = String(text || "");
  if (!raw.trim()) return [];

  if (raw.includes("<")) {
    const parser = document.createElement("div");
    parser.innerHTML = raw;
    const listItems = Array.from(parser.querySelectorAll("li"))
      .map((li) => li.textContent?.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean);
    if (listItems.length) return listItems;
  }

  return extractPlainText(raw)
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

export function extractPlainText(value) {
  const raw = String(value || "");
  if (!raw.includes("<")) return raw;
  const parser = document.createElement("div");
  parser.innerHTML = raw;
  return parser.textContent || "";
}

export function hasText(value) {
  const normalized = extractPlainText(value).trim();
  if (!normalized) return false;
  return !PLACEHOLDER_VALUES.has(normalized.toLowerCase());
}

export function hasHtmlMarkup(value) {
  return /<[^>]+>/.test(String(value || ""));
}

export function sanitizeRichHtml(value) {
  return DOMPurify.sanitize(String(value || ""), {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "ul", "ol", "li", "p", "br", "span", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"]
  });
}

export function getAdditionalSections(additional) {
  return Array.isArray(additional?.sections) ? additional.sections : [];
}

export function getSectionByTitle(additional, title) {
  return getAdditionalSections(additional).find(
    (section) => String(section?.title || "").trim().toLowerCase() === String(title || "").trim().toLowerCase()
  );
}

export function getRenderableAdditionalSections(additional, excludedTitles = []) {
  const excluded = new Set(excludedTitles.map((title) => String(title || "").trim().toLowerCase()));

  return getAdditionalSections(additional).filter((section) => {
    const title = String(section?.title || "").trim();
    if (!title || excluded.has(title.toLowerCase())) return false;
    return Array.isArray(section?.items) && section.items.some((item) => hasText(item));
  });
}

export function getMeaningfulExperience(experience) {
  return (Array.isArray(experience) ? experience : []).filter((item) => {
    return Boolean(
      hasText(item?.jobTitle) ||
      hasText(item?.employer) ||
      hasText(item?.city) ||
      hasText(item?.country) ||
      hasText(item?.startDate) ||
      hasText(item?.endDate) ||
      Boolean(item?.currentlyWorking) ||
      splitBullets(item?.bullets).length
    );
  });
}

export function getMeaningfulEducation(education) {
  return (Array.isArray(education) ? education : []).filter((item) => {
    return Boolean(
      hasText(item?.degree) ||
      hasText(item?.institution) ||
      hasText(item?.fieldOfStudy) ||
      hasText(item?.city) ||
      hasText(item?.country) ||
      hasText(item?.startDate) ||
      hasText(item?.endDate) ||
      Boolean(item?.currentlyStudying) ||
      splitBullets(item?.details).length
    );
  });
}

export function getResumeLayoutMode(data) {
  const summaryLength = extractPlainText(data?.summary?.text).trim().length;
  const experience = getMeaningfulExperience(data?.experience);
  const education = getMeaningfulEducation(data?.education);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const additionalSections = getRenderableAdditionalSections(data?.additional);

  const bulletCount =
    experience.reduce((total, item) => total + splitBullets(item?.bullets).length, 0) +
    education.reduce((total, item) => total + splitBullets(item?.details).length, 0) +
    additionalSections.reduce((total, section) => total + section.items.filter(hasText).length, 0);

  const score =
    summaryLength / 150 +
    (experience.length * 2.2) +
    (education.length * 1.5) +
    (skills.length * 0.18) +
    (additionalSections.length * 0.9) +
    (bulletCount * 0.32);

  if (score < 8) return "spacious";
  if (score < 15) return "balanced";
  return "compact";
}

export function parseReferenceItems(additional) {
  const referencesSection = getSectionByTitle(additional, "References");

  return (referencesSection?.items || [])
    .map((item) => String(item || "").trim())
    .filter(hasText)
    .map((item) => {
      const [name = "", role = "", phone = "", email = ""] = item.split("|").map((part) => part.trim());
      return { name, role, phone, email };
    })
    .filter((item) => item.name || item.role || item.phone || item.email);
}

export function formatDateRange(startDate, endDate, isCurrent = false, currentLabel = "Present") {
  const start = extractPlainText(startDate).trim();
  const end = isCurrent ? currentLabel : extractPlainText(endDate).trim();

  if (start && end) return `${start} - ${end}`;
  return start || end || "";
}

export function splitDisplayName(fullName) {
  const parts = extractPlainText(fullName)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return { primary: "", secondary: "", full: "", hasValue: false };
  }

  if (parts.length === 1) {
    return { primary: parts[0], secondary: "", full: parts[0], hasValue: true };
  }

  const pivot = Math.ceil(parts.length / 2);
  return {
    primary: parts.slice(0, pivot).join(" "),
    secondary: parts.slice(pivot).join(" "),
    full: parts.join(" "),
    hasValue: true
  };
}

export function getInitials(fullName, fallback = "") {
  const parts = extractPlainText(fullName)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return fallback;

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
