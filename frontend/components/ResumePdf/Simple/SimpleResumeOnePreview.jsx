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

const NAVY = "#17345a";
const NAME = "#964b00";
const MUTED = "#808080";
const ORANGE = "#df5b00";
const BORDER = "#bdbdbd";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function PageFrame({ children, pageNumber, showHeader = true }) {
  return (
    <div
      data-resume-page="true"
      style={{
        width: "216mm",
        minHeight: "279.4mm",
        height: "279.4mm",
        background: "#ffffff",
        color: "#000000",
        fontFamily: "Calibri, Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        padding: "8.8mm 10.2mm 9.2mm",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "8.5mm 10.2mm 9mm",
          border: `0.25px solid ${BORDER}`,
          pointerEvents: "none"
        }}
      />
      {showHeader ? (
        <img
          src="/resume-assets/simple-resume-1-header-2.png"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            left: "10.2mm",
            top: "8.8mm",
            width: "205mm",
            height: "31.2mm",
            objectFit: "fill",
            pointerEvents: "none"
          }}
        />
      ) : null}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      {pageNumber > 1 ? (
        <span
          style={{
            position: "absolute",
            right: "20mm",
            bottom: "9.5mm",
            color: "#0d0d0d",
            fontSize: "11px"
          }}
        >
          {pageNumber}
        </span>
      ) : null}
    </div>
  );
}

function ContactHeader({ data }) {
  const fullName = clean(data?.header?.fullName) || "Your Name";
  const headline = clean(data?.header?.headline);
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const linkedin = clean(data?.additional?.linkedin);

  return (
    <header style={{ height: "37mm", paddingTop: "6.5mm", paddingRight: "7.5mm", textAlign: "right" }}>
      <h1
        style={{
          margin: 0,
          color: NAME,
          fontFamily: "Cambria, Georgia, serif",
          fontSize: "20px",
          fontWeight: 800,
          lineHeight: 1.1
        }}
      >
        {fullName}
      </h1>
      {headline || phone ? (
        <p style={{ margin: "5px 0 0", color: "#0d0d0d", fontSize: "12px", lineHeight: 1.2 }}>
          {headline}
          {headline && phone ? " | " : ""}
          {phone ? <><strong>M:</strong> {phone} |</> : null}
        </p>
      ) : null}
      {email ? (
        <p style={{ margin: "3px 0 0", color: "#0000ff", fontSize: "12px", lineHeight: 1.2 }}>
          <strong style={{ color: "#0d0d0d" }}>E:</strong> {email}
        </p>
      ) : null}
      {linkedin ? (
        <p style={{ margin: "3px 0 0", color: "#0000ff", fontSize: "12px", lineHeight: 1.2 }}>
          <strong style={{ color: "#0d0d0d" }}>LinkedIn:</strong> {linkedin}
        </p>
      ) : null}
    </header>
  );
}

function Heading({ children }) {
  return (
    <h2
      style={{
        margin: "0 0 16px",
        color: NAVY,
        fontSize: "29px",
        fontWeight: 400,
        lineHeight: 1.08,
        letterSpacing: "0.04em"
      }}
    >
      {children}
    </h2>
  );
}

function Summary({ text }) {
  if (!hasText(text)) return null;
  if (hasHtmlMarkup(text)) {
    return (
      <div
        style={{ fontSize: "14px", lineHeight: 1.28, marginBottom: "22px" }}
        className="[&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(text) }}
      />
    );
  }
  return <p style={{ margin: "0 0 22px", fontSize: "14px", lineHeight: 1.28 }}>{clean(text)}</p>;
}

function SkillList({ skills }) {
  if (!skills.length) return null;
  return (
    <ul style={{ margin: "0 0 27px 30px", paddingLeft: "22px", fontSize: "14px", lineHeight: 1.35 }}>
      {skills.map((skill, index) => (
        <li key={`${skill}-${index}`} style={{ marginBottom: "2px", paddingLeft: "10px" }}>
          {skill}
        </li>
      ))}
    </ul>
  );
}

function BulletList({ text }) {
  const bullets = splitBullets(text || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "4px 0 0 29px", paddingLeft: "22px", fontSize: "13px", lineHeight: 1.22 }}>
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} style={{ marginBottom: "3px", paddingLeft: "8px" }}>
          {bullet}
        </li>
      ))}
    </ul>
  );
}

