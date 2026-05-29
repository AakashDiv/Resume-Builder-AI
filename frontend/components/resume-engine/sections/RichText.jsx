import { hasHtmlMarkup, sanitizeRichHtml } from "../../ResumePdf/common/previewUtils.js";

export default function RichText({ value, className = "resume-paragraph" }) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (hasHtmlMarkup(raw)) {
    return (
      <div
        className="resume-rich"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(raw) }}
      />
    );
  }

  return <p className={className}>{raw}</p>;
}
