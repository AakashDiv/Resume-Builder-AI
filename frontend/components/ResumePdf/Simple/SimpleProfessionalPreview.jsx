import { hasHtmlMarkup, sanitizeRichHtml, splitBullets, splitByCommaOrLine, getAdditionalSections, getSectionByTitle, extractPlainText } from "../common/previewUtils.js";
import { FaCalendarDays, FaEnvelope, FaGlobe, FaLinkedin, FaLocationDot, FaPhone } from "react-icons/fa6";

function parseProjectItem(item) {
  const raw = String(item || "").trim();
  if (!raw) return null;
  const parts = raw.split("|").map((part) => part.trim());
  if (parts.length >= 4) {
    return { name: parts[0], type: parts[1], year: parts[2], desc: parts.slice(3).join(" | ") };
  }
  return { name: raw, type: "", year: "", desc: "" };
}

export default function SimpleProfessionalPreview({
  data,
  accentColor = "#2563a8",
  primaryTextColor = "#1a1a1a",
  mutedTextColor = "#6b6b6b",
  mainBgColor = "#ffffff"
}) {
  const projectsSection = getSectionByTitle(data.additional, "Projects");
  const projects = (projectsSection?.items || []).map(parseProjectItem).filter(Boolean);
  const skills = splitByCommaOrLine(data.skills.primarySkills);
  const extraSections = getAdditionalSections(data.additional).filter((section) => {
    const title = String(section?.title || "").trim().toLowerCase();
    return !["projects"].includes(title) && Array.isArray(section?.items) && section.items.some((item) => String(item || "").trim());
  });

  const website = data.additional.portfolio || "";
  const linkedin = data.additional.linkedin || "";

  return (
    <article
      data-resume-padding="true"
      className="h-full w-full"
      style={{
        background: mainBgColor,
        color: primaryTextColor,
        fontFamily: "Lora, Georgia, serif",
        padding: "52px 60px 60px"
      }}
    >
      <h1 style={{ fontSize: "34px", fontWeight: 700, letterSpacing: "-.01em", lineHeight: 1.1 }}>
        {data.header.fullName || "Your Name"}
      </h1>
      <p style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "15px", color: mutedTextColor, marginBottom: "18px" }}>
        {data.header.headline || "Professional Title"}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "20px",
          padding: "10px 0",
          borderTop: `1px solid ${mutedTextColor}40`,
          borderBottom: `1px solid ${mutedTextColor}40`,
          marginBottom: "28px",
          fontFamily: "DM Sans, Arial, sans-serif",
          fontSize: "11.5px",
          color: "#3d3d3d"
        }}
      >
        {data.header.location ? <span className="inline-flex items-center gap-1"><FaLocationDot size={11} /> {data.header.location}</span> : null}
        {website ? <span className="inline-flex items-center gap-1" style={{ color: accentColor }}><FaGlobe size={11} /> {website}</span> : null}
        {linkedin ? <span className="inline-flex items-center gap-1" style={{ color: accentColor }}><FaLinkedin size={11} /> {linkedin}</span> : null}
        {data.header.email ? <span className="inline-flex items-center gap-1" style={{ color: accentColor }}><FaEnvelope size={11} /> {data.header.email}</span> : null}
        {data.header.phone ? <span className="inline-flex items-center gap-1" style={{ color: accentColor }}><FaPhone size={11} /> {data.header.phone}</span> : null}
      </div>

      <SectionTitle title="Personal Statement" mutedTextColor={mutedTextColor} />
      {hasHtmlMarkup(data.summary.text) ? (
        <div
          style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "13.5px", lineHeight: 1.75, color: "#3d3d3d" }}
          className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }}
        />
      ) : (
        <p style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "13.5px", lineHeight: 1.75, color: "#3d3d3d" }}>
          {data.summary.text || "Add your personal statement."}
        </p>
      )}

      <Divider mutedTextColor={mutedTextColor} />

      <SectionTitle title="Experience" mutedTextColor={mutedTextColor} />
      {data.experience.map((exp, index) => (
        <div key={`${exp.jobTitle}-${index}`} style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700 }}>
              {(exp.employer || "Company")}{exp.jobTitle ? ` - ${exp.jobTitle}` : ""}
            </p>
            <p style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "11.5px", color: mutedTextColor, whiteSpace: "nowrap" }}>
              <span className="inline-flex items-center gap-1"><FaCalendarDays size={11} /> {exp.startDate || "Start"} {exp.currentlyWorking ? "- Present" : exp.endDate ? `- ${exp.endDate}` : ""}</span>
            </p>
          </div>
          <p style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "12px", color: mutedTextColor, fontStyle: "italic", marginBottom: "7px" }}>
            {[exp.city, exp.country].filter(Boolean).join(", ") || "Location"}
          </p>

          {hasHtmlMarkup(exp.bullets) ? (
            <div
              className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5"
              style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "12.5px", color: "#3d3d3d", lineHeight: 1.55 }}
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
            />
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
              {(splitBullets(exp.bullets).length ? splitBullets(exp.bullets) : ["Add impact-focused bullet points."]).map((bullet, bulletIndex) => (
                <li key={bulletIndex} style={{ display: "flex", gap: "8px", fontFamily: "DM Sans, Arial, sans-serif", fontSize: "12.5px", color: "#3d3d3d", lineHeight: 1.55 }}>
                  <span style={{ color: accentColor, fontSize: "18px", lineHeight: 1 }}>-</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <Divider mutedTextColor={mutedTextColor} />

      <SectionTitle title="Education" mutedTextColor={mutedTextColor} />
      {data.education.map((edu, index) => (
        <div key={`${edu.degree}-${index}`} style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <p style={{ fontWeight: 700, fontSize: "14px" }}>{edu.degree || "Degree"}</p>
            <p style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "11.5px", color: mutedTextColor }}>
              <span className="inline-flex items-center gap-1"><FaCalendarDays size={11} /> {edu.startDate || "Start"} {edu.currentlyStudying ? "- Present" : edu.endDate ? `- ${edu.endDate}` : ""}</span>
            </p>
          </div>
          <p style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "12px", color: mutedTextColor, fontStyle: "italic" }}>
            {(edu.institution || "Institution") + (edu.fieldOfStudy ? ` | ${edu.fieldOfStudy}` : "")}
          </p>
          {edu.details ? (
            <p style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "12px", color: mutedTextColor, marginTop: "3px" }}>
              {extractPlainText(edu.details)}
            </p>
          ) : null}
        </div>
      ))}

      {projects.length ? (
        <>
          <Divider mutedTextColor={mutedTextColor} />
          <SectionTitle title="Projects" mutedTextColor={mutedTextColor} />
          {projects.map((project, index) => (
            <div key={`${project.name}-${index}`} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontWeight: 700, fontSize: "13.5px" }}>
                  {project.name}
                  {project.type ? <span style={{ fontWeight: 400, fontSize: "12px", color: mutedTextColor }}> - {project.type}</span> : null}
                </p>
                {project.year ? <p style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "11.5px", color: mutedTextColor }}><span className="inline-flex items-center gap-1"><FaCalendarDays size={11} /> {project.year}</span></p> : null}
              </div>
              {project.desc ? (
                <p style={{ fontFamily: "DM Sans, Arial, sans-serif", fontSize: "12.5px", color: "#3d3d3d", marginTop: "2px", lineHeight: 1.55 }}>
                  {project.desc}
                </p>
              ) : null}
            </div>
          ))}
        </>
      ) : null}

      <Divider mutedTextColor={mutedTextColor} />

      <SectionTitle title="Skills" mutedTextColor={mutedTextColor} />
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontFamily: "DM Sans, Arial, sans-serif", fontSize: "12.5px", lineHeight: 1.55 }}>
        <p>
          <span style={{ fontWeight: 700, color: primaryTextColor }}>Core</span>
          <span style={{ color: "#3d3d3d" }}> - {(skills.length ? skills.join(", ") : "Add skills")}</span>
        </p>
        {extraSections.slice(0, 3).map((section) => (
          <p key={section.id || section.title}>
            <span style={{ fontWeight: 700, color: primaryTextColor }}>{section.title || "Additional"}</span>
            <span style={{ color: "#3d3d3d" }}> - {section.items.filter((item) => String(item || "").trim()).join(", ")}</span>
          </p>
        ))}
      </div>
    </article>
  );
}

function SectionTitle({ title, mutedTextColor }) {
  return (
    <p
      style={{
        fontFamily: "DM Sans, Arial, sans-serif",
        fontSize: "9.5px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".18em",
        color: mutedTextColor,
        marginBottom: "10px"
      }}
    >
      {title}
    </p>
  );
}

function Divider({ mutedTextColor }) {
  return <hr style={{ border: "none", borderTop: `1px solid ${mutedTextColor}40`, margin: "0 0 20px" }} />;
}

