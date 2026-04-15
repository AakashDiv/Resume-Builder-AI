import DOMPurify from "dompurify";

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

