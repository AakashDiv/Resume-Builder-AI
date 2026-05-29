import { hasHtmlMarkup, sanitizeRichHtml, splitBullets, splitByCommaOrLine, getAdditionalSections, getSectionByTitle } from "../common/previewUtils.js";

function SectionTitle({ children }) {
  return (
    <h3
      style={{
        fontSize: "9pt",
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        marginTop: "16px",
        marginBottom: "6px",
        paddingBottom: "4px",
        borderBottom: "1.5px solid #111111",
        color: "#111111"
      }}
    >
      {children}
    </h3>
  );
}

function ContactItem({ children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export default function SimplePreview({ data }) {
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const certificationsSection = getSectionByTitle(data.additional, "Certifications & Licenses");
  const languagesSection = getSectionByTitle(data.additional, "Languages");
  const certifications = splitByCommaOrLine(
    (certificationsSection?.items || []).join("\n") || data.additional.certifications
  );
  const languages = splitByCommaOrLine(
    (languagesSection?.items || []).join("\n") || data.additional.languages || ""
  );
  const extraSections = getAdditionalSections(data.additional).filter(
    (section) =>
      !["certifications & licenses", "languages"].includes(
        String(section?.title || "").trim().toLowerCase()
      ) &&
      Array.isArray(section?.items) &&
      section.items.some((item) => String(item || "").trim())
  );

  const contactParts = [
    data.header.email,
    data.header.phone,
    data.header.location,
    data.additional?.linkedin || null,
    data.additional?.portfolio || null,
  ].filter(Boolean);

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
      {/* Header */}
      <h1 style={{ fontSize: "26pt", fontWeight: 700, marginBottom: "3px", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
        {data.header.fullName || "Your Name"}
      </h1>
      {data.header.headline ? (
        <p style={{ fontSize: "11pt", color: "#444", marginBottom: "8px", fontStyle: "italic" }}>
          {data.header.headline}
        </p>
      ) : null}
      {contactParts.length ? (
        <p style={{ fontSize: "9.5pt", color: "#444", marginBottom: "0", lineHeight: 1.7, display: "flex", flexWrap: "wrap", gap: "2px 14px" }}>
          {contactParts.map((part, idx) => (
            <ContactItem key={idx}>{part}</ContactItem>
          ))}
        </p>
      ) : null}

      {/* Summary */}
      {String(data.summary?.text || "").trim() ? (
        <>
          <SectionTitle>Summary</SectionTitle>
          {hasHtmlMarkup(data.summary.text) ? (
            <div
              style={{ fontSize: "10.5pt", lineHeight: 1.6 }}
              className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }}
            />
          ) : (
            <p style={{ fontSize: "10.5pt", lineHeight: 1.6 }}>{data.summary.text}</p>
          )}
        </>
      ) : null}

      {/* Experience */}
      <SectionTitle>Experience</SectionTitle>
      {data.experience.map((exp, index) => {
        const bulletList = splitBullets(exp.bullets);
        const dateStr = [
          exp.startDate || "",
          exp.currentlyWorking ? "Present" : (exp.endDate || "")
        ].filter(Boolean).join(" – ");
        const location = [exp.city, exp.country].filter(Boolean).join(", ");

        return (
          <div key={`${exp.jobTitle}-${index}`} style={{ marginTop: index === 0 ? "0" : "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <p style={{ fontWeight: 700, fontSize: "11.5pt", margin: 0 }}>
                {exp.employer || "Company Name"}
              </p>
              <p style={{ fontSize: "10pt", color: "#444", margin: 0, whiteSpace: "nowrap", flexShrink: 0 }}>
                {dateStr}
              </p>
            </div>
            <p style={{ fontStyle: "italic", fontSize: "11pt", marginBottom: "5px", marginTop: "1px", color: "#333" }}>
              {exp.jobTitle || "Job Title"}{location ? ` · ${location}` : ""}
            </p>
            {hasHtmlMarkup(exp.bullets) ? (
              <div
                style={{ fontSize: "10.5pt", lineHeight: 1.55 }}
                className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
              />
            ) : (
              <ul style={{ margin: "4px 0 0 18px", padding: 0, listStyleType: "disc" }}>
                {(bulletList.length ? bulletList : ["Add measurable impact bullet points here."]).map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={{ marginBottom: "3px", fontSize: "10.5pt", lineHeight: 1.5 }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* Education */}
      <SectionTitle>Education</SectionTitle>
      {data.education.map((edu, index) => {
        const gradDate = edu.currentlyStudying ? "Present" : edu.endDate || "Graduation Year";
        const location = [edu.city, edu.country].filter(Boolean).join(", ");
        return (
          <div key={`${edu.degree}-${index}`} style={{ marginTop: index === 0 ? "0" : "10px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <p style={{ fontWeight: 700, fontSize: "11.5pt", margin: 0 }}>
                {edu.institution || "Institution"}
              </p>
              <p style={{ fontSize: "10pt", color: "#444", margin: 0, whiteSpace: "nowrap", flexShrink: 0 }}>
                {gradDate}
              </p>
            </div>
            <p style={{ fontStyle: "italic", fontSize: "11pt", marginTop: "1px", color: "#333" }}>
              {edu.degree || "Degree"}
              {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
              {location ? ` · ${location}` : ""}
            </p>
            {hasHtmlMarkup(edu.details) ? (
              <div
                style={{ fontSize: "10.5pt", lineHeight: 1.55 }}
                className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(edu.details) }}
              />
            ) : splitBullets(edu.details).length ? (
              <ul style={{ margin: "4px 0 0 18px", padding: 0, listStyleType: "disc" }}>
                {splitBullets(edu.details).map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={{ marginBottom: "3px", fontSize: "10.5pt", lineHeight: 1.5 }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}

      {/* Skills & Certifications */}
      <SectionTitle>Skills &amp; More</SectionTitle>
      <ul style={{ margin: "0 0 0 18px", padding: 0, listStyleType: "disc" }}>
        {skills.length ? (
          <li style={{ marginBottom: "4px", fontSize: "10.5pt" }}>
            <strong>Technical Skills:</strong> {skills.join(", ")}
          </li>
        ) : null}
        {certifications.length ? (
          <li style={{ marginBottom: "4px", fontSize: "10.5pt" }}>
            <strong>Certifications:</strong> {certifications.join(", ")}
          </li>
        ) : null}
        {languages.length ? (
          <li style={{ marginBottom: "4px", fontSize: "10.5pt" }}>
            <strong>Languages:</strong> {languages.join(", ")}
          </li>
        ) : null}
      </ul>

      {/* Extra sections */}
      {extraSections.map((section) => (
        <div key={section.id || section.title}>
          <SectionTitle>{section.title || "Additional"}</SectionTitle>
          <ul style={{ margin: "0 0 0 18px", padding: 0, listStyleType: "disc" }}>
            {section.items
              .filter((item) => String(item || "").trim())
              .slice(0, 6)
              .map((item, index) => (
                <li key={`${section.title}-${index}`} style={{ marginBottom: "3px", fontSize: "10.5pt", lineHeight: 1.5 }}>
                  {item}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </article>
  );
}
