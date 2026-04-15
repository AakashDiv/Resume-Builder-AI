import { splitBullets } from "../common/previewUtils.js";

function buildDateRange(item) {
  const start = String(item?.startDate || "").trim();
  const end = item?.currentlyStudying ? "Present" : String(item?.endDate || "").trim();
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
}

export default function ResumeEducation({ education = [] }) {
  const valid = education.filter((item) => item?.degree || item?.institution);
  if (!valid.length) return null;

  return (
    <section className="section" data-resume-section="true">
      <h2 className="section-title">Education</h2>
      {valid.map((item, index) => {
        const details = splitBullets(item.details || "");
        return (
          <article className="education-entry" key={`${item.degree || "degree"}-${index}`}>
            <div className="job-header">
              <p className="education-title">{item.degree || "Degree"}</p>
              <p className="job-meta">{buildDateRange(item)}</p>
            </div>
            <p className="education-meta">
              {[item.institution, item.fieldOfStudy || item.country].filter(Boolean).join(" | ")}
            </p>
            {details.length ? (
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
