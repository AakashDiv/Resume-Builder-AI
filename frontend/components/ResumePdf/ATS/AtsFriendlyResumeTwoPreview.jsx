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

const BLACK = "#000000";
const LINK = "#0000ff";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function buildDate(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function NameWord({ word }) {
  if (!word) return null;
  return (
    <span style={{ display: "inline-block", marginRight: "6px" }}>
      <span style={{ fontSize: "20px" }}>{word.charAt(0).toUpperCase()}</span>
      <span style={{ fontSize: "14px" }}>{word.slice(1).toUpperCase()}</span>
    </span>
  );
}

function HeaderName({ name }) {
  const words = clean(name).split(/\s+/).filter(Boolean);
  return (
    <h1
      style={{
        margin: 0,
        color: BLACK,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: 800,
        lineHeight: 1.08,
        letterSpacing: 0
      }}
    >
      {words.map((word, index) => <NameWord key={`${word}-${index}`} word={word} />)}
    </h1>
  );
}

function SectionTitle({ children, note }) {
  return (
    <h2
      style={{
        margin: "0 0 4px",
        color: BLACK,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "19px",
        fontWeight: 800,
        lineHeight: 1.05,
        textTransform: "uppercase"
      }}
    >
      {children}
      {note ? (
        <span style={{ fontSize: "13px", fontWeight: 400, textTransform: "none", marginLeft: "7px" }}>
          {note}
        </span>
      ) : null}
    </h2>
  );
}

function RichText({ value }) {
  if (!hasText(value)) return null;
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: BLACK, fontSize: "12px", lineHeight: 1.23 }}
        className="[&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-0.5 [&_p]:mb-0.5"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  return <p style={{ margin: 0, color: BLACK, fontSize: "12px", lineHeight: 1.23 }}>{clean(value)}</p>;
}

function BulletList({ text }) {
  const bullets = splitBullets(text || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "3px 0 0", padding: "0 0 0 14px", color: BLACK }}>
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} style={{ margin: "0 0 1px", paddingLeft: "2px", fontSize: "12px", lineHeight: 1.23 }}>
          {bullet}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, note, children }) {
  if (!children) return null;
  return (
    <section style={{ marginTop: "12px", breakInside: "avoid" }}>
      <SectionTitle note={note}>{title}</SectionTitle>
      {children}
    </section>
  );
}

function TwoColumnLine({ left, right, boldLeft = false, italicLeft = false }) {
  if (!hasText(left) && !hasText(right)) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "baseline" }}>
      <p
        style={{
          margin: 0,
          color: BLACK,
          fontSize: "12px",
          fontWeight: boldLeft ? 800 : 400,
          fontStyle: italicLeft ? "italic" : "normal",
          lineHeight: 1.22
        }}
      >
        {left}
      </p>
      {hasText(right) ? (
        <p style={{ margin: 0, color: BLACK, fontSize: "12px", lineHeight: 1.22, whiteSpace: "nowrap", textAlign: "right" }}>
          {right}
        </p>
      ) : null}
    </div>
  );
}

function Education({ education }) {
  if (!education.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      {education.map((edu, index) => {
        const degree = [edu.degree, edu.fieldOfStudy].filter(hasText).join(", ");
        const date = buildDate(edu.startDate, edu.endDate, edu.currentlyStudying);
        const place = [edu.institution, edu.city, edu.country].filter(hasText).join(", ");
        return (
          <article key={`ats2-edu-${index}`} style={{ breakInside: "avoid" }}>
            <TwoColumnLine left={degree || clean(edu.institution)} right={date} />
            <TwoColumnLine left={clean(edu.institution)} right={[edu.city, edu.country].filter(hasText).join(", ")} />
            {hasText(edu.details) ? <RichText value={edu.details} /> : null}
          </article>
        );
      })}
    </div>
  );
}

function Experience({ experiences }) {
  if (!experiences.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
      {experiences.map((exp, index) => {
        const date = buildDate(exp.startDate, exp.endDate, exp.currentlyWorking);
        const location = [exp.city, exp.country].filter(hasText).join(", ");
        return (
          <article key={`ats2-exp-${index}`} style={{ breakInside: "avoid" }}>
            <TwoColumnLine left={clean(exp.jobTitle) || "Position Title"} right={date} boldLeft />
            <TwoColumnLine left={clean(exp.employer) || "Organization Name"} right={location} boldLeft />
            {hasHtmlMarkup(exp.bullets) ? <RichText value={exp.bullets} /> : <BulletList text={exp.bullets} />}
          </article>
        );
      })}
    </div>
  );
}

