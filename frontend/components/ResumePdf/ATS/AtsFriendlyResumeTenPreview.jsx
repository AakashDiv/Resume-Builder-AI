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

const BLUE = "#1557e6";
const INK = "#171717";
const MUTED = "#5d5d5d";
const FONT = "Arial, Helvetica, sans-serif";
const FIRST_PAGE_UNITS = 124;
const NEXT_PAGE_UNITS = 124;

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function textUnits(value, base = 2) {
  const text = clean(value);
  if (!text) return 0;
  return base + Math.ceil(text.length / 115) + Math.max(0, splitBullets(value || "").length - 1);
}

function splitText(value, maxChars = 760) {
  const bullets = splitBullets(value || "");
  if (bullets.length > 1) return bullets;
  const text = clean(value);
  if (!text) return [];
  if (text.length <= maxChars) return [text];
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks = [];
  let current = "";
  sentences.forEach((sentence) => {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxChars && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  });
  if (current) chunks.push(current);
  return chunks.length ? chunks : [text];
}

function makeBlock(section, kind, item, showTitle = false) {
  let contentUnits = 6;
  if (kind === "summary") contentUnits = 7 + textUnits(item.text, 0);
  if (kind === "skills") contentUnits = 6 + (item.rows || []).length * 2.5;
  if (kind === "experience") contentUnits = 8 + textUnits(item.bullets, 1);
  if (kind === "project") contentUnits = 5 + textUnits(item.description, 0);
  if (kind === "education") contentUnits = 5 + textUnits(item.details, 0);
  if (kind === "text") contentUnits = 5 + textUnits(item.text, 0);
  return { section, kind, item, showTitle, units: (showTitle ? 6 : 0) + contentUnits };
}

function paginate(blocks) {
  const pages = [];
  let current = [];
  let used = 0;
  let pageIndex = 0;
  blocks.forEach((block) => {
    const capacity = pageIndex === 0 ? FIRST_PAGE_UNITS : NEXT_PAGE_UNITS;
    if (current.length && used + block.units > capacity) {
      pages.push(current);
      current = [];
      used = 0;
      pageIndex += 1;
    }
    current.push(block);
    used += block.units;
  });
  if (current.length || !pages.length) pages.push(current);
  return pages;
}

function Header({ data }) {
  const fullName = clean(data?.header?.fullName) || "Muhammad Jaseem TK";
  const headline = clean(data?.header?.headline) || "Professional Title";
  const contacts = [
    clean(data?.header?.phone),
    clean(data?.header?.email),
    clean(data?.additional?.portfolio),
    clean(data?.additional?.linkedin)
  ].filter(hasText);

  return (
    <header style={{ textAlign: "center", marginBottom: "28px" }}>
      <h1 style={{ margin: 0, color: INK, fontSize: "31px", fontWeight: 800, lineHeight: 1.05 }}>
        {fullName}
      </h1>
      {headline ? <p style={{ margin: "6px 0 0", color: BLUE, fontSize: "16px", lineHeight: 1.15 }}>{headline}</p> : null}
      {contacts.length ? (
        <p style={{ margin: "9px 0 0", color: MUTED, fontSize: "11px", lineHeight: 1.2 }}>
          {contacts.map((item, index) => (
            <span key={`${item}-${index}`}>{index ? " · " : ""}<span style={index > 1 ? { color: BLUE, textDecoration: "underline" } : null}>{item}</span></span>
          ))}
        </p>
      ) : null}
    </header>
  );
}

function SectionTitle({ title }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <h2 style={{ margin: 0, color: BLUE, fontSize: "14px", fontWeight: 800, lineHeight: 1.1 }}>{title}</h2>
      <div style={{ height: "1.5px", background: BLUE, marginTop: "5px" }} />
    </div>
  );
}

function Paragraphs({ value, items }) {
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: INK, fontSize: "12px", lineHeight: 1.18 }}
        className="[&_ul]:my-0 [&_ul]:pl-5 [&_li]:mb-1 [&_p]:mb-1"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  const lines = items || splitText(value || "");
  if (!lines.length) return null;
  return (
    <div style={{ color: INK, fontSize: "12px", lineHeight: 1.18 }}>
      {lines.filter(hasText).map((line, index) => <p key={`${line}-${index}`} style={{ margin: index ? "4px 0 0" : 0 }}>{clean(line)}</p>)}
    </div>
  );
}

function BulletList({ value }) {
  const bullets = splitBullets(value || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "4px 0 0", padding: "0 0 0 20px", color: INK }}>
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} style={{ margin: "0 0 5px", paddingLeft: "4px", fontSize: "12px", lineHeight: 1.18 }}>{clean(bullet)}</li>
      ))}
    </ul>
  );
}

function SkillRows({ rows }) {
  return (
    <div style={{ color: MUTED, fontSize: "11.5px", lineHeight: 1.35 }}>
      {rows.map((row, index) => (
        <p key={`${row.label}-${index}`} style={{ margin: index ? "2px 0 0" : 0 }}>
          <strong style={{ color: INK }}>{row.label}:</strong> {row.value}
        </p>
      ))}
    </div>
  );
}

