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

const PURPLE = "#8055a2";
const TEXT = "#1e1e1e";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function buildDate(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <section style={{ borderTop: `1px solid ${PURPLE}`, paddingTop: "18px", breakInside: "avoid" }}>
      <h2
        style={{
          margin: "0 0 18px",
          color: PURPLE,
          fontSize: "18px",
          fontWeight: 800,
          lineHeight: 1.1,
          textTransform: "uppercase"
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function RichText({ value }) {
  if (!hasText(value)) return null;
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: TEXT, fontSize: "15px", lineHeight: 1.42 }}
        className="[&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-0.5 [&_p]:mb-1"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  return <p style={{ margin: 0, color: TEXT, fontSize: "15px", lineHeight: 1.42 }}>{clean(value)}</p>;
}

function BulletList({ value }) {
  const bullets = splitBullets(value || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "8px 0 0", padding: "0 0 0 24px", color: TEXT }}>
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} style={{ margin: "0 0 3px", fontSize: "15px", lineHeight: 1.35 }}>
          {bullet}
        </li>
      ))}
    </ul>
  );
}

function RowHeader({ left, right }) {
  if (!hasText(left) && !hasText(right)) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "baseline" }}>
      <p style={{ margin: 0, color: TEXT, fontSize: "15px", fontWeight: 800, lineHeight: 1.25 }}>
        {left}
      </p>
      {hasText(right) ? (
        <p style={{ margin: 0, color: TEXT, fontSize: "15px", fontWeight: 800, lineHeight: 1.25, whiteSpace: "nowrap" }}>
          {right}
        </p>
      ) : null}
    </div>
  );
}

function Experience({ experiences }) {
  if (!experiences.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      {experiences.map((exp, index) => {
        const title = [exp.jobTitle, exp.employer].filter(hasText).join(", ");
        const date = buildDate(exp.startDate, exp.endDate, exp.currentlyWorking);
        return (
          <article key={`ats3-exp-${index}`} style={{ breakInside: "avoid" }}>
            <RowHeader left={title || "Position"} right={date} />
            {hasHtmlMarkup(exp.bullets) ? <RichText value={exp.bullets} /> : <BulletList value={exp.bullets} />}
          </article>
        );
      })}
    </div>
  );
}

function Education({ educations }) {
  if (!educations.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "23px" }}>
      {educations.map((edu, index) => {
        const degree = [edu.degree, edu.fieldOfStudy].filter(hasText).join(" in ");
        const date = buildDate(edu.startDate, edu.endDate, edu.currentlyStudying);
        const details = splitBullets(edu.details || "");
        return (
          <article key={`ats3-edu-${index}`} style={{ breakInside: "avoid" }}>
            <RowHeader left={degree || clean(edu.institution)} right={date} />
            {hasText(edu.institution) ? (
              <p style={{ margin: "2px 0 0", color: TEXT, fontSize: "15px", lineHeight: 1.25 }}>
                {clean(edu.institution)}
              </p>
            ) : null}
            {hasHtmlMarkup(edu.details) ? <RichText value={edu.details} /> : details.length ? <BulletList value={edu.details} /> : null}
          </article>
        );
      })}
    </div>
  );
}

function parseProject(item) {
  const [name = "", type = "", year = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!type && !year && !description) return { name: clean(item), meta: "", description: "" };
  return { name, meta: [type, year].filter(Boolean).join(", "), description };
}

function Projects({ projects }) {
  if (!projects.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {projects.map((project, index) => (
        <article key={`ats3-project-${index}`} style={{ breakInside: "avoid" }}>
          <RowHeader left={[project.name, project.meta].filter(Boolean).join(", ")} />
          {hasHtmlMarkup(project.description) ? <RichText value={project.description} /> : <BulletList value={project.description} />}
        </article>
      ))}
    </div>
  );
}

function AdditionalInfo({ skills, languages, certs, customItems }) {
  const rows = [
    skills.length && { label: "Technical Skills", value: skills.join(", ") },
    languages.length && { label: "Languages", value: languages.join(", ") },
    certs.length && { label: "Certifications", value: certs.join(", ") },
    ...customItems
  ].filter(Boolean);

  if (!rows.length) return null;
  return (
    <ul style={{ margin: 0, padding: "0 0 0 24px", color: TEXT }}>
      {rows.map((row, index) => (
        <li key={`${row.label}-${index}`} style={{ margin: "0 0 5px", fontSize: "15px", lineHeight: 1.35 }}>
          <strong>{row.label}:</strong> {row.value}
        </li>
      ))}
    </ul>
  );
}

export default function AtsFriendlyResumeThreePreview({ data }) {
  const fullName = clean(data?.header?.fullName) || "Jacqueline Thompson";
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const location = clean(data?.header?.location);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const summary = data?.summary?.text || "";
  const experiences = getMeaningfulExperience(data?.experience);
  const educations = getMeaningfulEducation(data?.education);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const certs = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || []).filter(hasText).map(clean);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText).map(clean);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);

  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });
  const customRows = customSections.map((section) => ({
    label: clean(section.title),
    value: section.items.filter(hasText).map(clean).join(", ")
  })).filter((row) => row.label && row.value);

  const contactLine = [location, phone, email].filter(Boolean).join(" • ");
  const websiteLine = portfolio || linkedin;

  return (
    <div
      data-resume-page="true"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        color: TEXT,
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        padding: "15mm 13.5mm 13mm",
        overflow: "hidden"
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "19px" }}>
        <h1
          style={{
            margin: 0,
            color: PURPLE,
            fontSize: "37px",
            fontWeight: 800,
            lineHeight: 1,
            textTransform: "uppercase",
            letterSpacing: 0
          }}
        >
          {fullName}
        </h1>
        {contactLine ? (
          <p style={{ margin: "20px 0 0", color: TEXT, fontSize: "15px", lineHeight: 1.25 }}>
            {contactLine}
          </p>
        ) : null}
        {websiteLine ? (
          <p style={{ margin: "2px 0 0", color: TEXT, fontSize: "15px", lineHeight: 1.25 }}>
            {websiteLine}
          </p>
        ) : null}
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: "23px" }}>
        {hasText(summary) ? (
          <Section title="Summary">
            <RichText value={summary} />
          </Section>
        ) : null}

        {experiences.length ? (
          <Section title="Work Experience">
            <Experience experiences={experiences} />
          </Section>
        ) : null}

        {educations.length ? (
          <Section title="Education">
            <Education educations={educations} />
          </Section>
        ) : null}

        {projects.length ? (
          <Section title="Projects">
            <Projects projects={projects} />
          </Section>
        ) : null}

        {(skills.length || languages.length || certs.length || customRows.length) ? (
          <Section title="Additional Information">
            <AdditionalInfo skills={skills} languages={languages} certs={certs} customItems={customRows} />
          </Section>
        ) : null}
      </main>
    </div>
  );
}
