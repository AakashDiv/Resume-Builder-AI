import { FaEnvelope, FaGlobe, FaLocationDot, FaPhone } from "react-icons/fa6";
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

const INK = "#2e3d50";
const RULE = "#111111";
const SOFT_RULE = "#e2e8f0";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function buildDate(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function RichText({ value, size = "10px", lineHeight = 1.28, color = INK }) {
  if (!hasText(value)) return null;
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color, fontSize: size, lineHeight }}
        className="[&_ul]:list-none [&_ul]:pl-0 [&_li]:mb-0.5 [&_li]:before:content-['•_'] [&_p]:mb-0.5"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  return <p style={{ margin: 0, color, fontSize: size, lineHeight }}>{clean(value)}</p>;
}

function HeaderContact({ icon: Icon, text }) {
  if (!hasText(text)) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
      <Icon style={{ fontSize: "6.5px", color: INK }} />
      <span>{text}</span>
    </span>
  );
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <section style={{ paddingTop: "11px", borderTop: `1px solid ${SOFT_RULE}`, breakInside: "avoid" }}>
      <h2
        style={{
          margin: 0,
          color: INK,
          fontSize: "15px",
          fontWeight: 800,
          lineHeight: 1,
          textTransform: "uppercase"
        }}
      >
        {title}
      </h2>
      <div style={{ height: "1px", background: RULE, margin: "5px 0 7px" }} />
      {children}
    </section>
  );
}

function EntryTitle({ children }) {
  if (!hasText(children)) return null;
  return (
    <p style={{ margin: "0 0 2px", color: INK, fontSize: "12px", fontWeight: 800, lineHeight: 1.12 }}>
      {children}
    </p>
  );
}

function MetaRow({ left, right }) {
  if (!hasText(left) && !hasText(right)) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "baseline" }}>
      <p style={{ margin: 0, color: INK, fontSize: "9.6px", fontWeight: 800, lineHeight: 1.16 }}>
        {left}
      </p>
      {hasText(right) ? (
        <p style={{ margin: 0, color: INK, fontSize: "9.6px", fontWeight: 800, lineHeight: 1.16, whiteSpace: "nowrap" }}>
          {right}
        </p>
      ) : null}
    </div>
  );
}

function BulletList({ text }) {
  const bullets = splitBullets(text || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "2px 0 0", padding: 0, listStyle: "none", color: INK }}>
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} style={{ margin: 0, fontSize: "9.6px", lineHeight: 1.28 }}>
          <span>• </span>
          {bullet}
        </li>
      ))}
    </ul>
  );
}

function ExperienceSection({ experiences }) {
  if (!experiences.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
      {experiences.map((exp, index) => {
        const company = [exp.employer, exp.city, exp.country].filter(hasText).join(" | ");
        const date = buildDate(exp.startDate, exp.endDate, exp.currentlyWorking);
        return (
          <article key={`ats-exp-${index}`} style={{ breakInside: "avoid" }}>
            <EntryTitle>{clean(exp.jobTitle) || "Position"}</EntryTitle>
            <MetaRow left={company} right={date} />
            {hasHtmlMarkup(exp.bullets) ? <RichText value={exp.bullets} /> : <BulletList text={exp.bullets} />}
          </article>
        );
      })}
    </div>
  );
}

function EducationSection({ educations }) {
  if (!educations.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {educations.map((edu, index) => {
        const degree = [edu.degree, edu.fieldOfStudy].filter(hasText).join(" in ");
        const school = [edu.institution, edu.city, edu.country].filter(hasText).join(" | ");
        const date = buildDate(edu.startDate, edu.endDate, edu.currentlyStudying);
        return (
          <article key={`ats-edu-${index}`} style={{ breakInside: "avoid" }}>
            <EntryTitle>{degree || clean(edu.institution)}</EntryTitle>
            <MetaRow left={[school, date].filter(hasText).join(" • ")} />
            {hasHtmlMarkup(edu.details) ? <RichText value={edu.details} /> : <BulletList text={edu.details} />}
          </article>
        );
      })}
    </div>
  );
}

