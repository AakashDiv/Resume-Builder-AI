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

const PURPLE = "#6366f1";
const INK = "#1d1d1f";
const BODY = "#3f3f46";
const MUTED = "#808080";
const RULE = "#c8c9ff";
const FIRST_PAGE_UNITS = 98;
const NEXT_PAGE_UNITS = 104;

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function textUnits(value, base = 2) {
  const text = clean(value);
  if (!text) return 0;
  const lines = splitBullets(value || "").length || 1;
  return base + Math.ceil(text.length / 105) + Math.max(0, lines - 1);
}

function splitLongText(value, maxChars = 520) {
  const bullets = splitBullets(value || "");
  if (bullets.length > 1) return bullets;
  const text = clean(value);
  if (text.length <= maxChars) return [text].filter(Boolean);
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
  const titleCost = showTitle ? 6 : 0;
  let contentUnits = 6;
  if (kind === "experience") contentUnits = 7 + textUnits(item.bullets, 1);
  if (kind === "education") contentUnits = 7 + textUnits(item.details, 0);
  if (kind === "project") contentUnits = 6 + textUnits(item.description, 0);
  if (kind === "text") contentUnits = 3 + textUnits(item.text, 0);
  if (kind === "rows") contentUnits = 4 + Math.max(2, (item.rows || []).length * 2);

  return {
    section,
    kind,
    item,
    showTitle,
    units: titleCost + contentUnits
  };
}

function paginateBlocks(blocks) {
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

function SectionTitle({ title }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "14px", alignItems: "center", margin: "0 0 14px" }}>
      <h2
        style={{
          margin: 0,
          color: PURPLE,
          fontSize: "15px",
          fontWeight: 800,
          letterSpacing: "1.7px",
          lineHeight: 1,
          textTransform: "uppercase"
        }}
      >
        {title}
      </h2>
      <div style={{ height: "2px", background: RULE }} />
    </div>
  );
}

function Paragraphs({ value, items }) {
  if (!hasText(value) && !(items || []).length) return null;
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: BODY, fontSize: "12.8px", lineHeight: 1.48 }}
        className="[&_ul]:my-0 [&_ul]:list-none [&_ul]:pl-4 [&_li]:mb-1 [&_p]:mb-1"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  const lines = items || splitLongText(value || "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", color: BODY, fontSize: "12.8px", lineHeight: 1.48 }}>
      {lines.filter(hasText).map((item, index) => (
        <p key={`${item}-${index}`} style={{ margin: 0 }}>
          {clean(item)}
        </p>
      ))}
    </div>
  );
}

function EntryHeader({ title, subtitle, date }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "18px", alignItems: "baseline" }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, color: INK, fontSize: "14px", fontWeight: 800, lineHeight: 1.15 }}>{title}</p>
        {hasText(subtitle) ? (
          <p style={{ margin: "3px 0 0", color: PURPLE, fontSize: "12.5px", lineHeight: 1.12 }}>{subtitle}</p>
        ) : null}
      </div>
      {hasText(date) ? (
        <p style={{ margin: 0, color: MUTED, fontSize: "12px", lineHeight: 1.15, textAlign: "right", whiteSpace: "nowrap" }}>{date}</p>
      ) : null}
    </div>
  );
}

function ExperienceEntry({ item }) {
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader
        title={clean(item.jobTitle) || "Position"}
        subtitle={clean(item.employer)}
        date={dateRange(item.startDate, item.endDate, item.currentlyWorking)}
      />
      <div style={{ marginTop: "10px", paddingLeft: "14px" }}>
        <Paragraphs value={item.bullets} />
      </div>
    </article>
  );
}

function EducationEntry({ item }) {
  const degree = [item.degree, item.fieldOfStudy].filter(hasText).join(", ");
  const school = clean(item.institution);
  const details = clean(item.details);
  return (
    <article style={{ breakInside: "avoid" }}>
      <EntryHeader
        title={degree || school || "Education"}
        subtitle={school}
        date={dateRange(item.startDate, item.endDate, item.currentlyStudying)}
      />
      {details ? (
        <p style={{ margin: "4px 0 0", color: MUTED, fontSize: "11.5px", lineHeight: 1.25 }}>
          {details}
        </p>
      ) : null}
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
      <EntryHeader title={item.name} subtitle={item.tech} date={item.date} />
      {hasText(item.description) ? (
        <div style={{ marginTop: "10px" }}>
          <Paragraphs value={item.description} />
        </div>
      ) : null}
    </article>
  );
}

function TextEntry({ item }) {
  return <Paragraphs value={item.text} items={item.items} />;
}

