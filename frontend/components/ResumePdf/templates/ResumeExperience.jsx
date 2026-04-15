import { splitBullets } from "../common/previewUtils.js";

function buildDateRange(item) {
  const start = String(item?.startDate || "").trim();
  const end = item?.currentlyWorking ? "Present" : String(item?.endDate || "").trim();
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
}

export default function ResumeExperience({ experience = [] }) {
  const valid = experience.filter((item) => item?.jobTitle || item?.employer || String(item?.bullets || "").trim());
  if (!valid.length) return null;

  return (
    <section className="section" data-resume-section="true">
      <h2 className="section-title">Experience</h2>
      {valid.map((item, index) => {
        const bullets = splitBullets(item.bullets || "");
        const location = [item.city, item.country].filter(Boolean).join(", ");

        return (
          <article className="job" key={`${item.jobTitle || "role"}-${index}`}>
            <div className="job-header">
              <p className="job-title">
                {item.jobTitle || "Role"}{item.employer ? <span className="job-company"> - {item.employer}</span> : null}
              </p>
              <p className="job-meta">{buildDateRange(item)}</p>
            </div>
            {location ? <p className="job-location">{location}</p> : null}
            {bullets.length ? (
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
