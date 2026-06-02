import {
  extractPlainText,
  formatDateRange,
  getAdditionalSections,
  getMeaningfulEducation,
  getMeaningfulExperience,
  getSectionByTitle,
  hasHtmlMarkup,
  hasText,
  sanitizeRichHtml,
  splitBullets,
  splitByCommaOrLine
} from "../common/previewUtils.js";

const INK = "#323846";
const MUTED = "#747474";
const SIDEBAR = "#323b4c";
const RULE = "#323b4c";
const WHITE = "#ffffff";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function buildDate(startDate, endDate, isCurrent) {
  return formatDateRange(startDate, endDate, isCurrent);
}

function splitProject(item) {
  const parts = String(item || "").split("|").map((part) => part.trim());
  if (parts.length < 2) return { name: clean(item), meta: "", description: "" };
  const [name = "", type = "", year = "", description = ""] = parts;
  return {
    name,
    meta: [type, year].filter(Boolean).join(" / "),
    description
  };
}

function parseReferences(additional) {
  const section = getSectionByTitle(additional, "References");
  return (section?.items || [])
    .filter(hasText)
    .map((item) => {
      const [name = "", role = "", phone = "", email = ""] = String(item).split("|").map((part) => part.trim());
      return { name, role, phone, email };
    })
    .filter((item) => item.name || item.role || item.phone || item.email);
}

function SectionTitle({ children, inverse = false }) {
  return (
    <div style={{ margin: "0 0 14px" }}>
      <h2
        style={{
          margin: 0,
          color: inverse ? WHITE : INK,
          fontFamily: "'Sora', 'Arial', sans-serif",
          fontSize: "23px",
          fontWeight: 800,
          lineHeight: 1.1
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: "1px",
          background: inverse ? WHITE : RULE,
          marginTop: "11px",
          width: inverse ? "calc(100% + 36px)" : "100%"
        }}
      />
    </div>
  );
}

function SidebarBlock({ title, children }) {
  if (!children) return null;
  return (
    <section style={{ marginTop: "27px", breakInside: "avoid" }}>
      <SectionTitle inverse>{title}</SectionTitle>
      {children}
    </section>
  );
}

function ContactItem({ label, value }) {
  if (!hasText(value)) return null;
  return (
    <div style={{ marginBottom: "21px" }}>
      <p
        style={{
          margin: "0 0 3px",
          color: WHITE,
          fontFamily: "'Sora', 'Arial', sans-serif",
          fontSize: "14px",
          fontWeight: 800,
          lineHeight: 1.15
        }}
      >
        {label}
      </p>
      <p style={{ margin: 0, color: WHITE, fontSize: "11.5px", lineHeight: 1.35, wordBreak: "break-word" }}>
        {value}
      </p>
    </div>
  );
}

