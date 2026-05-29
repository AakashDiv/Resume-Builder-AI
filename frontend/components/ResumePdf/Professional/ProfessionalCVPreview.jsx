import {
  getAdditionalSections,
  getSectionByTitle,
  hasHtmlMarkup,
  hasText,
  sanitizeRichHtml,
  splitBullets,
  splitByCommaOrLine
} from "../common/previewUtils.js";

function buildDate(start, end, isCurrent) {
  const s = String(start || "").trim();
  const e = isCurrent ? "Present" : String(end || "").trim();
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

function SidebarLabel({ children }) {
  return (
    <div style={{ width: "100%", textAlign: "center", margin: "30px 0 16px" }}>
      <span
        style={{
          display: "inline-block",
          minWidth: "52mm",
          background: "#ffffff",
          borderRadius: "999px",
          padding: "8px 18px",
          color: "#333132",
          fontSize: "15px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap"
        }}
      >
        {children}
      </span>
    </div>
  );
}

function RightHeading({ children }) {
  return (
    <div style={{ marginTop: "28px", marginBottom: "18px" }}>
      <p
        style={{
          fontSize: "18px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#333132",
          margin: 0,
          lineHeight: 1.1
        }}
      >
        {children}
      </p>
    </div>
  );
}

function ContactRow({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", width: "100%" }}>
      <span
        style={{
          fontSize: "14px",
          color: "#ffffff",
          flexShrink: 0,
          minWidth: "18px",
          textAlign: "center",
          lineHeight: 1.35
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: "12.5px",
          lineHeight: 1.3,
          color: "#ffffff",
          wordBreak: "break-word",
          flex: 1
        }}
      >
        {text}
      </span>
    </div>
  );
}

export default function ProfessionalCVPreview({
  data,
  sidebarBgColor = "#2d2d2d",
  mainBgColor = "#ffffff",
  primaryTextColor = "#111827",
  mutedTextColor = "#555555"
}) {
  const fullName = String(data?.header?.fullName || "Your Name").trim();
  const headline = String(data?.header?.headline || "").trim();
  const photo = data?.header?.photo || "";
  const phone = String(data?.header?.phone || "").trim();
  const email = String(data?.header?.email || "").trim();
  const location = String(data?.header?.location || "").trim();
  const linkedin = String(data?.additional?.linkedin || "").trim();
  const portfolio = String(data?.additional?.portfolio || "").trim();
  const summaryText = String(data?.summary?.text || "").trim();

  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const experiences = (data?.experience || []).filter((e) => e?.jobTitle || e?.employer);
  const educations = (data?.education || []).filter((e) => e?.degree || e?.institution);

  const certSection = getSectionByTitle(data?.additional, "Certifications & Licenses");
  const langSection = getSectionByTitle(data?.additional, "Languages");
  const certs = (certSection?.items || []).filter(hasText);
  const langs = (langSection?.items || []).filter(hasText);

  const projectsSection = getSectionByTitle(data?.additional, "Projects");
  const projectItems = (projectsSection?.items || []).filter(hasText);

  const referencesSection = getSectionByTitle(data?.additional, "References");
  const referenceItems = (referencesSection?.items || [])
    .filter(hasText)
    .map((item) => {
      const [name = "", role = "", refPhone = "", refEmail = ""] = String(item).split("|").map((p) => p.trim());
      return { name, role, phone: refPhone, email: refEmail };
    })
    .filter((r) => r.name);

  const SIDEBAR_SKIP = new Set(["certifications & licenses", "languages"]);
  const RIGHT_SKIP = new Set(["projects", "references"]);
  const otherRightSections = getAdditionalSections(data?.additional).filter((s) => {
    const t = String(s?.title || "").trim().toLowerCase();
    return (
      !SIDEBAR_SKIP.has(t) &&
      !RIGHT_SKIP.has(t) &&
      Array.isArray(s?.items) &&
      s.items.some(hasText)
    );
  });

  // Split name: everything except last word is "first" (light), last word is "last" (bold)
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  const hasRightContent = summaryText || experiences.length || projectItems.length || referenceItems.length || otherRightSections.length;

  return (
    <div
      data-resume-page="true"
      style={{
        width: "210mm",
        minHeight: "297mm",
        display: "flex",
        flexDirection: "row",
        fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
        fontSize: "12px",
        lineHeight: 1.4,
        background: mainBgColor,
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      {/* ── Left Sidebar ── */}
      <div
        style={{
          width: "38.25%",
          minHeight: "297mm",
          background: sidebarBgColor,
          color: "#ffffff",
          padding: "18.5mm 15.5mm 16mm",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0
        }}
      >
        {/* Profile Photo */}
        <div style={{ marginBottom: "13mm" }}>
          {photo ? (
            <div
              style={{
                width: "45mm",
                height: "45mm",
                borderRadius: "50%",
                overflow: "hidden",
                border: "0 solid transparent",
                background: "#f4f4f4"
              }}
            >
              <img
                src={photo}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "45mm",
                height: "45mm",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.11)",
                border: "0 solid transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "42px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)"
              }}
            >
              {(fullName.charAt(0) || "?").toUpperCase()}
            </div>
          )}
        </div>

        {/* Contact Me */}
        <SidebarLabel>Contact Me</SidebarLabel>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "11px",
            paddingBottom: "2px"
          }}
        >
          {phone ? <ContactRow icon="☎" text={phone} /> : null}
          {email ? <ContactRow icon="✉" text={email} /> : null}
          {portfolio ? <ContactRow icon="⊕" text={portfolio} /> : null}
          {linkedin ? <ContactRow icon="in" text={linkedin} /> : null}
          {location ? <ContactRow icon="⦿" text={location} /> : null}
        </div>

        {/* Education */}
        {educations.length > 0 ? (
          <>
            <SidebarLabel>Education</SidebarLabel>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
              {educations.map((edu, i) => {
                const dateRange = buildDate(edu.startDate, edu.endDate, edu.currentlyStudying);
                return (
                  <div key={`edu-${i}`}>
                    {edu.institution ? (
                      <p
                        style={{
                          margin: 0,
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "#ffffff",
                        lineHeight: 1.22
                        }}
                      >
                        {edu.institution}
                      </p>
                    ) : null}
                    {edu.degree ? (
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "12.5px",
                          color: "#ffffff",
                          lineHeight: 1.25
                        }}
                      >
                        {edu.degree}
                        {edu.fieldOfStudy ? ` – ${edu.fieldOfStudy}` : ""}
                      </p>
                    ) : null}
                    {dateRange ? (
                      <p
                        style={{
                          margin: "1px 0 0",
                          fontSize: "12px",
                          color: "#ffffff",
                          lineHeight: 1.25
                        }}
                      >
                        {dateRange}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {/* Skills */}
        {skills.length > 0 ? (
          <>
            <SidebarLabel>Skills</SidebarLabel>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 20px",
                listStyleType: "disc",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              {skills.map((skill, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.2,
                    color: "#ffffff"
                  }}
                >
                  {skill}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {/* Certifications */}
        {certs.length > 0 ? (
          <>
            <SidebarLabel>Certifications</SidebarLabel>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 20px",
                listStyleType: "disc",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              {certs.map((cert, i) => (
                <li
                  key={i}
                  style={{ fontSize: "12px", lineHeight: 1.35, color: "#ffffff" }}
                >
                  {cert}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {/* Languages */}
        {langs.length > 0 ? (
          <>
            <SidebarLabel>Languages</SidebarLabel>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 20px",
                listStyleType: "disc",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              {langs.map((lang, i) => (
                <li
                  key={i}
                  style={{ fontSize: "12.5px", lineHeight: 1.35, color: "#ffffff" }}
                >
                  {lang}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {/* ── Right Content Panel ── */}
      <div
        style={{
          width: "61.75%",
          minHeight: "297mm",
          background: mainBgColor,
          padding: "27mm 9mm 15mm 8.5mm",
          boxSizing: "border-box",
          color: primaryTextColor
        }}
      >
        {/* Name */}
        <div style={{ marginBottom: "27mm" }}>
          <p
            style={{
              fontSize: "36px",
              fontWeight: 400,
              color: primaryTextColor,
              margin: 0,
              lineHeight: 1.0,
              letterSpacing: "0.02em",
              textTransform: "uppercase"
            }}
          >
            {firstName}
          </p>
          {lastName ? (
            <p
              style={{
                fontSize: "48px",
                fontWeight: 900,
                color: primaryTextColor,
                margin: 0,
                lineHeight: 1.0,
                letterSpacing: "0.01em",
                textTransform: "uppercase"
              }}
            >
              {lastName}
            </p>
          ) : null}
          {headline ? (
            <p
              style={{
                fontSize: "27px",
                fontWeight: 400,
                color: primaryTextColor,
                margin: "4px 0 0",
                letterSpacing: "0.01em"
              }}
            >
              {headline}
            </p>
          ) : null}
        </div>

        {/* About Me */}
        {summaryText ? (
          <div>
            <RightHeading>About Me</RightHeading>
            {hasHtmlMarkup(summaryText) ? (
              <div
                style={{ fontSize: "13.5px", lineHeight: 1.55, color: mutedTextColor }}
                className="[&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-0.5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(summaryText) }}
              />
            ) : (
              <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: mutedTextColor, margin: 0 }}>
                {summaryText}
              </p>
            )}
          </div>
        ) : null}

        {/* Work Experience */}
        {experiences.length > 0 ? (
          <div>
            <RightHeading>Work Experience</RightHeading>
            {experiences.map((exp, i) => {
              const bullets = splitBullets(exp.bullets || "");
              const date = buildDate(exp.startDate, exp.endDate, exp.currentlyWorking);
              return (
                <div
                  key={`exp-${i}`}
                  style={{ marginBottom: i < experiences.length - 1 ? "29px" : 0 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px"
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: "16px",
                        color: primaryTextColor,
                        margin: 0,
                        lineHeight: 1.2
                      }}
                    >
                      {exp.employer || "Company"}
                    </p>
                    {date ? (
                      <p
                        style={{
                          fontSize: "13px",
                          color: mutedTextColor,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          margin: 0,
                          fontWeight: 800,
                          letterSpacing: "0.08em"
                        }}
                      >
                        {date}
                      </p>
                    ) : null}
                  </div>
                  {exp.jobTitle ? (
                    <p
                      style={{
                        fontSize: "13px",
                        color: mutedTextColor,
                        margin: "4px 0 6px",
                        lineHeight: 1.3
                      }}
                    >
                      {exp.jobTitle}
                      {exp.city ? ` · ${exp.city}` : ""}
                    </p>
                  ) : null}
                  {hasHtmlMarkup(exp.bullets) ? (
                    <div
                      style={{ fontSize: "12.5px", lineHeight: 1.55, color: primaryTextColor }}
                      className="[&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-0.5"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
                    />
                  ) : bullets.length ? (
                    <ul style={{ margin: "6px 0 0 16px", padding: 0, listStyleType: "disc" }}>
                      {bullets.map((b, bi) => (
                        <li
                          key={bi}
                          style={{
                            fontSize: "12.5px",
                            lineHeight: 1.52,
                            color: primaryTextColor,
                            marginBottom: "2px"
                          }}
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Projects */}
        {projectItems.length > 0 ? (
          <div>
            <RightHeading>Projects</RightHeading>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 16px",
                listStyleType: "disc",
                display: "flex",
                flexDirection: "column",
                gap: "7px"
              }}
            >
              {projectItems.map((item, i) => (
                <li key={i} style={{ fontSize: "12.5px", lineHeight: 1.55, color: primaryTextColor }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Other additional sections */}
        {otherRightSections.map((section) => (
          <div key={section.id || section.title}>
            <RightHeading>{section.title}</RightHeading>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 16px",
                listStyleType: "disc",
                display: "flex",
                flexDirection: "column",
                gap: "7px"
              }}
            >
              {section.items.filter(hasText).map((item, idx) => (
                <li key={idx} style={{ fontSize: "12.5px", lineHeight: 1.55, color: primaryTextColor }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* References */}
        {referenceItems.length > 0 ? (
          <div>
            <RightHeading>References</RightHeading>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 48px" }}>
              {referenceItems.map((ref, i) => (
                <div key={i} style={{ minWidth: "165px", flex: "1 1 165px" }}>
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: "16px",
                      color: primaryTextColor,
                      margin: "0 0 1px"
                    }}
                  >
                    {ref.name}
                  </p>
                  {ref.role ? (
                    <p
                      style={{
                        fontSize: "13px",
                        color: mutedTextColor,
                        margin: "0 0 4px"
                      }}
                    >
                      {ref.role}
                    </p>
                  ) : null}
                  {ref.phone ? (
                    <p style={{ fontSize: "11px", color: primaryTextColor, margin: "0 0 3px" }}>
                      <strong>Phone: </strong>
                      {ref.phone}
                    </p>
                  ) : null}
                  {ref.email ? (
                    <p style={{ fontSize: "11px", color: primaryTextColor, margin: 0 }}>
                      <strong>Email: </strong>
                      {ref.email}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Empty state */}
        {!hasRightContent ? (
          <div
            style={{
              marginTop: "24px",
              padding: "18px",
              border: "1.5px dashed #e2e8f0",
              borderRadius: "6px",
              color: "#94a3b8",
              fontSize: "10px",
              textAlign: "center",
              lineHeight: 1.6
            }}
          >
            <p style={{ fontWeight: 600, margin: "0 0 5px", color: "#64748b" }}>
              Start filling in your details
            </p>
            <p style={{ margin: 0 }}>
              Use the form to add your experience, skills, and summary.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
