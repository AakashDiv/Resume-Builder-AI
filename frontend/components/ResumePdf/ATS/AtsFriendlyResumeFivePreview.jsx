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

const INK = "#111111";
const RULE = "#4f4f4f";
const FONT = "Georgia, 'Times New Roman', Times, serif";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dates(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current).replace(" - ", " - ");
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <section style={{ breakInside: "avoid", marginTop: "6px" }}>
      <h2
        style={{
          margin: 0,
          color: INK,
          fontFamily: FONT,
          fontSize: "17px",
          fontWeight: 800,
          lineHeight: 1.04
        }}
      >
        {title}
      </h2>
      <div style={{ height: "1px", background: RULE, margin: "2px 0 5px" }} />
      {children}
    </section>
  );
}

function BulletList({ value, items }) {
  const bullets = items || splitBullets(value || "");
  const filtered = bullets.filter(hasText).map(clean);
  if (!filtered.length) return null;
  return (
    <ul style={{ margin: "1px 0 0", padding: "0 0 0 21px", color: INK }}>
      {filtered.map((bullet, index) => (
        <li key={`${bullet}-${index}`} style={{ margin: "0 0 1px", paddingLeft: "2px", fontSize: "12px", lineHeight: 1.15 }}>
          {bullet}
        </li>
      ))}
    </ul>
  );
}

function RichOrBullets({ value }) {
  if (!hasText(value)) return null;
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: INK, fontSize: "12px", lineHeight: 1.15 }}
        className="[&_ul]:my-0 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-0 [&_p]:mb-0"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  return <BulletList value={value} />;
}

