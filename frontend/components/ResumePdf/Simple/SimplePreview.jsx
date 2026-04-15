import { hasHtmlMarkup, sanitizeRichHtml, splitBullets, splitByCommaOrLine, getAdditionalSections, getSectionByTitle } from "../common/previewUtils.js";
import { FaCalendarDays, FaEnvelope, FaLocationDot, FaPhone } from "react-icons/fa6";

function SimpleSectionTitle({ children }) {
  return (
    <h3
      style={{
        fontSize: "12pt",
        fontWeight: 700,
        letterSpacing: "1px",
        marginTop: "18px",
        marginBottom: "6px",
        paddingBottom: "4px",
        borderBottom: "1.5px solid #000"
      }}
    >
      {children}
    </h3>
  );
}

export default function SimplePreview({ data }) {
  const technicalSkills = splitByCommaOrLine(data.skills.primarySkills).join(", ");
  const certificationsSection = getSectionByTitle(data.additional, "Certifications & Licenses");
  const languagesSection = getSectionByTitle(data.additional, "Languages");
  const certifications = splitByCommaOrLine(
    (certificationsSection?.items || []).join("\n") || data.additional.certifications
  ).join(", ");
  const languages = splitByCommaOrLine((languagesSection?.items || []).join("\n") || data.additional.languages || "").join(", ");
  const extraSections = getAdditionalSections(data.additional).filter(
    (section) =>
      !["certifications & licenses", "languages"].includes(String(section?.title || "").trim().toLowerCase()) &&
      Array.isArray(section?.items) &&
      section.items.some((item) => String(item || "").trim())
  );

  return (
    <article
      data-resume-padding="true"
      className="h-full w-full bg-white text-[#111111]"
      style={{
        fontFamily: '"Times New Roman", Georgia, serif',
        fontSize: "11pt",
        lineHeight: 1.5,
        padding: "20mm 18mm"
      }}
    >
      <div className="h-full w-full">
        <h1 style={{ fontSize: "24pt", fontWeight: 600, marginBottom: "4px", lineHeight: 1.2 }}>
          {data.header.fullName || "Your Name"}
        </h1>
        <p style={{ fontSize: "10.5pt", color: "#444", marginBottom: "18px" }}>
          {[data.header.email ? <span key="e" className="inline-flex items-center gap-1"><FaEnvelope size={10} /> {data.header.email}</span> : null, data.header.phone ? <span key="p" className="inline-flex items-center gap-1"><FaPhone size={10} /> {data.header.phone}</span> : null, data.header.location ? <span key="l" className="inline-flex items-center gap-1"><FaLocationDot size={10} /> {data.header.location}</span> : null].filter(Boolean).map((part, idx) => <span key={idx}>{part}</span>).reduce((acc, curr) => (acc.length ? [...acc, " | ", curr] : [curr]), []) ||
            "email@example.com | +91 99999 99999 | City, Country"}
        </p>

        <SimpleSectionTitle>EXPERIENCE</SimpleSectionTitle>
        {data.experience.map((exp, index) => {
          const bulletList = splitBullets(exp.bullets);
          return (
            <div key={`${exp.jobTitle}-${index}`} style={{ marginTop: "12px" }}>
              <div className="flex items-start justify-between gap-4" style={{ fontWeight: 700, fontSize: "11.5pt" }}>
                <p>{exp.employer || "Company Name"}</p>
                <p>
                  <span className="inline-flex items-center gap-1"><FaCalendarDays size={11} /> {exp.startDate || "Start"} {exp.currentlyWorking ? "- Present" : exp.endDate ? `- ${exp.endDate}` : "- End"}</span>
                </p>
              </div>

              <p style={{ fontStyle: "italic", fontSize: "11pt", marginBottom: "4px" }}>
                {exp.jobTitle || "Job Title"} | {[exp.city, exp.country].filter(Boolean).join(", ") || "Location"}
              </p>

              {hasHtmlMarkup(exp.bullets) ? (
                <div
                  className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
                />
              ) : (
                <ul style={{ margin: "4px 0 8px 18px", padding: 0, listStyleType: "disc" }}>
                  {(bulletList.length ? bulletList : ["Add measurable impact bullet points here."]).map((bullet, bulletIndex) => (
                    <li key={bulletIndex} style={{ marginBottom: "4px" }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        <SimpleSectionTitle>EDUCATION</SimpleSectionTitle>
        {data.education.map((edu, index) => (
          <div key={`${edu.degree}-${index}`} style={{ marginTop: "10px" }}>
            <div className="flex items-start justify-between gap-4" style={{ fontWeight: 700, fontSize: "11.5pt" }}>
              <p>{edu.institution || "Institution"}</p>
              <p><span className="inline-flex items-center gap-1"><FaCalendarDays size={11} /> {edu.endDate || "Graduation Date"}</span></p>
            </div>
            <p style={{ fontStyle: "italic", fontSize: "11pt" }}>
              {edu.degree || "Degree"} | {[edu.city, edu.country].filter(Boolean).join(", ") || "Location"}
            </p>
            {hasHtmlMarkup(edu.details) ? (
              <div
                className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(edu.details) }}
              />
            ) : splitBullets(edu.details).length ? (
              <ul style={{ margin: "4px 0 8px 18px", padding: 0, listStyleType: "disc" }}>
                {splitBullets(edu.details).slice(0, 4).map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={{ marginBottom: "4px" }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}

        <SimpleSectionTitle>OTHER</SimpleSectionTitle>
        <ul style={{ margin: "4px 0 8px 18px", padding: 0, listStyleType: "disc" }}>
          <li style={{ marginBottom: "4px" }}>
            <strong>Technical Skills:</strong> {technicalSkills || "Add your key technical skills"}
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Certifications:</strong> {certifications || "Add certifications"}
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Languages:</strong> {languages || "Add languages"}
          </li>
        </ul>

        {extraSections.map((section) => (
          <div key={section.id || section.title}>
            <SimpleSectionTitle>{section.title || "Additional"}</SimpleSectionTitle>
            <ul style={{ margin: "4px 0 8px 18px", padding: 0, listStyleType: "disc" }}>
              {section.items.filter((item) => String(item || "").trim()).slice(0, 6).map((item, index) => (
                <li key={`${section.title}-${index}`} style={{ marginBottom: "4px" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}


