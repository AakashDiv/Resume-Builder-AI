import {
  getAdditionalSections,
  getSectionByTitle,
  hasHtmlMarkup,
  sanitizeRichHtml,
  splitBullets,
  splitByCommaOrLine
} from "../common/previewUtils.js";

function buildDateRange(start, end, isCurrent) {
  const s = String(start || "").trim();
  const e = isCurrent ? "Present" : String(end || "").trim();
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

function SecTitle({ children, accent }) {
  return (
    <div style={{ marginBottom: "8px", marginTop: "14px" }}>
      <p
        style={{
          fontSize: "8.5px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          color: accent,
          margin: "0 0 4px"
        }}
      >
        {children}
      </p>
      <div style={{ height: "1.5px", background: accent, opacity: 0.35 }} />
    </div>
  );
}

export default function SharpClassicPreview({
  data,
  accentColor = "#1a2742",
  headerBgColor = "#1a2742",
  primaryTextColor = "#111827",
  mutedTextColor = "#4b5563"
}) {
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const certSection = getSectionByTitle(data?.additional, "Certifications & Licenses");
  const langSection = getSectionByTitle(data?.additional, "Languages");
  const certs = splitByCommaOrLine(
    (certSection?.items || []).join("\n") || data?.additional?.certifications || ""
  );
  const langs = splitByCommaOrLine(
    (langSection?.items || []).join("\n") || data?.additional?.languages || ""
  );
  const extraSections = getAdditionalSections(data?.additional).filter((s) => {
    const t = String(s?.title || "").trim().toLowerCase();
    return (
      !["certifications & licenses", "languages"].includes(t) &&
      Array.isArray(s?.items) &&
      s.items.some((i) => String(i || "").trim())
    );
  });

  const contacts = [
    data?.header?.email,
    data?.header?.phone,
    data?.header?.location,
    data?.additional?.linkedin || null,
    data?.additional?.portfolio || null
  ].filter(Boolean);

  const experiences = (data?.experience || []).filter(
    (exp) => exp?.jobTitle || exp?.employer
  );
  const educations = (data?.education || []).filter(
    (edu) => edu?.degree || edu?.institution
  );

  const hasBody =
    String(data?.summary?.text || "").trim() ||
    experiences.length ||
    educations.length ||
    skills.length ||
    certs.length ||
    langs.length ||
    extraSections.length;

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        fontFamily: "'Calibri', 'Segoe UI', Arial, sans-serif",
        fontSize: "11px",
        color: primaryTextColor,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* ── Header band ───────────────────────────────── */}
      <div
        style={{
          background: headerBgColor,
          color: "#ffffff",
          padding: "24px 28px 18px",
          flexShrink: 0
        }}
      >
        <p
          style={{
            fontSize: "30px",
            fontWeight: 700,
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "-0.01em",
            wordBreak: "break-word"
          }}
        >
          {data?.header?.fullName || "Your Name"}
        </p>

        {String(data?.header?.headline || "").trim() ? (
          <p
            style={{
              fontSize: "12.5px",
              fontWeight: 400,
              margin: "5px 0 0",
              opacity: 0.82,
              letterSpacing: "0.01em"
            }}
          >
            {data.header.headline}
          </p>
        ) : null}

        {contacts.length ? (
          <div
            style={{
              marginTop: "12px",
              paddingTop: "10px",
              borderTop: "1px solid rgba(255,255,255,0.22)",
              display: "flex",
              flexWrap: "wrap",
              gap: "3px 18px",
              fontSize: "9.5px",
              opacity: 0.88,
              lineHeight: 1.7
            }}
          >
            {contacts.map((c, i) => (
              <span key={i} style={{ whiteSpace: "nowrap" }}>
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── Body ──────────────────────────────────────── */}
      <div style={{ padding: "4px 28px 28px", flex: 1 }}>

        {/* Summary */}
        {String(data?.summary?.text || "").trim() ? (
          <div>
            <SecTitle accent={accentColor}>Professional Summary</SecTitle>
            {hasHtmlMarkup(data.summary.text) ? (
              <div
                style={{ fontSize: "10.5px", lineHeight: 1.65, color: "#2d2d2d" }}
                className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }}
              />
            ) : (
              <p style={{ fontSize: "10.5px", lineHeight: 1.65, color: "#2d2d2d", margin: 0 }}>
                {data.summary.text}
              </p>
            )}
          </div>
        ) : null}

        {/* Experience */}
        {experiences.length ? (
          <div>
            <SecTitle accent={accentColor}>Experience</SecTitle>
            {experiences.map((exp, i) => {
              const bullets = splitBullets(exp.bullets || "");
              const date = buildDateRange(exp.startDate, exp.endDate, exp.currentlyWorking);
              const loc = [exp.city, exp.country].filter(Boolean).join(", ");
              return (
                <div
                  key={`exp-${i}`}
                  style={{
                    marginBottom: i < experiences.length - 1 ? "10px" : 0,
                    breakInside: "avoid",
                    pageBreakInside: "avoid"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px"
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "12px",
                          color: primaryTextColor,
                          margin: 0,
                          lineHeight: 1.25
                        }}
                      >
                        {exp.jobTitle || "Role"}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: mutedTextColor,
                          margin: "1px 0 0",
                          fontStyle: "italic",
                          lineHeight: 1.3
                        }}
                      >
                        {exp.employer || "Company"}
                        {loc ? ` · ${loc}` : ""}
                      </p>
                    </div>
                    {date ? (
                      <p
                        style={{
                          fontSize: "9.5px",
                          color: mutedTextColor,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          margin: "1px 0 0"
                        }}
                      >
                        {date}
                      </p>
                    ) : null}
                  </div>

                  {hasHtmlMarkup(exp.bullets) ? (
                    <div
                      style={{ marginTop: "4px", fontSize: "10.5px", lineHeight: 1.55, color: "#2d2d2d" }}
                      className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
                    />
                  ) : bullets.length ? (
                    <ul
                      style={{
                        margin: "4px 0 0 16px",
                        padding: 0,
                        listStyleType: "disc"
                      }}
                    >
                      {bullets.map((b, bi) => (
                        <li
                          key={bi}
                          style={{
                            fontSize: "10.5px",
                            lineHeight: 1.55,
                            color: "#2d2d2d",
                            marginBottom: "2px",
                            paddingLeft: "2px"
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

        {/* Education */}
        {educations.length ? (
          <div>
            <SecTitle accent={accentColor}>Education</SecTitle>
            {educations.map((edu, i) => {
              const date = buildDateRange(edu.startDate, edu.endDate, edu.currentlyStudying);
              const details = splitBullets(edu.details || "");
              return (
                <div
                  key={`edu-${i}`}
                  style={{
                    marginBottom: i < educations.length - 1 ? "9px" : 0,
                    breakInside: "avoid",
                    pageBreakInside: "avoid"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px"
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "12px",
                          color: primaryTextColor,
                          margin: 0,
                          lineHeight: 1.25
                        }}
                      >
                        {edu.degree || "Degree"}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: mutedTextColor,
                          margin: "1px 0 0",
                          fontStyle: "italic",
                          lineHeight: 1.3
                        }}
                      >
                        {edu.institution || "Institution"}
                        {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                        {edu.city ? ` · ${edu.city}` : ""}
                      </p>
                    </div>
                    {date ? (
                      <p
                        style={{
                          fontSize: "9.5px",
                          color: mutedTextColor,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          margin: "1px 0 0"
                        }}
                      >
                        {date}
                      </p>
                    ) : null}
                  </div>

                  {hasHtmlMarkup(edu.details) ? (
                    <div
                      style={{ marginTop: "3px", fontSize: "10.5px", lineHeight: 1.5, color: "#2d2d2d" }}
                      className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_li]:mb-0.5"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(edu.details) }}
                    />
                  ) : details.length ? (
                    <ul style={{ margin: "3px 0 0 16px", padding: 0, listStyleType: "disc" }}>
                      {details.map((d, di) => (
                        <li
                          key={di}
                          style={{
                            fontSize: "10.5px",
                            lineHeight: 1.5,
                            color: "#2d2d2d",
                            marginBottom: "1px"
                          }}
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Skills */}
        {skills.length ? (
          <div>
            <SecTitle accent={accentColor}>Skills</SecTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 7px" }}>
              {skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "10px",
                    padding: "2px 9px",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "3px",
                    color: "#2d2d2d",
                    whiteSpace: "nowrap"
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Certifications & Languages */}
        {certs.length || langs.length ? (
          <div>
            <SecTitle accent={accentColor}>Certifications &amp; Languages</SecTitle>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                fontSize: "10.5px",
                color: "#2d2d2d"
              }}
            >
              {certs.length ? (
                <p style={{ margin: 0 }}>
                  <strong>Certifications:</strong> {certs.join(", ")}
                </p>
              ) : null}
              {langs.length ? (
                <p style={{ margin: 0 }}>
                  <strong>Languages:</strong> {langs.join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Extra custom sections */}
        {extraSections.map((section) => (
          <div key={section.id || section.title}>
            <SecTitle accent={accentColor}>{section.title || "Additional"}</SecTitle>
            <ul style={{ margin: 0, padding: "0 0 0 16px", listStyleType: "disc" }}>
              {section.items
                .filter((item) => String(item || "").trim())
                .slice(0, 6)
                .map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "10.5px",
                      lineHeight: 1.55,
                      color: "#2d2d2d",
                      marginBottom: "2px"
                    }}
                  >
                    {item}
                  </li>
                ))}
            </ul>
          </div>
        ))}

        {/* Empty-state hint — only visible when no body content at all */}
        {!hasBody ? (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              border: "1.5px dashed #e2e8f0",
              borderRadius: "6px",
              color: "#94a3b8",
              fontSize: "11px",
              lineHeight: 1.7,
              textAlign: "center"
            }}
          >
            <p style={{ fontWeight: 600, margin: "0 0 6px", color: "#64748b" }}>
              Start filling in your details
            </p>
            <p style={{ margin: 0 }}>
              Use the form on the left to add your experience, education,
              skills, and summary. Your resume will update live here.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
