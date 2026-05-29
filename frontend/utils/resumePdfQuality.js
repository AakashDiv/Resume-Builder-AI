const LIMITS = {
  summaryMaxChars: 420,
  maxExperienceEntries: 4,
  maxEducationEntries: 3,
  maxAdditionalSections: 4,
  maxItemsPerAdditionalSection: 5,
  maxSkills: 16,
  maxBulletsPerExperience: 5,
  maxBulletsPerEducation: 4,
  maxBulletChars: 180
};
const PAGE_HEIGHT_TOLERANCE_PX = 6;
const PAGE_HEIGHT_TOLERANCE_PT = 6;

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ");
}

function cleanText(value) {
  return stripHtml(value).replace(/\s+/g, " ").trim();
}

function splitByCommaOrLine(value) {
  return stripHtml(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitBullets(value) {
  const raw = String(value || "");
  if (!raw.trim()) return [];

  return stripHtml(raw)
    .split(/\r?\n|[•]/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

function unique(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = String(value || "").toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clampText(value, maxChars) {
  const text = String(value || "").trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

function cleanList(values, maxItems, maxChars) {
  const trimmed = unique(values.map((item) => cleanText(item)).filter(Boolean));
  return trimmed.slice(0, maxItems).map((item) => clampText(item, maxChars));
}

function extractYear(value) {
  const match = String(value || "").match(/\b(19|20)\d{2}\b/);
  if (!match) return null;
  return Number(match[0]);
}

export function normalizeResumeForPdf(resumeData) {
  const warnings = [];
  const source = resumeData || {};

  const rawSkills = splitByCommaOrLine(source.skills?.primarySkills || "");
  const normalizedSkills = cleanList(rawSkills, LIMITS.maxSkills, 40);
  if (rawSkills.length > normalizedSkills.length) {
    warnings.push("Skill list trimmed for cleaner resume density.");
  }

  const rawExperience = Array.isArray(source.experience) ? source.experience : [];
  const meaningfulExperience = rawExperience.filter((item) => {
    return Boolean(
      cleanText(item?.jobTitle) ||
      cleanText(item?.employer) ||
      splitBullets(item?.bullets).length
    );
  });
  const experience = meaningfulExperience.slice(0, LIMITS.maxExperienceEntries).map((item) => {
    const rawBullets = item?.bullets || "";
    const bulletHasHtml = String(rawBullets).includes("<");
    const bullets = bulletHasHtml
      ? String(rawBullets)
      : cleanList(splitBullets(rawBullets), LIMITS.maxBulletsPerExperience, LIMITS.maxBulletChars).join("\n");
    return {
      ...item,
      jobTitle: cleanText(item?.jobTitle),
      employer: cleanText(item?.employer),
      city: cleanText(item?.city),
      country: cleanText(item?.country),
      startDate: cleanText(item?.startDate),
      endDate: cleanText(item?.endDate),
      bullets
    };
  });

  if (meaningfulExperience.length > experience.length) {
    warnings.push("Experience entries trimmed to keep layout professional.");
  }

  const rawEducation = Array.isArray(source.education) ? source.education : [];
  const meaningfulEducation = rawEducation.filter((item) => {
    return Boolean(cleanText(item?.degree) || cleanText(item?.institution));
  });
  const education = meaningfulEducation.slice(0, LIMITS.maxEducationEntries).map((item) => {
    const rawDetails = item?.details || "";
    const detailHasHtml = String(rawDetails).includes("<");
    const details = detailHasHtml
      ? String(rawDetails)
      : cleanList(splitBullets(rawDetails), LIMITS.maxBulletsPerEducation, LIMITS.maxBulletChars).join("\n");
    return {
      ...item,
      degree: cleanText(item?.degree),
      institution: cleanText(item?.institution),
      city: cleanText(item?.city),
      country: cleanText(item?.country),
      fieldOfStudy: cleanText(item?.fieldOfStudy),
      startDate: cleanText(item?.startDate),
      endDate: cleanText(item?.endDate),
      details
    };
  });

  if (meaningfulEducation.length > education.length) {
    warnings.push("Education entries trimmed to improve visual balance.");
  }

  const rawSections = Array.isArray(source.additional?.sections) ? source.additional.sections : [];
  const additionalSections = rawSections
    .filter((section) => cleanText(section?.title))
    .slice(0, LIMITS.maxAdditionalSections)
    .map((section) => {
      const items = cleanList(
        Array.isArray(section?.items) ? section.items : [],
        LIMITS.maxItemsPerAdditionalSection,
        LIMITS.maxBulletChars
      );
      return {
        ...section,
        title: clampText(cleanText(section?.title), 38),
        items
      };
    })
    .filter((section) => section.items.length);

  if (rawSections.length > additionalSections.length) {
    warnings.push("Additional sections trimmed for print readability.");
  }

  const rawSummaryText = source.summary?.text || "";
  const summaryHasHtml = String(rawSummaryText).includes("<");
  const summary = summaryHasHtml
    ? String(rawSummaryText)
    : clampText(cleanText(rawSummaryText), LIMITS.summaryMaxChars);
  if (!summaryHasHtml && cleanText(rawSummaryText).length > summary.length) {
    warnings.push("Summary shortened to avoid dense paragraphs.");
  }

  return {
    data: {
      ...source,
      header: {
        ...(source.header || {}),
        fullName: cleanText(source.header?.fullName),
        email: cleanText(source.header?.email),
        phone: cleanText(source.header?.phone),
        location: cleanText(source.header?.location),
        headline: cleanText(source.header?.headline)
      },
      experience,
      education,
      skills: {
        ...(source.skills || {}),
        primarySkills: normalizedSkills.join(", ")
      },
      summary: {
        ...(source.summary || {}),
        text: summary
      },
      additional: {
        ...(source.additional || {}),
        linkedin: cleanText(source.additional?.linkedin),
        portfolio: cleanText(source.additional?.portfolio),
        certifications: cleanText(source.additional?.certifications),
        sections: additionalSections
      }
    },
    limits: LIMITS,
    warnings
  };
}

export function buildProfessionalQualityReport({ rawData, normalizedData, estimatedPages = 1 }) {
  const checks = [];
  let score = 100;

  const email = cleanText(rawData?.header?.email);
  const phone = cleanText(rawData?.header?.phone);
  const location = cleanText(rawData?.header?.location);
  const headline = cleanText(rawData?.header?.headline);

  const contactPresent = Boolean(email && phone && location);
  checks.push({
    key: "contact",
    label: "Contact completeness",
    status: contactPresent ? "ok" : "warn",
    message: contactPresent ? "Email, phone, and location are present." : "Add email, phone, and location for professional completeness."
  });
  if (!contactPresent) score -= 12;

  checks.push({
    key: "headline",
    label: "Target role headline",
    status: headline ? "ok" : "warn",
    message: headline ? "Headline is set." : "Add a clear role headline under your name."
  });
  if (!headline) score -= 8;

  const summaryLength = cleanText(rawData?.summary?.text).length;
  const summaryHealthy = summaryLength >= 70 && summaryLength <= LIMITS.summaryMaxChars;
  checks.push({
    key: "summary",
    label: "Summary quality",
    status: summaryHealthy ? "ok" : "warn",
    message: summaryHealthy ? "Summary length looks balanced." : "Keep summary concise (about 70-420 chars) and impact-focused."
  });
  if (!summaryHealthy) score -= 10;

  const skillsCount = splitByCommaOrLine(normalizedData?.skills?.primarySkills || "").length;
  const skillHealthy = skillsCount >= 6 && skillsCount <= LIMITS.maxSkills;
  checks.push({
    key: "skills",
    label: "Skills density",
    status: skillHealthy ? "ok" : "warn",
    message: skillHealthy ? `${skillsCount} skills listed.` : "Aim for 6-16 focused skills relevant to target roles."
  });
  if (!skillHealthy) score -= 8;

  const bullets = (Array.isArray(normalizedData?.experience) ? normalizedData.experience : [])
    .flatMap((item) => splitBullets(item?.bullets || ""));
  const quantifiedPattern = /\b\d+(\.\d+)?\s?(%|k|m|x|years?|months?|users?|projects?|clients?)?\b/i;
  const quantifiedHits = bullets.filter((bullet) => quantifiedPattern.test(bullet)).length;
  const hasQuantified = quantifiedHits >= 2;
  checks.push({
    key: "metrics",
    label: "Quantified achievements",
    status: hasQuantified ? "ok" : "warn",
    message: hasQuantified ? "Experience includes measurable results." : "Add numbers in bullet points (%, time saved, growth, users, revenue)."
  });
  if (!hasQuantified) score -= 12;

  const expYearIssues = (Array.isArray(normalizedData?.experience) ? normalizedData.experience : []).some((item) => {
    const start = extractYear(item?.startDate);
    const end = extractYear(item?.currentlyWorking ? "" : item?.endDate);
    return start && end && start > end;
  });
  checks.push({
    key: "dates",
    label: "Date consistency",
    status: expYearIssues ? "warn" : "ok",
    message: expYearIssues ? "Some job dates look inconsistent (start year after end year)." : "Date ranges look consistent."
  });
  if (expYearIssues) score -= 8;

  const pageFitOk = estimatedPages <= 2;
  checks.push({
    key: "length",
    label: "Page fit",
    status: pageFitOk ? "ok" : "warn",
    message: pageFitOk ? `Estimated ${estimatedPages} page(s).` : `Estimated ${estimatedPages} pages; reduce content for better recruiter scan speed.`
  });
  if (!pageFitOk) score -= 10;

  const truncationWarnings = Array.isArray(normalizedData?._warnings) ? normalizedData._warnings : [];
  checks.push({
    key: "trim",
    label: "Layout safety trims",
    status: truncationWarnings.length ? "warn" : "ok",
    message: truncationWarnings.length ? truncationWarnings[0] : "No auto-trimming needed."
  });
  if (truncationWarnings.length) score -= 6;

  return {
    score: Math.max(1, Math.min(100, Math.round(score))),
    checks,
    blockingCount: checks.filter((item) => item.status === "warn").length
  };
}

export function measureResumeContentHeight(targetNode) {
  if (!targetNode) return 0;

  const rootRect = targetNode.getBoundingClientRect();
  let maxBottom = rootRect.height || 0;
  const nodes = [targetNode, ...targetNode.querySelectorAll("*")];

  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const style = window.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || style.position === "fixed") return;

    const bottom = (rect.bottom - rootRect.top) + targetNode.scrollTop;
    if (Number.isFinite(bottom)) {
      maxBottom = Math.max(maxBottom, bottom);
    }
  });

  return Math.ceil(maxBottom);
}

export function resolveResumeCanvasHeight(targetNode, pageHeightPx) {
  if (!targetNode) return pageHeightPx;

  const scrollHeight = Math.ceil(targetNode.scrollHeight || pageHeightPx || 0);
  const contentHeight = Math.ceil(measureResumeContentHeight(targetNode) + 2);
  const effectiveHeight = Math.max(pageHeightPx || 0, Math.min(scrollHeight, contentHeight));

  if (effectiveHeight <= (pageHeightPx || 0) + PAGE_HEIGHT_TOLERANCE_PX) {
    return pageHeightPx;
  }

  return effectiveHeight;
}

export function estimateResumePageCount(targetNode, pageHeightPx) {
  if (!targetNode || !pageHeightPx) return 1;

  const effectiveHeight = resolveResumeCanvasHeight(targetNode, pageHeightPx);
  return Math.max(1, Math.ceil((effectiveHeight - PAGE_HEIGHT_TOLERANCE_PX) / pageHeightPx));
}

export function computeSmartPageOffsets({
  targetNode,
  imageHeightPt,
  pageHeightPt,
  pageWidthPt,
  canvasWidthPx
}) {
  if (!targetNode || imageHeightPt <= pageHeightPt + PAGE_HEIGHT_TOLERANCE_PT) return [0];

  const sectionNodes = Array.from(
    targetNode.querySelectorAll("section, [data-resume-section='true'], h3")
  );

  const pxToPt = pageWidthPt / Math.max(canvasWidthPx || 1, 1);
  const rootTop = targetNode.getBoundingClientRect().top;
  const sectionBreaks = sectionNodes
    .map((node) => ((node.getBoundingClientRect().top - rootTop) + targetNode.scrollTop) * pxToPt)
    .filter((value) => Number.isFinite(value) && value > 40 && value < imageHeightPt - 40)
    .sort((a, b) => a - b);

  const offsets = [0];
  let current = 0;
  const minChunk = pageHeightPt * 0.68;
  const tolerance = pageHeightPt * 0.18;
  let guard = 0;

  while (current + pageHeightPt < imageHeightPt && guard < 40) {
    guard += 1;
    const ideal = current + pageHeightPt;
    const possible = sectionBreaks.filter((point) => point > current + minChunk && point <= ideal + tolerance);
    const upToIdeal = possible.filter((point) => point <= ideal);
    const candidate = upToIdeal.length
      ? upToIdeal[upToIdeal.length - 1]
      : (possible.length ? possible[0] : null);

    const next = candidate && candidate > current + minChunk ? candidate : ideal;
    if (next <= current + 2) break;
    if (imageHeightPt - next <= PAGE_HEIGHT_TOLERANCE_PT) break;

    offsets.push(next);
    current = next;
  }

  return offsets;
}
