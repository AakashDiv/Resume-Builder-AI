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

const INK = "#000000";
const BLUE = "#0f6890";
const LINK = "#0b5fa5";
const FONT = "Georgia, 'Times New Roman', Times, serif";
const FIRST_PAGE_UNITS = 88;
const NEXT_PAGE_UNITS = 104;

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function unitsForText(value, base = 2) {
  const text = clean(value);
  if (!text) return 0;
  const bulletCount = splitBullets(value || "").length || 1;
  return base + Math.ceil(text.length / 95) + Math.max(0, bulletCount - 1);
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
  let contentUnits = 5;
  if (kind === "summary") contentUnits = 6 + unitsForText(item.text, 0);
  if (kind === "experience") contentUnits = 9 + unitsForText(item.bullets, 1);
  if (kind === "education") contentUnits = 8 + unitsForText(item.details, 0);
  if (kind === "project") contentUnits = 7 + unitsForText(item.description, 1);
  if (kind === "text") contentUnits = 5 + unitsForText(item.text, 0);
  if (kind === "skillTable") contentUnits = 6 + item.rows.length * 3;
  if (kind === "skillLine") contentUnits = 5 + Math.ceil(item.items.length / 6) * 3;
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
  const fullName = clean(data?.header?.fullName) || "Junaid Arham";
  const location = clean(data?.header?.location);
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const contacts = [phone, email, linkedin || portfolio].filter(hasText).map(clean);

  return (
    <header style={{ textAlign: "center", marginBottom: "22px" }}>
      <h1 style={{ margin: 0, color: INK, fontSize: "31px", fontWeight: 400, lineHeight: 1.05, letterSpacing: "3px", textTransform: "uppercase" }}>
        {fullName}
      </h1>
      {location ? <p style={{ margin: "3px 0 0", color: INK, fontSize: "13px", fontWeight: 800, lineHeight: 1.1 }}>{location}</p> : null}
      {contacts.length ? (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, contacts.length)}, 1fr)`, gap: "12px", marginTop: "13px", color: LINK, fontSize: "12px" }}>
          {contacts.map((item, index) => (
            <p key={`${item}-${index}`} style={{ margin: 0, overflowWrap: "anywhere" }}>{item}</p>
          ))}
        </div>
      ) : null}
    </header>
  );
}

function SectionTitle({ title }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <h2 style={{ margin: 0, color: INK, fontSize: "15px", fontWeight: 400, lineHeight: 1.1, textTransform: "uppercase" }}>
        {title}
      </h2>
      <div style={{ height: "1.5px", background: BLUE, marginTop: "4px" }} />
    </div>
  );
}

function Paragraph({ value, items, large = false }) {
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: INK, fontSize: large ? "15px" : "13px", lineHeight: large ? 1.33 : 1.38 }}
        className="[&_ul]:my-0 [&_ul]:pl-5 [&_li]:mb-1 [&_p]:mb-2"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  const lines = items || splitText(value || "");
  if (!lines.length) return null;
  return (
    <div style={{ color: INK, fontSize: large ? "15px" : "13px", lineHeight: large ? 1.33 : 1.38 }}>
      {lines.filter(hasText).map((line, index) => (
        <p key={`${line}-${index}`} style={{ margin: index ? "8px 0 0" : 0 }}>{clean(line)}</p>
      ))}
    </div>
  );
}

function BulletList({ value }) {
  const bullets = splitBullets(value || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "14px 0 0", padding: "0 0 0 22px", color: INK }}>
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} style={{ margin: "0 0 5px", paddingLeft: "4px", fontSize: "13px", lineHeight: 1.38 }}>
          {clean(bullet)}
        </li>
      ))}
    </ul>
  );
}

function EntryHeader({ title, subtitle, date }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "baseline" }}>
        <p style={{ margin: 0, color: INK, fontSize: "18px", fontWeight: 800, lineHeight: 1.15 }}>{title}</p>
        {date ? <p style={{ margin: 0, color: INK, fontSize: "15px", fontStyle: "italic", lineHeight: 1.15, whiteSpace: "nowrap" }}>{date}</p> : null}
      </div>
      {subtitle ? <p style={{ margin: "11px 0 0", color: INK, fontSize: "14px", fontStyle: "italic", lineHeight: 1.15 }}>{subtitle}</p> : null}
    </div>
  );
}

function ExperienceEntry({ item }) {
  const title = [clean(item.employer), [item.city, item.country].filter(hasText).join(", ")].filter(Boolean).join(" • ");
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader title={title || clean(item.jobTitle) || "Experience"} subtitle={clean(item.jobTitle)} date={dateRange(item.startDate, item.endDate, item.currentlyWorking)} />
      <BulletList value={item.bullets} />
    </article>
  );
}

function EducationEntry({ item }) {
  const degree = [item.degree, item.fieldOfStudy].filter(hasText).join(" in ");
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader title={clean(item.institution) || degree || "Education"} subtitle={degree} date={dateRange(item.startDate, item.endDate, item.currentlyStudying)} />
      {hasText(item.details) ? <Paragraph value={item.details} /> : null}
    </article>
  );
}

function parseProject(item) {
  const [name = "", type = "", year = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!type && !year && !description) return { name: clean(item), type: "", year: "", description: "" };
  return { name, type, year, description };
}

function ProjectEntry({ item }) {
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader title={item.name || "Project"} subtitle={item.type} date={item.year} />
      {hasText(item.description) ? <BulletList value={item.description} /> : null}
    </article>
  );
}

function SkillTable({ rows }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", columnGap: "22px", rowGap: "10px", color: INK, fontSize: "13px", lineHeight: 1.25 }}>
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} style={{ display: "contents" }}>
          <p style={{ margin: 0, fontWeight: 800 }}>{row.label}</p>
          <p style={{ margin: 0 }}>{row.value}</p>
        </div>
      ))}
    </div>
  );
}

function SkillLine({ items }) {
  return (
    <p style={{ margin: 0, color: INK, fontSize: "13px", lineHeight: 1.35 }}>
      {items.map(clean).join(" • ")}
    </p>
  );
}

function Block({ block }) {
  return (
    <section style={{ marginTop: block.showTitle ? "22px" : "24px", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} /> : null}
      {block.kind === "summary" ? <Paragraph value={block.item.text} large /> : null}
      {block.kind === "experience" ? <ExperienceEntry item={block.item} /> : null}
      {block.kind === "education" ? <EducationEntry item={block.item} /> : null}
      {block.kind === "project" ? <ProjectEntry item={block.item} /> : null}
      {block.kind === "text" ? <Paragraph value={block.item.text} items={block.item.items} /> : null}
      {block.kind === "skillTable" ? <SkillTable rows={block.item.rows} /> : null}
      {block.kind === "skillLine" ? <SkillLine items={block.item.items} /> : null}
    </section>
  );
}

function buildBlocks({ summary, experience, education, projects, skills, certs, languages, customSections, socials }) {
  const blocks = [];
  if (hasText(summary)) splitText(summary, 850).forEach((text, index) => blocks.push(makeBlock("Summary", "summary", { text }, index === 0)));
  experience.forEach((item, index) => blocks.push(makeBlock("Work Experience", "experience", item, index === 0)));
  projects.forEach((item, index) => blocks.push(makeBlock("Academic Projects", "project", item, index === 0)));
  if (skills.length) blocks.push(makeBlock("Skills", "skillLine", { items: skills }, true));
  const skillRows = [];
  if (skills.length) skillRows.push({ label: "Core Skills", value: skills.join(" • ") });
  if (certs.length) skillRows.push({ label: "Certifications", value: certs.map(clean).join(" • ") });
  if (languages.length) skillRows.push({ label: "Languages", value: languages.map(clean).join(" • ") });
  if (socials.length) skillRows.push({ label: "Links", value: socials.map(clean).join(" • ") });
  if (skillRows.length) blocks.push(makeBlock("Technical Skills", "skillTable", { rows: skillRows }, true));
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
        padding: "15mm 18mm 16mm",
        overflow: "hidden",
        pageBreakAfter: "always"
      }}
    >
      {isFirstPage ? <Header data={data} /> : null}
      <main>
        {blocks.map((block, index) => <Block key={`${block.section}-${block.kind}-${index}`} block={block} />)}
      </main>
    </div>
  );
}

export default function AtsFriendlyResumeEightPreview({ data }) {
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
    experience,
    education,
    projects,
    skills,
    certs,
    languages,
    customSections,
    socials
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {pages.map((blocks, index) => <Page key={`ats8-page-${index}`} blocks={blocks} isFirstPage={index === 0} data={data} />)}
    </div>
  );
}
