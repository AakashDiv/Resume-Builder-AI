import {
  formatDateRange,
  getInitials,
  getMeaningfulEducation,
  getMeaningfulExperience,
  hasHtmlMarkup,
  hasText,
  sanitizeRichHtml,
  splitBullets,
  splitByCommaOrLine
} from "../common/previewUtils.js";
import { FaEnvelope, FaLocationDot, FaPhone } from "react-icons/fa6";

function SidebarSection({ title, children }) {
  return (
    <div style={{ marginTop: "14px" }}>
      <p style={{ fontSize: "8.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "3px" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function MainBlock({ title, children }) {
  return (
    <section style={{ marginTop: "12px" }}>
      <h3 style={{ fontSize: "8.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#5a4a3f", borderBottom: "1.5px solid #d47f13", paddingBottom: "3px", marginBottom: "7px" }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function CreativePreview({ data }) {
  const skills = splitByCommaOrLine(data.skills?.primarySkills || "");
  const experience = getMeaningfulExperience(data.experience);
  const education = getMeaningfulEducation(data.education);
  const initials = getInitials(data.header?.fullName);

  return (
    <article data-resume-padding="true" className="h-full w-full overflow-hidden bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "34% 66%", height: "100%" }}>

        {/* Sidebar */}
        <aside
          style={{
            background: "linear-gradient(180deg, #5a4a3f 0%, #5a4a3f 17%, #d47f13 17%, #d47f13 100%)",
            color: "#ffffff",
            padding: "16px 14px 20px",
            fontSize: "10px",
            lineHeight: 1.55
          }}
        >
          {/* Photo / initials */}
          <div style={{ width: "88px", height: "104px", margin: "0 auto 14px", overflow: "hidden", borderRadius: "2px", border: "3px solid rgba(255,255,255,0.7)", background: "#c4b5a8", display: "grid", placeItems: "center", fontSize: "20px", fontWeight: 700, letterSpacing: "0.05em", color: "#5a4a3f" }}>
            {data.header?.photo ? (
              <img src={data.header.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : initials}
          </div>

          {/* Contact */}
          {(hasText(data.header?.location) || hasText(data.header?.phone) || hasText(data.header?.email)) ? (
            <SidebarSection title="Contact">
              {hasText(data.header?.location) ? (
                <p style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "3px", width: "100%", wordBreak: "break-all" }}>
                  <FaLocationDot size={9} /> {data.header.location}
                </p>
              ) : null}
              {hasText(data.header?.phone) ? (
                <p style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "3px", width: "100%" }}>
                  <FaPhone size={9} /> {data.header.phone}
                </p>
              ) : null}
              {hasText(data.header?.email) ? (
                <p style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "3px", width: "100%", wordBreak: "break-all" }}>
                  <FaEnvelope size={9} /> {data.header.email}
                </p>
              ) : null}
            </SidebarSection>
          ) : null}

          {/* Skills */}
          {skills.length ? (
            <SidebarSection title="Skills">
              <ul style={{ listStyle: "disc", paddingLeft: "14px", margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                {skills.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </SidebarSection>
          ) : null}

          {/* Education in sidebar */}
          {education.length ? (
            <SidebarSection title="Education">
              {education.map((edu, i) => {
                const dateRange = formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying);
                return (
                  <div key={i} style={{ marginBottom: i < education.length - 1 ? "8px" : "0" }}>
                    {hasText(edu.degree) ? <p style={{ fontWeight: 700, fontSize: "10px" }}>{edu.degree}</p> : null}
                    {hasText(edu.institution) ? <p>{edu.institution}</p> : null}
                    {hasText(edu.fieldOfStudy) ? <p style={{ fontStyle: "italic" }}>{edu.fieldOfStudy}</p> : null}
                    {dateRange ? <p style={{ opacity: 0.8 }}>{dateRange}</p> : null}
                  </div>
                );
              })}
            </SidebarSection>
          ) : null}
        </aside>

        {/* Main */}
        <section style={{ padding: "16px 16px 16px 14px", fontSize: "11px", lineHeight: 1.5, color: "#1a1a1a" }}>
          <h1 style={{ fontSize: "30px", fontWeight: 800, lineHeight: 1.1, color: "#d47f13", margin: "0 0 3px", wordBreak: "break-word" }}>
            {data.header?.fullName || "Your Name"}
          </h1>
          {hasText(data.header?.headline) ? (
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#5a4a3f", marginBottom: "6px" }}>
              {data.header.headline}
            </p>
          ) : null}

          {/* Summary */}
          {hasText(data.summary?.text) ? (
            <MainBlock title="Career Objective">
              {hasHtmlMarkup(data.summary.text) ? (
                <div
                  className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                  style={{ fontSize: "11px", lineHeight: 1.6, color: "#2d2d2d" }}
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }}
                />
              ) : (
                <p style={{ fontSize: "11px", lineHeight: 1.6, color: "#2d2d2d" }}>{data.summary.text}</p>
              )}
            </MainBlock>
          ) : null}

          {/* Experience */}
          {experience.length ? (
            <MainBlock title="Professional Experience">
              {experience.map((exp, i) => {
                const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking);
                const location = [exp.city, exp.country].filter(hasText).join(", ");
                const bullets = splitBullets(exp.bullets);
                return (
                  <div key={i} style={{ marginBottom: i < experience.length - 1 ? "10px" : "0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        {hasText(exp.jobTitle) ? <p style={{ fontWeight: 700, fontSize: "11.5px", margin: 0 }}>{exp.jobTitle}</p> : null}
                        {hasText(exp.employer) ? <p style={{ color: "#5a4a3f", fontSize: "10.5px", margin: "1px 0 0" }}>{exp.employer}</p> : null}
                        {location ? <p style={{ fontSize: "10px", color: "#888", margin: "1px 0 0", fontStyle: "italic" }}>{location}</p> : null}
                      </div>
                      {dateRange ? (
                        <p style={{ fontSize: "10px", color: "#666", whiteSpace: "nowrap", flexShrink: 0, paddingTop: "2px" }}>{dateRange}</p>
                      ) : null}
                    </div>
                    {hasHtmlMarkup(exp.bullets) ? (
                      <div
                        className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                        style={{ marginTop: "4px", fontSize: "11px", lineHeight: 1.55, color: "#2d2d2d" }}
                        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
                      />
                    ) : bullets.length ? (
                      <ul style={{ listStyle: "disc", paddingLeft: "16px", margin: "4px 0 0", display: "flex", flexDirection: "column", gap: "2px" }}>
                        {bullets.map((bullet, idx) => (
                          <li key={idx} style={{ fontSize: "11px", lineHeight: 1.5, color: "#2d2d2d" }}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </MainBlock>
          ) : null}
        </section>
      </div>
    </article>
  );
}
