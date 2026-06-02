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

const INK = "#3a3a3d";
const BODY = "#6f6f73";
const RED = "#df3527";
const RULE = "#5f5f62";
const FONT = "'Inter', 'Arial', sans-serif";
const FIRST_PAGE_UNITS = 136;
const NEXT_PAGE_UNITS = 136;

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function textUnits(value, base = 2) {
  const text = clean(value);
  if (!text) return 0;
  return base + Math.ceil(text.length / 130) + Math.max(0, splitBullets(value || "").length - 1);
}

function splitText(value, maxChars = 800) {
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
  if (kind === "summary") contentUnits = 5 + textUnits(item.text, 0);
  if (kind === "experience") contentUnits = 7 + textUnits(item.bullets, 1);
  if (kind === "education") contentUnits = 5 + textUnits(item.details, 0);
  if (kind === "project") contentUnits = 6 + textUnits(item.description, 1);
  if (kind === "text") contentUnits = 5 + textUnits(item.text, 0);
  if (kind === "skills") contentUnits = 4 + Math.ceil((item.items || []).length / 8) * 2;
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
  const fullName = clean(data?.header?.fullName) || "Shankhadeep Dey";
  const parts = fullName.split(/\s+/);
  const last = parts.length > 1 ? parts.pop() : "";
  const first = parts.join(" ") || fullName;
  const location = clean(data?.header?.location);
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const contacts = [phone, email, linkedin, portfolio].filter(hasText).map(clean);

  return (
    <header style={{ textAlign: "center", marginBottom: "21px" }}>
      <h1 style={{ margin: 0, color: INK, fontSize: "39px", fontWeight: 200, lineHeight: 1.05, letterSpacing: "-1px" }}>
        {first} {last ? <strong style={{ fontWeight: 800 }}>{last}</strong> : null}
      </h1>
      {location ? (
        <p style={{ margin: "6px 0 0", color: "#9a9a9d", fontSize: "11px", fontStyle: "italic", lineHeight: 1.15 }}>
          {location}
        </p>
      ) : null}
      {contacts.length ? (
        <p style={{ margin: "9px 0 0", color: INK, fontSize: "8.5px", lineHeight: 1.2 }}>
          {contacts.join("   |   ")}
        </p>
      ) : null}
    </header>
  );
}

function SectionTitle({ title }) {
  const first = title.charAt(0);
  const rest = title.slice(1);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px", alignItems: "end", marginBottom: "8px" }}>
      <h2 style={{ margin: 0, color: INK, fontSize: "18px", fontWeight: 800, lineHeight: 1, letterSpacing: 0 }}>
        <span style={{ color: RED }}>{first}</span>{rest}
      </h2>
      <div style={{ height: "1px", background: RULE, marginBottom: "3px" }} />
    </div>
  );
}

function Paragraphs({ value, items }) {
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: BODY, fontSize: "10px", lineHeight: 1.35 }}
        className="[&_ul]:my-0 [&_ul]:pl-4 [&_li]:mb-0.5 [&_p]:mb-1"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  const lines = items || splitText(value || "");
  if (!lines.length) return null;
  return (
    <div style={{ color: BODY, fontSize: "10px", lineHeight: 1.35 }}>
      {lines.filter(hasText).map((line, index) => (
        <p key={`${line}-${index}`} style={{ margin: index ? "2px 0 0" : 0 }}>{clean(line)}</p>
      ))}
    </div>
  );
}

function BulletList({ value }) {
  const bullets = splitBullets(value || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "5px 0 0", padding: "0 0 0 12px", color: BODY }}>
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} style={{ margin: "0 0 1px", paddingLeft: "3px", fontSize: "9.7px", lineHeight: 1.28 }}>
          {clean(bullet)}
        </li>
      ))}
    </ul>
  );
}

function EntryHeader({ title, subtitle, location, date }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "18px", alignItems: "start" }}>
      <div>
        <p style={{ margin: 0, color: INK, fontSize: "11.5px", fontWeight: 800, lineHeight: 1.15 }}>{title}</p>
        {subtitle ? <p style={{ margin: "5px 0 0", color: INK, fontSize: "8.8px", fontVariant: "small-caps", letterSpacing: "0.6px", lineHeight: 1.1 }}>{subtitle}</p> : null}
      </div>
      <div style={{ textAlign: "right", minWidth: "30mm" }}>
        {location ? <p style={{ margin: 0, color: RED, fontSize: "9px", fontStyle: "italic", lineHeight: 1.15 }}>{location}</p> : null}
        {date ? <p style={{ margin: "8px 0 0", color: "#8e8e92", fontSize: "8.5px", fontStyle: "italic", lineHeight: 1.15 }}>{date}</p> : null}
      </div>
    </div>
  );
}

