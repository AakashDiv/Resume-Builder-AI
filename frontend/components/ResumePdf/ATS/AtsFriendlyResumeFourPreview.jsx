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

const INK = "#1f2430";
const MUTED = "#4b5563";
const BLUE = "#1674ea";
const RULE = "#202938";
const SOFT_RULE = "#cfd5dd";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <section style={{ breakInside: "avoid", marginTop: "18px" }}>
      <h2
        style={{
          margin: "0 0 7px",
          color: INK,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "14px",
          fontWeight: 800,
          letterSpacing: "2.5px",
          lineHeight: 1.08,
          textTransform: "uppercase"
        }}
      >
        {title}
      </h2>
      <div style={{ height: "1px", background: SOFT_RULE, marginBottom: "8px" }} />
      {children}
    </section>
  );
}

function RichText({ value, asBullets = false }) {
  if (!hasText(value)) return null;
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: INK, fontSize: "12px", lineHeight: 1.48 }}
        className="[&_ul]:my-0 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1.5 [&_p]:mb-1.5"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }

  const bullets = splitBullets(value || "");
  if (asBullets || bullets.length > 1) {
    return <BulletList items={bullets.length ? bullets : [clean(value)]} />;
  }

  return <p style={{ margin: 0, color: INK, fontSize: "12px", lineHeight: 1.48 }}>{clean(value)}</p>;
}

function BulletList({ items }) {
  const filtered = (items || []).filter(hasText).map(clean);
  if (!filtered.length) return null;
  return (
    <ul style={{ margin: 0, padding: "0 0 0 14px", color: INK }}>
      {filtered.map((item, index) => (
        <li key={`${item}-${index}`} style={{ margin: "0 0 6px", paddingLeft: "5px", fontSize: "12px", lineHeight: 1.48 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function InlineTitle({ primary, secondary }) {
  return (
    <p style={{ margin: 0, color: INK, fontSize: "13px", fontWeight: 800, lineHeight: 1.22 }}>
      {primary}
      {hasText(secondary) ? (
        <>
          <span style={{ color: INK, fontWeight: 800 }}>{"  "}</span>
          <span style={{ color: BLUE, fontWeight: 800 }}>{secondary}</span>
        </>
      ) : null}
    </p>
  );
}

function RowMeta({ right }) {
  if (!hasText(right)) return null;
  return <p style={{ margin: 0, color: MUTED, fontSize: "11.5px", lineHeight: 1.22, textAlign: "right", whiteSpace: "nowrap" }}>{right}</p>;
}

function Experience({ experiences }) {
  if (!experiences.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "17px" }}>
      {experiences.map((exp, index) => {
        const right = [[exp.city, exp.country].filter(hasText).join(", "), dateRange(exp.startDate, exp.endDate, exp.currentlyWorking)]
          .filter(hasText)
          .join(" • ");
        return (
          <article key={`ats4-exp-${index}`} style={{ breakInside: "avoid" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "18px", alignItems: "baseline", marginBottom: "6px" }}>
              <InlineTitle primary={clean(exp.employer) || "Company"} secondary={clean(exp.jobTitle) || "Position"} />
              <RowMeta right={right} />
            </div>
            {hasHtmlMarkup(exp.bullets) ? <RichText value={exp.bullets} /> : <BulletList items={splitBullets(exp.bullets)} />}
          </article>
        );
      })}
    </div>
  );
}

function Education({ education }) {
  if (!education.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {education.map((edu, index) => {
        const degree = [edu.degree, edu.fieldOfStudy].filter(hasText).join(" in ");
        const location = [edu.city, edu.country].filter(hasText).join(", ");
        const right = [location, dateRange(edu.startDate, edu.endDate, edu.currentlyStudying)].filter(hasText).join(" • ");
        return (
          <article key={`ats4-edu-${index}`} style={{ breakInside: "avoid" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "18px", alignItems: "baseline" }}>
              <InlineTitle primary={clean(edu.institution) || "Institution"} secondary={degree} />
              <RowMeta right={right} />
            </div>
            {hasText(edu.details) ? <div style={{ marginTop: "5px" }}><RichText value={edu.details} /></div> : null}
          </article>
        );
      })}
    </div>
  );
}

function buildSkillRows(skills, customSections) {
  const parsed = skills
    .map((item) => clean(item))
    .map((item) => {
      const parts = item.split(":");
      if (parts.length < 2) return null;
      return { label: parts.shift().trim(), value: parts.join(":").trim() };
    })
    .filter((row) => row?.label && row?.value);

  if (parsed.length) return parsed;

  const rows = [];
  if (skills.length) rows.push({ label: "Technical Skills:", value: skills.map(clean).join(", ") });
  customSections.forEach((section) => {
    const value = (section.items || []).filter(hasText).map(clean).join(", ");
    if (hasText(section.title) && value) rows.push({ label: `${clean(section.title)}:`, value });
  });
  return rows;
}

function SkillsTable({ rows }) {
  if (!rows.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "165px 1fr", columnGap: "18px", rowGap: "8px" }}>
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} style={{ display: "contents" }}>
          <p style={{ margin: 0, color: INK, fontSize: "11.5px", fontWeight: 800, lineHeight: 1.35 }}>{row.label}</p>
          <p style={{ margin: 0, color: INK, fontSize: "11.5px", lineHeight: 1.35 }}>{row.value}</p>
        </div>
      ))}
    </div>
  );
}

