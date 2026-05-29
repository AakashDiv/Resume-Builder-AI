import { splitBullets } from "../../ResumePdf/common/previewUtils.js";
import { formatRange } from "../utils/resumeContent.js";
import RichText from "./RichText.jsx";

export default function ResumeExperience({ section }) {
  return (
    <div className="resume-entry-stack">
      {section.data.experience.map((item, index) => {
        const bullets = splitBullets(item.bullets || "");
        const location = [item.city, item.country].filter(Boolean).join(", ");
        const date = formatRange(item.startDate, item.endDate, item.currentlyWorking);

        return (
          <article className="resume-entry" key={item.id || `${item.jobTitle}-${index}`}>
            <div className="resume-entry-heading">
              <div>
                <h3 className="resume-entry-title">{item.jobTitle || "Role"}</h3>
                <p className="resume-entry-subtitle">
                  {[item.employer || "Company", location].filter(Boolean).join(" | ")}
                </p>
              </div>
              {date ? <p className="resume-entry-meta">{date}</p> : null}
            </div>

            {String(item.bullets || "").includes("<") ? (
              <RichText value={item.bullets} />
            ) : bullets.length ? (
              <ul className="resume-list">
                {bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