function Row({ left, center, right, subLeft, subRight }) {
  return (
    <div style={{ breakInside: "avoid" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", columnGap: "23px", alignItems: "baseline" }}>
        <p style={{ margin: 0, minWidth: 0, color: INK, fontSize: "14px", fontWeight: 800, lineHeight: 1.05 }}>
          {left}
        </p>
        {hasText(center) ? (
          <p style={{ margin: 0, color: INK, fontSize: "13px", fontWeight: 800, lineHeight: 1.05, whiteSpace: "nowrap" }}>{center}</p>
        ) : <span />}
        {hasText(right) ? (
          <p style={{ margin: 0, color: INK, fontSize: "13px", fontWeight: 800, lineHeight: 1.05, textAlign: "right", whiteSpace: "nowrap" }}>{right}</p>
        ) : null}
      </div>
      {(hasText(subLeft) || hasText(subRight)) ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "18px", alignItems: "baseline", marginTop: "2px" }}>
          <p style={{ margin: 0, color: INK, fontSize: "12px", fontStyle: "italic", lineHeight: 1.05 }}>{subLeft}</p>
          {hasText(subRight) ? (
            <p style={{ margin: 0, color: INK, fontSize: "12px", fontStyle: "italic", lineHeight: 1.05, textAlign: "right", whiteSpace: "nowrap" }}>{subRight}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Education({ items }) {
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {items.map((edu, index) => {
        const degree = [edu.degree, edu.fieldOfStudy].filter(hasText).join(" in ");
        const score = clean(edu.details).match(/\b(CGPA|GPA)\s*[-:]?\s*[\d./]+/i)?.[0] || "";
        return (
          <article key={`ats5-edu-${index}`} style={{ breakInside: "avoid" }}>
            <Row
              left={clean(edu.institution) || "Institution"}
              center={score}
              right={dates(edu.startDate, edu.endDate, edu.currentlyStudying)}
              subLeft={degree}
              subRight={[edu.city, edu.country].filter(hasText).join(", ")}
            />
          </article>
        );
      })}
    </div>
  );
}

function Experience({ items }) {
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      {items.map((exp, index) => (
        <article key={`ats5-exp-${index}`} style={{ breakInside: "avoid" }}>
          <Row
            left={[clean(exp.jobTitle) || "Position", clean(exp.employer)].filter(Boolean).join(" - ")}
            right={dates(exp.startDate, exp.endDate, exp.currentlyWorking)}
          />
          <RichOrBullets value={exp.bullets} />
        </article>
      ))}
    </div>
  );
}

function parseProject(item) {
  const [name = "", type = "", year = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!type && !year && !description) return { name: clean(item), tech: "", links: "", date: "", description: "" };
  return {
    name,
    tech: type,
    links: type ? "[Live]   [Github]" : "",
    date: year,
    description
  };
}

function Projects({ items }) {
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      {items.map((project, index) => (
        <article key={`ats5-project-${index}`} style={{ breakInside: "avoid" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", columnGap: "18px", alignItems: "baseline" }}>
            <p style={{ margin: 0, minWidth: 0, color: INK, fontSize: "12.5px", lineHeight: 1.1 }}>
              <strong>{project.name}</strong>
              {project.tech ? <span> | <em>{project.tech}</em></span> : null}
            </p>
            {project.links ? <p style={{ margin: 0, color: INK, fontSize: "12px", fontWeight: 800, whiteSpace: "nowrap" }}>{project.links}</p> : <span />}
            {project.date ? <p style={{ margin: 0, color: INK, fontSize: "12px", fontWeight: 800, textAlign: "right", whiteSpace: "nowrap" }}>{project.date}</p> : null}
          </div>
          <RichOrBullets value={project.description} />
        </article>
      ))}
    </div>
  );
}

function CustomSection({ section }) {
  const items = (section.items || []).filter(hasText).map(clean);
  if (!items.length) return null;
  return (
    <Section title={clean(section.title)}>
      <BulletList items={items} />
    </Section>
  );
}

function Skills({ skills, languages, certs, socials }) {
  const rows = [];
  splitByCommaOrLine(skills.join(", ")).forEach((item) => {
    const text = clean(item);
    const parts = text.split(":");
    if (parts.length > 1) {
      rows.push({ label: parts.shift().trim(), value: parts.join(":").trim() });
    }
  });
  if (!rows.length && skills.length) rows.push({ label: "Languages", value: skills.map(clean).join(", ") });
  if (languages.length) rows.push({ label: "Spoken Languages", value: languages.map(clean).join(", ") });
  if (certs.length) rows.push({ label: "Certifications", value: certs.map(clean).join(", ") });
  if (socials.length) rows.push({ label: "Links", value: socials.map(clean).join(", ") });
  if (!rows.length) return null;

  return (
    <div style={{ paddingLeft: "18px" }}>
      {rows.map((row, index) => (
        <p key={`${row.label}-${index}`} style={{ margin: 0, color: INK, fontSize: "11.5px", lineHeight: 1.14 }}>
          <strong>{row.label}:</strong> {row.value}
        </p>
      ))}
    </div>
  );
}

export default function AtsFriendlyResumeFivePreview({ data }) {
  const fullName = clean(data?.header?.fullName) || "Monil Mehta";
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const location = clean(data?.header?.location);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const summary = data?.summary?.text || "";
  const education = getMeaningfulEducation(data?.education);
  const experience = getMeaningfulExperience(data?.experience);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
  const certs = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || []).filter(hasText);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const socials = [linkedin, portfolio].filter(hasText);
  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });
  const contactOne = [location, phone, email].filter(hasText).map(clean);
  const contactTwo = [linkedin, portfolio].filter(hasText).map(clean);

  return (
    <div
      data-resume-page="true"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        color: INK,
        fontFamily: FONT,
        boxSizing: "border-box",
        padding: "8mm 10mm 8mm",
        overflow: "visible"
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "5px" }}>
        <h1 style={{ margin: 0, color: INK, fontSize: "30px", fontWeight: 400, lineHeight: 0.95 }}>{fullName}</h1>
        {contactOne.length ? (
          <p style={{ margin: "4px 0 0", color: INK, fontSize: "13px", lineHeight: 1.1 }}>
            {contactOne.map((item, index) => (
              <span key={`${item}-${index}`}>{index ? "   •   " : ""}{item}</span>
            ))}
          </p>
        ) : null}
        {contactTwo.length ? (
          <p style={{ margin: "3px 0 0", color: INK, fontSize: "13px", lineHeight: 1.1 }}>
            {contactTwo.map((item, index) => (
              <span key={`${item}-${index}`}>{index ? "   •   " : ""}{item}</span>
            ))}
          </p>
        ) : null}
      </header>

      <main>
        {education.length ? (
          <Section title="Education">
            <Education items={education} />
          </Section>
        ) : null}

        {experience.length ? (
          <Section title="Professional Experience">
            <Experience items={experience} />
          </Section>
        ) : null}

        {projects.length ? (
          <Section title="Projects">
            <Projects items={projects} />
          </Section>
        ) : null}

        {customSections.map((section) => (
          <CustomSection key={section.id || section.title} section={section} />
        ))}

        {hasText(summary) ? (
          <Section title="Summary">
            <RichOrBullets value={summary} />
          </Section>
        ) : null}

        {(skills.length || languages.length || certs.length || socials.length) ? (
          <Section title="Technical Skills">
            <Skills skills={skills} languages={languages} certs={certs} socials={socials} />
          </Section>
        ) : null}
      </main>
    </div>
  );
}
