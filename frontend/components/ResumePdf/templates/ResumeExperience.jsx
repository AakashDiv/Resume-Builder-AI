import { hasHtmlMarkup, sanitizeRichHtml, splitBullets } from "../common/previewUtils.js";

function buildDateRange(item) {
  const start = String(item?.startDate || "").trim();
  const end = item?.currentlyWorking ? "Present" : String(item?.endDate || "").trim();
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
}

export default function ResumeExperience({ experience = [] }) {
  const valid = experience.filter(
    (item) => item?.jobTitle || item?.employer || String(item?.bullets || "").trim()
  );
  if (!valid.length) return null;

  return (
    <section className="section" data-resume-section="true">
      <h2 className="section-title">Experience</h2>
      {valid.map((item, index) => {
        const bullets = splitBullets(item.bullets || "");
        const location = [item.city, item.country].filter(Boolean).join(", ");
        const dateRange = buildDateRange(item);

        return (
          <article className="job" key={`${item.jobTitle || "role"}-${index}`}>
            <div className="job-header">
              <div className="job-title-block">
                <p className="job-title">{item.jobTitle || "Role"}</p>
                {item.employer ? <p className="job-company">{item.employer}</p> : null}
              </div>
              {dateRange ? <p className="job-meta">{dateRange}</p> : null}
            </div>
            {location ? <p className="job-location">{location}</p> : null}
            {hasHtmlMarkup(item.bullets) ? (
              <div
                className="rich-bullets"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(item.bullets) }}
              />
            ) : bullets.length ? (
              <ul className="resume-list">
                {bullets.map((bullet, bulletIndex) => (
                  <li key={`${index}-${bulletIndex}`}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