function SidebarList({ items, bold = false }) {
  const filtered = items.filter(hasText);
  if (!filtered.length) return null;
  return (
    <ul
      style={{
        margin: 0,
        padding: "0 0 0 16px",
        color: WHITE,
        display: "flex",
        flexDirection: "column",
        gap: "13px"
      }}
    >
      {filtered.map((item, index) => (
        <li key={`${item}-${index}`} style={{ paddingLeft: "8px", fontSize: "13px", lineHeight: 1.3 }}>
          <span style={{ fontWeight: bold ? 800 : 400 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RichText({ value, color = MUTED, size = "11px", lineHeight = 1.55 }) {
  if (!hasText(value)) return null;
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color, fontSize: size, lineHeight }}
        className="[&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1 [&_p]:mb-1"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  return <p style={{ margin: 0, color, fontSize: size, lineHeight }}>{clean(value)}</p>;
}

function TimelineExperience({ experiences }) {
  if (!experiences.length) return null;
  return (
    <div style={{ position: "relative", marginTop: "1px", paddingLeft: "24px" }}>
      <div
        style={{
          position: "absolute",
          left: "5px",
          top: "6px",
          bottom: "8px",
          width: "1px",
          background: RULE
        }}
      />
      {experiences.map((exp, index) => {
        const date = buildDate(exp.startDate, exp.endDate, exp.currentlyWorking);
        const place = [exp.employer, exp.city, exp.country].filter(hasText).join(" | ");
        const bullets = splitBullets(exp.bullets || "");
        return (
          <article
            key={`bw-exp-${index}`}
            style={{
              position: "relative",
              marginBottom: index < experiences.length - 1 ? "33px" : 0,
              breakInside: "avoid"
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "-24px",
                top: "2px",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: `2px solid ${RULE}`,
                background: WHITE
              }}
            />
            {date ? (
              <p
                style={{
                  margin: "0 0 3px",
                  color: MUTED,
                  fontFamily: "'Sora', 'Arial', sans-serif",
                  fontSize: "14px",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "0.09em"
                }}
              >
                {date}
              </p>
            ) : null}
            {place ? (
              <p
                style={{
                  margin: "0 0 3px",
                  color: MUTED,
                  fontFamily: "'Sora', 'Arial', sans-serif",
                  fontSize: "13.5px",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  letterSpacing: "0.08em"
                }}
              >
                {place}
              </p>
            ) : null}
            {hasText(exp.jobTitle) ? (
              <p
                style={{
                  margin: "0 0 13px",
                  color: "#333333",
                  fontFamily: "'Sora', 'Arial', sans-serif",
                  fontSize: "13.5px",
                  fontWeight: 800,
                  lineHeight: 1.15
                }}
              >
                {clean(exp.jobTitle)}
              </p>
            ) : null}
            {hasHtmlMarkup(exp.bullets) ? (
              <RichText value={exp.bullets} />
            ) : bullets.length ? (
              <p style={{ margin: 0, color: MUTED, fontSize: "10.8px", lineHeight: 1.55 }}>
                {bullets.join(" ")}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function RightSection({ title, children }) {
  if (!children) return null;
  return (
    <section style={{ marginTop: title === "Experience" ? "0" : "22px", breakInside: "avoid" }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
  );
}

export default function BlackWhiteMinimalistPreview({ data }) {
  const fullName = clean(data?.header?.fullName) || "Your Name";
  const headline = clean(data?.header?.headline);
  const summary = data?.summary?.text || "";
  const photo = data?.header?.photo || "";
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const location = clean(data?.header?.location);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const experiences = getMeaningfulExperience(data?.experience);
  const educations = getMeaningfulEducation(data?.education);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(splitProject);
  const certs = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || [])
    .filter(hasText);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || [])
    .filter(hasText);
  const references = parseReferences(data?.additional);

  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });

  return (
    <div
      data-resume-page="true"
      style={{
        width: "210mm",
        minHeight: "297mm",
        display: "grid",
        gridTemplateColumns: "72.9mm 1fr",
        background: WHITE,
        color: INK,
        fontFamily: "'Manrope', 'Arial', sans-serif",
        fontSize: "11px",
        lineHeight: 1.4,
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      <aside
        style={{
          minHeight: "297mm",
          background: SIDEBAR,
          color: WHITE,
          padding: "13.5mm 0 16mm 12.8mm",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            width: "44.2mm",
            height: "44.2mm",
            margin: "0 0 16mm 6.4mm",
            borderRadius: "50%",
            overflow: "hidden",
            background: "rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.72)",
            fontFamily: "'Sora', 'Arial', sans-serif",
            fontSize: "36px",
            fontWeight: 800
          }}
        >
          {photo ? (
            <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            fullName.charAt(0).toUpperCase()
          )}
        </div>

        <SidebarBlock title="Contact">
          <div style={{ paddingRight: "12mm" }}>
            <ContactItem label="Phone" value={phone} />
            <ContactItem label="Email" value={email} />
            <ContactItem label="Address" value={location} />
            <ContactItem label="LinkedIn" value={linkedin} />
            <ContactItem label="Portfolio" value={portfolio} />
          </div>
        </SidebarBlock>

        {educations.length ? (
          <SidebarBlock title="Education">
            <div style={{ paddingRight: "12mm", display: "flex", flexDirection: "column", gap: "14px" }}>
              {educations.map((edu, index) => {
                const date = buildDate(edu.startDate, edu.endDate, edu.currentlyStudying);
                const degree = [edu.degree, edu.fieldOfStudy].filter(hasText).join(" in ");
                return (
                  <article key={`bw-edu-${index}`} style={{ breakInside: "avoid" }}>
                    {date ? <p style={{ margin: "0 0 3px", color: WHITE, fontSize: "13px", lineHeight: 1.2 }}>{date}</p> : null}
                    {degree ? (
                      <p
                        style={{
                          margin: "0 0 8px",
                          color: WHITE,
                          fontFamily: "'Sora', 'Arial', sans-serif",
                          fontSize: "12.5px",
                          fontWeight: 800,
                          lineHeight: 1.05
                        }}
                      >
                        {degree}
                      </p>
                    ) : null}
                    {hasText(edu.institution) ? (
                      <p style={{ margin: 0, color: WHITE, fontSize: "12.5px", lineHeight: 1.25 }}>
                        {clean(edu.institution)}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </SidebarBlock>
        ) : null}

        {skills.length ? (
          <SidebarBlock title="Expertise">
            <div style={{ paddingRight: "12mm" }}>
              <SidebarList items={skills} />
            </div>
          </SidebarBlock>
        ) : null}

        {certs.length ? (
          <SidebarBlock title="Certification">
            <div style={{ paddingRight: "12mm" }}>
              <SidebarList items={certs} />
            </div>
          </SidebarBlock>
        ) : null}

        {languages.length ? (
          <SidebarBlock title="Language">
            <div style={{ paddingRight: "12mm" }}>
              <SidebarList items={languages} bold />
            </div>
          </SidebarBlock>
        ) : null}
      </aside>

      <main
        style={{
          padding: "18.8mm 7.2mm 14mm 10.8mm",
          boxSizing: "border-box",
          background: WHITE,
          minWidth: 0
        }}
      >
        <header style={{ marginBottom: "8.5mm" }}>
          <h1
            style={{
              margin: 0,
              color: INK,
              fontFamily: "'Sora', 'Arial', sans-serif",
              fontSize: "34px",
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: "0.1em",
              wordBreak: "break-word"
            }}
          >
            {fullName}
          </h1>
          {headline ? (
            <p
              style={{
                margin: "7px 0 0",
                color: INK,
                fontFamily: "'Sora', 'Arial', sans-serif",
                fontSize: "19px",
                fontWeight: 400,
                lineHeight: 1.18,
                letterSpacing: "0.34em",
                wordBreak: "break-word"
              }}
            >
              {headline}
            </p>
          ) : null}
          {hasText(summary) ? (
            <div style={{ marginTop: "12px", maxWidth: "123mm" }}>
              <RichText value={summary} size="10.5px" lineHeight={1.45} />
            </div>
          ) : null}
        </header>

        {experiences.length ? (
          <RightSection title="Experience">
            <TimelineExperience experiences={experiences} />
          </RightSection>
        ) : null}

        {projects.length ? (
          <RightSection title="Projects">
            <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              {projects.map((project, index) => (
                <article key={`bw-project-${index}`} style={{ breakInside: "avoid" }}>
                  <p
                    style={{
                      margin: "0 0 2px",
                      color: "#333333",
                      fontFamily: "'Sora', 'Arial', sans-serif",
                      fontSize: "13px",
                      fontWeight: 800,
                      lineHeight: 1.2
                    }}
                  >
                    {project.name}
                  </p>
                  {project.meta ? (
                    <p style={{ margin: "0 0 5px", color: MUTED, fontSize: "11px", lineHeight: 1.25 }}>
                      {project.meta}
                    </p>
                  ) : null}
                  <RichText value={project.description} />
                </article>
              ))}
            </div>
          </RightSection>
        ) : null}

        {customSections.map((section) => (
          <RightSection key={section.id || section.title} title={section.title}>
            <ul style={{ margin: 0, padding: "0 0 0 16px", color: MUTED }}>
              {section.items.filter(hasText).map((item, index) => (
                <li key={`${item}-${index}`} style={{ marginBottom: "5px", fontSize: "11px", lineHeight: 1.45 }}>
                  {clean(item)}
                </li>
              ))}
            </ul>
          </RightSection>
        ))}

        {references.length ? (
          <RightSection title="Reference">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px" }}>
              {references.map((ref, index) => (
                <article key={`bw-ref-${index}`} style={{ minWidth: 0, breakInside: "avoid" }}>
                  {ref.name ? (
                    <p
                      style={{
                        margin: "0 0 4px",
                        color: INK,
                        fontFamily: "'Sora', 'Arial', sans-serif",
                        fontSize: "15px",
                        fontWeight: 800,
                        lineHeight: 1.15
                      }}
                    >
                      {ref.name}
                    </p>
                  ) : null}
                  {ref.role ? <p style={{ margin: "0 0 10px", color: INK, fontSize: "12px", lineHeight: 1.2 }}>{ref.role}</p> : null}
                  {ref.phone ? <p style={{ margin: "0 0 6px", color: INK, fontSize: "10px" }}><strong>Phone:</strong> {ref.phone}</p> : null}
                  {ref.email ? <p style={{ margin: 0, color: INK, fontSize: "10px" }}><strong>Email:</strong> {ref.email}</p> : null}
                </article>
              ))}
            </div>
          </RightSection>
        ) : null}
      </main>
    </div>
  );
}