function ExperienceEntry({ exp }) {
  const date = dateRange(exp.startDate, exp.endDate, exp.currentlyWorking);
  const companyLine = [exp.employer, date].filter(hasText).join(" | ");
  const roleLine = [exp.jobTitle, exp.city || exp.country].filter(hasText).join(", ");
  return (
    <article style={{ marginBottom: "16px", breakInside: "avoid" }}>
      {companyLine ? <p style={{ margin: 0, color: NAVY, fontSize: "15px", lineHeight: 1.18 }}>{companyLine}</p> : null}
      {roleLine ? <p style={{ margin: "4px 0 0", color: MUTED, fontSize: "14px", lineHeight: 1.18 }}>{roleLine}</p> : null}
      <p style={{ margin: "4px 0 0", color: ORANGE, fontSize: "14px", fontWeight: 800, lineHeight: 1.18 }}>
        Roles & Responsibilities:
      </p>
      {hasHtmlMarkup(exp.bullets) ? (
        <div
          style={{ fontSize: "13px", lineHeight: 1.22, marginLeft: "29px" }}
          className="[&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
        />
      ) : (
        <BulletList text={exp.bullets} />
      )}
    </article>
  );
}

function EducationEntry({ edu }) {
  const date = dateRange(edu.startDate, edu.endDate, edu.currentlyStudying);
  const degree = clean(edu.degree);
  const field = clean(edu.fieldOfStudy);
  const schoolLine = [edu.institution, edu.city || edu.country].filter(hasText).join(", ");
  return (
    <article style={{ marginBottom: "23px", breakInside: "avoid" }}>
      {degree ? <p style={{ margin: 0, color: "#365f91", fontSize: "15px", lineHeight: 1.2 }}>{degree}</p> : null}
      {field ? <p style={{ margin: "8px 0 0", fontSize: "14px", lineHeight: 1.2 }}>{field}</p> : null}
      {schoolLine || date ? (
        <p style={{ margin: "8px 0 0", fontSize: "14px", lineHeight: 1.2 }}>
          {[schoolLine, date].filter(hasText).join(" | ")}
        </p>
      ) : null}
      {hasText(edu.details) ? <BulletList text={edu.details} /> : null}
    </article>
  );
}

function SimpleSection({ title, items }) {
  const filtered = items.filter(hasText).map(clean);
  if (!filtered.length) return null;
  return (
    <section style={{ marginTop: "20px" }}>
      <Heading>{title}</Heading>
      <SkillList skills={filtered} />
    </section>
  );
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
}

export default function SimpleResumeOnePreview({ data }) {
  const summary = data?.summary?.text || "";
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const experiences = getMeaningfulExperience(data?.experience);
  const educations = getMeaningfulEducation(data?.education);
  const certs = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || []).filter(hasText);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText);
  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });

  const firstExperience = experiences.slice(0, 1);
  const continuationExperienceChunks = chunk(experiences.slice(1), 2);
  const pages = [];

  pages.push(
    <PageFrame key="simple-page-1" pageNumber={1}>
      <ContactHeader data={data} />
      <main style={{ padding: "0 20mm 0 10.5mm" }}>
        <Heading>Career Highlights</Heading>
        <Summary text={summary} />
        {skills.length ? <><Heading>Skill Set</Heading><SkillList skills={skills} /></> : null}
        {firstExperience.length ? <><Heading>Work Experience</Heading>{firstExperience.map((exp, index) => <ExperienceEntry key={`exp-first-${index}`} exp={exp} />)}</> : null}
      </main>
    </PageFrame>
  );

  continuationExperienceChunks.forEach((items, pageIndex) => {
    pages.push(
      <PageFrame key={`simple-exp-${pageIndex}`} pageNumber={pages.length + 1}>
        <div style={{ height: "31mm" }} />
        <main style={{ padding: "0 20mm 0 10.5mm" }}>
          {items.map((exp, index) => <ExperienceEntry key={`exp-cont-${pageIndex}-${index}`} exp={exp} />)}
        </main>
      </PageFrame>
    );
  });

  if (educations.length || projects.length || certs.length || languages.length || customSections.length) {
    pages.push(
      <PageFrame key="simple-education" pageNumber={pages.length + 1}>
        <div style={{ height: "31mm" }} />
        <main style={{ padding: "0 20mm 0 10.5mm" }}>
          {educations.length ? <><Heading>Educational Qualifications</Heading>{educations.map((edu, index) => <EducationEntry key={`edu-${index}`} edu={edu} />)}</> : null}
          <SimpleSection title="Projects" items={projects} />
          <SimpleSection title="Certifications" items={certs} />
          <SimpleSection title="Languages" items={languages} />
          {customSections.map((section) => (
            <SimpleSection key={section.id || section.title} title={section.title} items={section.items} />
          ))}
        </main>
      </PageFrame>
    );
  }

  return <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{pages}</div>;
}
