import {
  extractPlainText,
  formatDateRange,
  getAdditionalSections,
  getMeaningfulEducation,
  getMeaningfulExperience,
  getRenderableAdditionalSections,
  getSectionByTitle,
  hasText,
  splitBullets,
  splitByCommaOrLine
} from "../../ResumePdf/common/previewUtils.js";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function additionalItems(section) {
  return (Array.isArray(section?.items) ? section.items : [])
    .map((item) => clean(item))
    .filter(Boolean);
}

function projectItems(additional) {
  const section = getSectionByTitle(additional, "Projects");
  return additionalItems(section).map((item, index) => {
    const [name = "", type = "", year = "", description = ""] = item.split("|").map((part) => part.trim());
    return {
      id: section?.id ? `${section.id}-${index}` : `project-${index}`,
      name: name || item,
      type,
      year,
      description: description || (!name.includes("|") ? "" : item)
    };
  });
}

export function buildResumeSections(data) {
  const summary = data?.summary?.text || "";
  const experience = getMeaningfulExperience(data?.experience);
  const education = getMeaningfulEducation(data?.education);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const projects = projectItems(data?.additional);

  const certSection = getSectionByTitle(data?.additional, "Certifications & Licenses");
  const languageSection = getSectionByTitle(data?.additional, "Languages");
  const certifications = splitByCommaOrLine(
    additionalItems(certSection).join("\n") || data?.additional?.certifications || ""
  );
  const languages = splitByCommaOrLine(
    additionalItems(languageSection).join("\n") || data?.additional?.languages || ""
  );

  const excludedAdditionalTitles = [
    "Projects",
    "Certifications & Licenses",
    "Languages"
  ];
  const additional = getRenderableAdditionalSections(data?.additional, excludedAdditionalTitles)
    .map((section) => ({
      id: section.id || section.title,
      title: clean(section.title),
      items: additionalItems(section)
    }))
    .filter((section) => section.title && section.items.length);

  return [
    hasText(summary) && { id: "summary", type: "summary", title: "Professional Summary", data: { summary } },
    experience.length && { id: "experience", type: "experience", title: "Experience", data: { experience } },
    education.length && { id: "education", type: "education", title: "Education", data: { education } },
    projects.length && { id: "projects", type: "projects", title: "Projects", data: { projects } },
    skills.length && { id: "skills", type: "skills", title: "Skills", data: { skills } },
    (certifications.length || languages.length) && {
      id: "certifications-languages",
      type: "additionalGrouped",
      title: "Certifications & Languages",
      data: { certifications, languages }
    },
    ...additional.map((section) => ({
      id: `additional-${section.id}`,
      type: "additionalList",
      title: section.title,
      data: { items: section.items }
    }))
  ].filter(Boolean);
}

export function getHeaderContacts(data) {
  return [
    data?.header?.email,
    data?.header?.phone,
    data?.header?.location,
    data?.additional?.linkedin,
    data?.additional?.portfolio
  ]
    .map((item) => clean(item))
    .filter(Boolean);
}

export function getResumeDensity(data) {
  const sections = buildResumeSections(data);
  const bulletCount = sections.reduce((total, section) => {
    if (section.type === "experience") {
      return total + section.data.experience.reduce((sum, item) => sum + splitBullets(item.bullets).length, 0);
    }
    if (section.type === "education") {
      return total + section.data.education.reduce((sum, item) => sum + splitBullets(item.details).length, 0);
    }
    if (section.type === "additionalList") return total + section.data.items.length;
    return total;
  }, 0);

  const score =
    sections.length * 1.1 +
    getMeaningfulExperience(data?.experience).length * 1.8 +
    getMeaningfulEducation(data?.education).length * 1.1 +
    splitByCommaOrLine(data?.skills?.primarySkills || "").length * 0.14 +
    bulletCount * 0.35 +
    clean(data?.summary?.text).length / 220;

  if (score > 15) return "compact";
  if (score > 8) return "balanced";
  return "spacious";
}

export function formatRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current).replace(" - ", " - ");
}

export function getAllAdditionalSections(additional) {
  return getAdditionalSections(additional);
}