function RowsEntry({ item }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {item.rows.map((row, index) => (
        <p key={`${row.label}-${index}`} style={{ margin: 0, color: BODY, fontSize: "12.6px", lineHeight: 1.35 }}>
          <strong style={{ color: INK }}>{row.label}:</strong> {row.value}
        </p>
      ))}
    </div>
  );
}

function Block({ block }) {
  return (
    <section style={{ marginTop: block.showTitle ? "20px" : "18px", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} /> : null}
      {block.kind === "experience" ? <ExperienceEntry item={block.item} /> : null}
      {block.kind === "education" ? <EducationEntry item={block.item} /> : null}
      {block.kind === "project" ? <ProjectEntry item={block.item} /> : null}
      {block.kind === "text" ? <TextEntry item={block.item} /> : null}
      {block.kind === "rows" ? <RowsEntry item={block.item} /> : null}
    </section>
  );
}

function buildSkillRows({ skills, certs, languages, socials }) {
  const rows = [];
  if (skills.length) rows.push({ label: "Skills", value: skills.map(clean).join(" - ") });
  if (certs.length) rows.push({ label: "Certifications", value: certs.map(clean).join(" - ") });
  if (languages.length) rows.push({ label: "Languages", value: languages.map(clean).join(" - ") });
  if (socials.length) rows.push({ label: "Links", value: socials.map(clean).join(" - ") });
  return rows;
}

function buildBlocks({ summary, experience, education, projects, customSections, skillRows }) {
  const blocks = [];

  experience.forEach((item, index) => blocks.push(makeBlock("Work Experience", "experience", item, index === 0)));
  education.forEach((item, index) => blocks.push(makeBlock("Education", "education", item, index === 0)));
  projects.forEach((item, index) => blocks.push(makeBlock("Projects", "project", item, index === 0)));

  if (hasText(summary)) {
    splitLongText(summary, 650).forEach((text, index) => {
      blocks.push(makeBlock("Profile", "text", { text }, index === 0));
    });
  }

  customSections.forEach((section) => {
    const title = clean(section.title);
    (section.items || []).filter(hasText).forEach((text, index) => {
      blocks.push(makeBlock(title, "text", { text }, index === 0));
    });
  });

  if (skillRows.length) blocks.push(makeBlock("Skills", "rows", { rows: skillRows }, true));
  return blocks;
}

function Page({ blocks, isFirstPage, contact }) {
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
        overflow: "hidden",
        pageBreakAfter: "always"
      }}
    >
      {isFirstPage ? (
        <header>
          <h1 style={{ margin: 0, color: PURPLE, fontSize: "27px", fontWeight: 800, lineHeight: 1.08 }}>
            {contact.fullName}
          </h1>
          {contact.firstLine.length ? (
            <p style={{ margin: "8px 0 0", color: "#555555", fontSize: "12px", lineHeight: 1.35 }}>
              {contact.firstLine.join("   ")}
            </p>
          ) : null}
          {contact.secondLine.length ? (
            <p style={{ margin: "8px 0 0", color: "#555555", fontSize: "12px", lineHeight: 1.35 }}>
              {contact.secondLine.join("   ")}
            </p>
          ) : null}
          <div style={{ height: "3px", background: PURPLE, marginTop: "17px" }} />
        </header>
      ) : null}

      <main style={{ paddingTop: isFirstPage ? 0 : "0mm" }}>
        {blocks.map((block, index) => (
          <Block key={`${block.section}-${block.kind}-${index}`} block={block} />
        ))}
      </main>
    </div>
  );
}

export default function AtsFriendlyResumeSixPreview({ data }) {
  const fullName = clean(data?.header?.fullName) || "Monil Mehta";
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const location = clean(data?.header?.location);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const summary = data?.summary?.text || "";
  const experience = getMeaningfulExperience(data?.experience);
  const education = getMeaningfulEducation(data?.education);
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

  const contact = {
    fullName,
    firstLine: [
      email && `Email ${email}`,
      phone && `Phone ${phone}`,
      location && `Location ${location}`,
      linkedin && `LinkedIn ${linkedin}`
    ].filter(Boolean),
    secondLine: [
      portfolio && `Website ${portfolio}`
    ].filter(Boolean)
  };
  const skillRows = buildSkillRows({ skills, certs, languages, socials });
  const pages = paginateBlocks(buildBlocks({ summary, experience, education, projects, customSections, skillRows }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {pages.map((blocks, index) => (
        <Page key={`ats6-page-${index}`} blocks={blocks} isFirstPage={index === 0} contact={contact} />
      ))}
    </div>
  );
}
