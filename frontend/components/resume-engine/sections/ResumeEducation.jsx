import { splitBullets } from "../../ResumePdf/common/previewUtils.js";
import { formatRange } from "../utils/resumeContent.js";
import RichText from "./RichText.jsx";

export default function ResumeEducation({ section }) {
  return (
    <div className="resume-entry-stack">
      {section.data.education.map((item, index) => {
        const details = splitBullets(item.details || "");
        const location = [item.city, item.country].filter(Boolean).join(", ");
        const subtitle = [item.institution || "Institution", item.fieldOfStudy, location].filter(Boolean).join(" | ");
        const date = formatRange(item.startDate, item.endDate, item.currentlyStudying);

        return (
          <article className="resume-entry" key={item.id || `${item.degree}-${index}`}>
            <div className="resume-entry-heading">
              <div>
                <h3 className="resume-entry-title">{item.degree || "Degree"}</h3>
                {subtitle ? <p className="resume-entry-subtitle">{subtitle}</p> : null}
              </div>
              {date ? <p className="resume-entry-meta">{date}</p> : null}
            </div>

            {String(item.details || "").includes("<") ? (
              <RichText value={item.details} />
            ) : details.length ? (
              <ul className="resume-list">
                {details.map((detail, detailIndex) => (
                  <li key={detailIndex}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