function parseProject(item) {
  const [name = "", type = "", year = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!type && !year && !description) return { name: clean(item), meta: "", description: "" };
  return { name, meta: [type, year].filter(Boolean).join(" • "), description };
}

function ProjectList({ projects }) {
  if (!projects.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
      {projects.map((project, index) => (
        <article key={`ats4-project-${index}`} style={{ breakInside: "avoid" }}>
          <InlineTitle primary={project.name} secondary={project.meta} />
          <div style={{ marginTop: "5px" }}>
            {hasHtmlMarkup(project.description) ? <RichText value={project.description} /> : <BulletList items={splitBullets(project.description)} />}
          </div>
        </article>
      ))}
    </div>
  );
}

function SimpleList({ items }) {
  const filtered = (items || []).filter(hasText).map(clean);
  if (!filtered.length) return null;
  return <BulletList items={filtered} />;
}

export default function AtsFriendlyResumeFourPreview({ data }) {
  const fullName = clean(data?.header?.fullName) || "Sasha Lee";
  const headline = clean(data?.header?.headline) || "Professional Title";
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const location = clean(data?.header?.location);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const summary = data?.summary?.text || "";
  const experiences = getMeaningfulExperience(data?.experience);
  const education = getMeaningfulEducation(data?.education);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const certs = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || []).filter(hasText);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
  const socials = [linkedin, portfolio].filter(hasText).map(clean);

  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });
  const skillRows = buildSkillRows(skills, customSections);
  const contactLine = [location, email, phone].filter(hasText).map(clean).join(" • ");

  return (
    <div
      data-resume-page="true"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        color: INK,
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        padding: "19mm 18mm 18mm",
        overflow: "visible"
      }}
    >
      <header>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "18px", alignItems: "baseline" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", minWidth: 0 }}>
            <h1 style={{ margin: 0, color: INK, fontSize: "25px", fontWeight: 800, lineHeight: 1.05, letterSpacing: 0 }}>
              {fullName}
            </h1>
            {headline ? (
              <p style={{ margin: 0, color: BLUE, fontSize: "14px", fontWeight: 800, lineHeight: 1.2 }}>
                {headline}
              </p>
            ) : null}
          </div>
          {contactLine ? (
            <p style={{ margin: 0, color: MUTED, fontSize: "11.5px", lineHeight: 1.2, textAlign: "right", whiteSpace: "nowrap" }}>
              {contactLine}
            </p>
          ) : null}
        </div>
        <div style={{ height: "2px", background: RULE, marginTop: "19px" }} />
      </header>

      <main>
        {hasText(summary) ? (
          <Section title="Profile Summary">
            <RichText value={summary} asBullets />
          </Section>
        ) : null}

        {skillRows.length ? (
          <Section title="Technical Skills">
            <SkillsTable rows={skillRows} />
          </Section>
        ) : null}

        {education.length ? (
          <Section title="Education">
            <Education education={education} />
          </Section>
        ) : null}

        {experiences.length ? (
          <Section title="Work Experience">
            <Experience experiences={experiences} />
          </Section>
        ) : null}

        {projects.length ? (
          <Section title="Projects">
            <ProjectList projects={projects} />
          </Section>
        ) : null}

        {certs.length ? (
          <Section title="Certifications">
            <SimpleList items={certs} />
          </Section>
        ) : null}

        {languages.length ? (
          <Section title="Languages">
            <SimpleList items={languages} />
          </Section>
        ) : null}

        {socials.length ? (
          <Section title="Social Links">
            <SimpleList items={socials} />
          </Section>
        ) : null}
      </main>
    </div>
  );
}