function EntryHeader({ title, company, meta, date }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "18px", alignItems: "baseline" }}>
      <p style={{ margin: 0, color: INK, fontSize: "13px", fontWeight: 800, lineHeight: 1.15 }}>
        {title}
        {company ? <><span style={{ fontWeight: 400 }}> {" — "} </span><span style={{ color: BLUE, fontWeight: 400 }}>{company}</span></> : null}
        {meta ? <span style={{ color: MUTED, fontWeight: 400, fontStyle: "italic" }}> {" · "}{meta}</span> : null}
      </p>
      {date ? <p style={{ margin: 0, color: MUTED, fontSize: "12px", fontStyle: "italic", lineHeight: 1.15, whiteSpace: "nowrap" }}>{date}</p> : null}
    </div>
  );
}

function ExperienceEntry({ item }) {
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader title={clean(item.jobTitle) || "Experience"} company={clean(item.employer)} meta={[item.city, item.country].filter(hasText).join(", ")} date={dateRange(item.startDate, item.endDate, item.currentlyWorking)} />
      <BulletList value={item.bullets} />
    </article>
  );
}

function parseProject(item) {
  const [name = "", type = "", year = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!type && !year && !description) return { name: clean(item), tech: "", date: "", description: "" };
  return { name, tech: type, date: year, description };
}

function ProjectEntry({ item }) {
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader title={item.name || "Project"} meta={item.tech} date={item.date} />
      <BulletList value={item.description} />
    </article>
  );
}

function EducationEntry({ item }) {
  const degree = [item.degree, item.fieldOfStudy].filter(hasText).join(" - ");
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader title={degree || clean(item.institution) || "Education"} company={clean(item.institution)} date={dateRange(item.startDate, item.endDate, item.currentlyStudying)} />
      {hasText(item.details) ? <Paragraphs value={item.details} /> : null}
    </article>
  );
}

function TextEntry({ item }) {
  return <Paragraphs value={item.text} items={item.items} />;
}

function Block({ block }) {
  return (
    <section style={{ marginTop: block.showTitle ? "24px" : "15px", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} /> : null}
      {block.kind === "summary" ? <TextEntry item={block.item} /> : null}
      {block.kind === "skills" ? <SkillRows rows={block.item.rows} /> : null}
      {block.kind === "experience" ? <ExperienceEntry item={block.item} /> : null}
      {block.kind === "project" ? <ProjectEntry item={block.item} /> : null}
      {block.kind === "education" ? <EducationEntry item={block.item} /> : null}
      {block.kind === "text" ? <TextEntry item={block.item} /> : null}
    </section>
  );
}

function buildSkillRows(skills, certs, languages, socials) {
  const rows = [];
  const categorized = skills.map(clean).map((skill) => {
    const [label, ...rest] = skill.split(":");
    return rest.length ? { label: label.trim(), value: rest.join(":").trim() } : null;
  }).filter(Boolean);
  if (categorized.length) rows.push(...categorized);
  else if (skills.length) rows.push({ label: "Skills", value: skills.map(clean).join(", ") });
  if (certs.length) rows.push({ label: "Certifications", value: certs.map(clean).join(", ") });
  if (languages.length) rows.push({ label: "Languages", value: languages.map(clean).join(", ") });
  if (socials.length) rows.push({ label: "Links", value: socials.map(clean).join(", ") });
  return rows;
}

function buildBlocks({ summary, skills, experience, projects, education, customSections, certs, languages, socials }) {
  const blocks = [];
  if (hasText(summary)) splitText(summary, 900).forEach((text, index) => blocks.push(makeBlock("Summary", "summary", { text }, index === 0)));
  const skillRows = buildSkillRows(skills, certs, languages, socials);
  if (skillRows.length) blocks.push(makeBlock("Technical Skills", "skills", { rows: skillRows }, true));
  experience.forEach((item, index) => blocks.push(makeBlock("Experience", "experience", item, index === 0)));
  projects.forEach((item, index) => blocks.push(makeBlock("Projects", "project", item, index === 0)));
  education.forEach((item, index) => blocks.push(makeBlock("Education", "education", item, index === 0)));
  customSections.forEach((section) => {
    const title = clean(section.title);
    (section.items || []).filter(hasText).forEach((text, index) => blocks.push(makeBlock(title, "text", { text }, index === 0)));
  });
  return blocks;
}

function Page({ blocks, isFirstPage, data }) {
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
        padding: "24mm 18mm 17mm",
        overflow: "hidden",
        pageBreakAfter: "always"
      }}
    >
      {isFirstPage ? <Header data={data} /> : null}
      <main>{blocks.map((block, index) => <Block key={`${block.section}-${block.kind}-${index}`} block={block} />)}</main>
    </div>
  );
}

export default function AtsFriendlyResumeTenPreview({ data }) {
  const experience = getMeaningfulExperience(data?.experience);
  const education = getMeaningfulEducation(data?.education);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const certs = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || []).filter(hasText);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const socials = [data?.additional?.linkedin, data?.additional?.portfolio].filter(hasText).map(clean);
  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });
  const pages = paginate(buildBlocks({
    summary: data?.summary?.text || "",
    skills,
    experience,
    projects,
    education,
    customSections,
    certs,
    languages,
    socials
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {pages.map((blocks, index) => <Page key={`ats10-page-${index}`} blocks={blocks} isFirstPage={index === 0} data={data} />)}
    </div>
  );
}
