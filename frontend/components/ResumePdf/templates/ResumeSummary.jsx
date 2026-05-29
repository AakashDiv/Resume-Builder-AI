import { hasHtmlMarkup, sanitizeRichHtml } from "../common/previewUtils.js";

export default function ResumeSummary({ text = "" }) {
  if (!String(text || "").trim()) return null;

  return (
    <section className="section" data-resume-section="true">
      <h2 className="section-title">Summary</h2>
      {hasHtmlMarkup(text) ? (
        <div
          className="summary-rich"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(text) }}
        />
      ) : (
        <p className="summary-text">{text}</p>
      )}
    </section>
  );
}