function SimpleItems({ items, bold = false }) {
  const filtered = items.filter(hasText);
  if (!filtered.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: bold ? "8px" : "7px" }}>
      {filtered.map((item, index) => (
        <p
          key={`${item}-${index}`}
          style={{
            margin: 0,
            color: INK,
            fontSize: bold ? "12px" : "9.8px",
            fontWeight: bold ? 800 : 400,
            lineHeight: 1.22
          }}
        >
          {item}
        </p>
      ))}
    </div>
  );
}

function parseProject(item) {
  const [name = "", type = "", year = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!type && !year && !description) return { name: clean(item), meta: "", description: "" };
  return { name, meta: [type, year].filter(Boolean).join(" • "), description };
}

function ProjectSection({ projects }) {
  if (!projects.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
      {projects.map((project, index) => (
        <article key={`ats-project-${index}`} style={{ breakInside: "avoid" }}>
          <EntryTitle>{project.name}</EntryTitle>
          {project.meta ? <MetaRow left={project.meta} /> : null}
          <RichText value={project.description} />
        </article>
      ))}
    </div>
  );
}

function parseReferences(additional) {
  const section = getSectionByTitle(additional, "References");
  return (section?.items || [])
    .filter(hasText)
    .map((item) => {
      const [name = "", role = "", phone = "", email = ""] = String(item).split("|").map((part) => part.trim());
      return [name, role, phone, email].filter(Boolean).join(" • ");
    })
    .filter(Boolean);
}

export default function AtsFriendlyResumeOnePreview({ data }) {
  const fullName = clean(data?.header?.fullName) || "Your Name";
  const headline = clean(data?.header?.headline);
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const location = clean(data?.header?.location);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const summary = data?.summary?.text || "";
  const experiences = getMeaningfulExperience(data?.experience);
  const educations = getMeaningfulEducation(data?.education);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const certs = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || []).filter(hasText);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
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
        width: "216mm",
        minHeight: "279.4mm",
        background: "#ffffff",
        color: INK,
        fontFamily: "Georgia, 'Times New Roman', serif",
        boxSizing: "border-box",
        padding: "13.8mm 14mm 14mm",
        overflow: "hidden"
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "10px" }}>
        <h1
          style={{
            margin: 0,
            color: INK,
            fontSize: "21px",
            fontWeight: 800,
            lineHeight: 1,
            textTransform: "uppercase"
          }}
        >
          {fullName}
        </h1>
        {headline ? (
          <p style={{ margin: "4px 0 0", color: INK, fontSize: "9.4px", lineHeight: 1.1 }}>
            {headline}
          </p>
        ) : null}
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "5px 9px",
            color: INK,
            fontSize: "9px",
            lineHeight: 1.1
          }}
        >
          <HeaderContact icon={FaLocationDot} text={location} />
          <HeaderContact icon={FaEnvelope} text={email} />
          <HeaderContact icon={FaPhone} text={phone} />
          <HeaderContact icon={FaGlobe} text={portfolio || linkedin} />
        </div>
      </header>

      <div style={{ height: "1px", background: SOFT_RULE, margin: "0 0 12px" }} />

      <main style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {hasText(summary) ? (
          <Section title="Summary">
            <RichText value={summary} size="11px" lineHeight={1.3} />
          </Section>
        ) : null}

        {experiences.length ? (
          <Section title="Experience">
            <ExperienceSection experiences={experiences} />
          </Section>
        ) : null}

        {educations.length ? (
          <Section title="Education">
            <EducationSection educations={educations} />
          </Section>
        ) : null}

        {certs.length ? (
          <Section title="Certifications">
            <SimpleItems items={certs} bold />
          </Section>
        ) : null}

        {projects.length ? (
          <Section title="Projects">
            <ProjectSection projects={projects} />
          </Section>
        ) : null}

        {customSections.map((section) => (
          <Section key={section.id || section.title} title={section.title}>
            <SimpleItems items={section.items.filter(hasText)} />
          </Section>
        ))}

        {(skills.length || languages.length) ? (
          <Section title="Skills">
            <SimpleItems items={[skills.join(", "), languages.join(", ")].filter(hasText)} />
          </Section>
        ) : null}

        {references.length ? (
          <Section title="References">
            <SimpleItems items={references} />
          </Section>
        ) : null}
      </main>
    </div>
  );
}
