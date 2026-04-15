export default function ResumeSummary({ text = "" }) {
  if (!String(text || "").trim()) return null;

  return (
    <section className="section" data-resume-section="true">
      <h2 className="section-title">Summary</h2>
      <p className="summary-text">{text}</p>
    </section>
  );
}
