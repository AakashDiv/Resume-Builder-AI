import { hasHtmlMarkup, sanitizeRichHtml, splitBullets } from "../common/previewUtils.js";

function buildDateRange(item) {
  const start = String(item?.startDate || "").trim();
  const end = item?.currentlyStudying ? "Present" : String(item?.endDate || "").trim();
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
}

export default function ResumeEducation({ education = [] }) {
  const valid = education.filter((item) => item?.degree || item?.institution);
  if (!valid.length) return null;

  return (
    <section className="section" data-resume-section="true">
      <h2 className="section-title">Education</h2>
      {valid.map((item, index) => {
        const details = splitBullets(item.details || "");
        const dateRange = buildDateRange(item);
        const locationLine = item.city ? item.city : "";

        return (
          <article className="education-entry" key={`${item.degree || "degree"}-${index}`}>
            <div className="job-header">
              <div className="job-title-block">
                <p className="education-title">{item.degree || "Degree"}</p>
                {item.institution ? <p className="education-school">{item.institution}</p> : null}
                {item.fieldOfStudy ? <p className="education-field">{item.fieldOfStudy}</p> : null}
              </div>
              {dateRange ? <p className="job-meta">{dateRange}</p> : null}
            </div>
            {locationLine ? <p className="education-field">{locationLine}</p> : null}
            {hasHtmlMarkup(item.details) ? (
              <div
                className="rich-bullets"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(item.details) }}
              />
            ) : details.length ? (
              <ul className="resume-list">
                {details.map((detail, detailIndex) => (
                  <li key={`${index}-${detailIndex}`}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