function parseProject(item) {
  const [name = "", type = "", year = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!type && !year && !description) return { title: clean(item), org: "", date: "", description: "" };
  return { title: name, org: type, date: year, description };
}

function Projects({ projects }) {
  if (!projects.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
      {projects.map((project, index) => (
        <article key={`ats2-project-${index}`} style={{ breakInside: "avoid" }}>
          <TwoColumnLine left={project.title} right={project.date} boldLeft />
          {project.org ? <TwoColumnLine left={project.org} /> : null}
          {hasHtmlMarkup(project.description) ? <RichText value={project.description} /> : <BulletList text={project.description} />}
        </article>
      ))}
    </div>
  );
}

function CertificationList({ items }) {
  const filtered = items.filter(hasText);
  if (!filtered.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      {filtered.map((item, index) => (
        <p key={`${item}-${index}`} style={{ margin: 0, color: BLACK, fontSize: "12px", fontWeight: 800, lineHeight: 1.22 }}>
          {item}
        </p>
      ))}
    </div>
  );
}

function SkillsGrid({ skills }) {
  const filtered = skills.filter(hasText);
  if (!filtered.length) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        columnGap: "38px",
        rowGap: "2px"
      }}
    >
      {filtered.map((skill, index) => (
        <div key={`${skill}-${index}`} style={{ display: "flex", gap: "8px", alignItems: "baseline", minWidth: 0 }}>
          <span style={{ fontSize: "14px", lineHeight: 1 }}>•</span>
          <span style={{ fontSize: "12px", lineHeight: 1.2 }}>{skill}</span>
        </div>
      ))}
    </div>
  );
}

function SimpleSectionItems({ items }) {
  const filtered = items.filter(hasText);
  if (!filtered.length) return null;
  return (
    <ul style={{ margin: 0, padding: "0 0 0 14px", color: BLACK }}>
      {filtered.map((item, index) => (
        <li key={`${item}-${index}`} style={{ marginBottom: "2px", fontSize: "12px", lineHeight: 1.23 }}>
          {clean(item)}
        </li>
      ))}
    </ul>
  );
}

export default function AtsFriendlyResumeTwoPreview({ data }) {
  const fullName = clean(data?.header?.fullName) || "First Name Last Name";
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const location = clean(data?.header?.location);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const summary = data?.summary?.text || "";
  const education = getMeaningfulEducation(data?.education);
  const experiences = getMeaningfulExperience(data?.experience);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const certifications = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || []).filter(hasText);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);

  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });

  const contactParts = [phone, email].filter(Boolean);
  const link = linkedin || portfolio;

  return (
    <div
      data-resume-page="true"
      style={{
        width: "216mm",
        minHeight: "279.4mm",
        background: "#ffffff",
        color: BLACK,
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        padding: "10.2mm 10.2mm 12mm",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <header style={{ marginBottom: "10px" }}>
        <HeaderName name={fullName} />
        <p style={{ margin: "8px 0 0", color: BLACK, fontSize: "12px", lineHeight: 1.15 }}>
          {contactParts.join(" | ")}
          {link ? (
            <>
              {contactParts.length ? " | " : ""}
              <span style={{ color: LINK, textDecoration: "underline" }}>{link}</span>
            </>
          ) : null}
          {location ? `${contactParts.length || link ? " | " : ""}${location}` : ""}
        </p>
      </header>

      <main>
        {hasText(summary) ? (
          <Section title="Summary">
            <RichText value={summary} />
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
          <Section title="Project Experience">
            <Projects projects={projects} />
          </Section>
        ) : null}

        {customSections.map((section) => (
          <Section key={section.id || section.title} title={section.title}>
            <SimpleSectionItems items={section.items} />
          </Section>
        ))}

        {certifications.length ? (
          <Section title="Certifications">
            <CertificationList items={certifications} />
          </Section>
        ) : null}

        {(skills.length || languages.length) ? (
          <Section title="Technical Skills">
            <SkillsGrid skills={[...skills, ...languages]} />
          </Section>
        ) : null}
      </main>
    </div>
  );
}