function ExperienceEntry({ item }) {
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader
        title={clean(item.employer) || clean(item.jobTitle) || "Experience"}
        subtitle={clean(item.jobTitle)}
        location={[item.city, item.country].filter(hasText).join(", ")}
        date={dateRange(item.startDate, item.endDate, item.currentlyWorking)}
      />
      <BulletList value={item.bullets} />
    </article>
  );
}

function EducationEntry({ item }) {
  const degree = [item.degree, item.fieldOfStudy].filter(hasText).join(" in ");
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader
        title={clean(item.institution) || degree || "Education"}
        subtitle={degree}
        location={[item.city, item.country].filter(hasText).join(", ")}
        date={dateRange(item.startDate, item.endDate, item.currentlyStudying)}
      />
      {hasText(item.details) ? <BulletList value={item.details} /> : null}
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

function SkillsEntry({ item }) {
  return (
    <p style={{ margin: 0, color: INK, fontSize: "10px", lineHeight: 1.35 }}>
      {item.items.map(clean).join(" - ")}
    </p>
  );
}

function TextEntry({ item }) {
  return <Paragraphs value={item.text} items={item.items} />;
}

function Block({ block }) {
  return (
    <section style={{ marginTop: block.showTitle ? "18px" : "10px", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} /> : null}
      {block.kind === "summary" ? <TextEntry item={block.item} /> : null}
      {block.kind === "experience" ? <ExperienceEntry item={block.item} /> : null}
      {block.kind === "education" ? <EducationEntry item={block.item} /> : null}
      {block.kind === "project" ? <ProjectEntry item={block.item} /> : null}
      {block.kind === "skills" ? <SkillsEntry item={block.item} /> : null}
      {block.kind === "text" ? <TextEntry item={block.item} /> : null}
    </section>
  );
}

function buildBlocks({ summary, experience, education, projects, skills, certs, languages, customSections, socials }) {
  const blocks = [];
  if (hasText(summary)) splitText(summary, 900).forEach((text, index) => blocks.push(makeBlock("Summary", "summary", { text }, index === 0)));
  experience.forEach((item, index) => blocks.push(makeBlock("Experience", "experience", item, index === 0)));
  projects.forEach((item, index) => blocks.push(makeBlock("Projects", "project", item, index === 0)));
  const awards = customSections.filter((section) => /award|honou?r|achievement/i.test(section.title || ""));
  awards.forEach((section) => (section.items || []).filter(hasText).forEach((text, index) => blocks.push(makeBlock(clean(section.title), "text", { text }, index === 0))));
  education.forEach((item, index) => blocks.push(makeBlock("Education", "education", item, index === 0)));
  const skillItems = [...skills, ...certs.map((item) => `Certification: ${clean(item)}`), ...languages.map((item) => `Language: ${clean(item)}`), ...socials];
  if (skillItems.length) blocks.push(makeBlock("Skills", "skills", { items: skillItems }, true));
  customSections
    .filter((section) => !awards.includes(section))
    .forEach((section) => (section.items || []).filter(hasText).forEach((text, index) => blocks.push(makeBlock(clean(section.title), "text", { text }, index === 0))));
  return blocks;
}

function Page({ blocks, isFirstPage, pageNumber, totalPages, data }) {
  const name = clean(data?.header?.fullName) || "Resume";
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
        padding: "20mm 17mm 16mm",
        overflow: "hidden",
        position: "relative",
        pageBreakAfter: "always"
      }}
    >
      {isFirstPage ? <Header data={data} /> : null}
      <main>
        {blocks.map((block, index) => <Block key={`${block.section}-${block.kind}-${index}`} block={block} />)}
      </main>
      <footer style={{ position: "absolute", left: "17mm", right: "17mm", bottom: "8mm", display: "grid", gridTemplateColumns: "1fr auto 1fr", color: "#9a9a9d", fontSize: "8px", letterSpacing: "0.4px", textTransform: "uppercase" }}>
        <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        <span>{name} - Resume</span>
        <span style={{ textAlign: "right" }}>{pageNumber} / {totalPages}</span>
      </footer>
    </div>
  );
}

export default function AtsFriendlyResumeNinePreview({ data }) {
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
      {pages.map((blocks, index) => (
        <Page key={`ats9-page-${index}`} blocks={blocks} isFirstPage={index === 0} pageNumber={index + 1} totalPages={pages.length} data={data} />
      ))}
    </div>
  );
}
