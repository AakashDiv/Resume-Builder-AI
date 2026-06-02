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

const DARK = "#444a4d";
const SIDE = "#f4f4f4";
const TEXT = "#4a4f52";
const RULE = "#c9c9c9";
const FONT = "Poppins, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const FIRST_MAIN_UNITS = 84;
const NEXT_MAIN_UNITS = 110;

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

function splitText(value, maxChars = 700) {
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
  let contentUnits = 7;
  if (kind === "summary") contentUnits = 7 + textUnits(item.text, 1);
  if (kind === "experience") contentUnits = 10 + textUnits(item.bullets, 1);
  if (kind === "project") contentUnits = 9 + textUnits(item.description, 1);
  if (kind === "references") contentUnits = 12 + item.items.length * 4;
  if (kind === "text") contentUnits = 6 + textUnits(item.text, 0);
  return { section, kind, item, showTitle, units: (showTitle ? 7 : 0) + contentUnits };
}

function paginate(blocks) {
  const pages = [];
  let current = [];
  let used = 0;
  let pageIndex = 0;
  blocks.forEach((block) => {
    const capacity = pageIndex === 0 ? FIRST_MAIN_UNITS : NEXT_MAIN_UNITS;
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
  const photo = data?.header?.photo;
  return (
    <header style={{ gridColumn: "1 / -1", background: DARK, display: "grid", gridTemplateColumns: "70mm 1fr", alignItems: "center", minHeight: "62mm", padding: "12mm 18mm" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {photo ? (
          <img src={photo} alt="" style={{ width: "38mm", height: "38mm", borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "38mm", height: "38mm", borderRadius: "50%", background: "#d9d9d9" }} />
        )}
      </div>
      <div>
        <h1 style={{ margin: 0, color: "#ffffff", fontFamily: SERIF, fontSize: "30px", fontWeight: 400, letterSpacing: "1px", lineHeight: 1.1, textTransform: "uppercase" }}>{clean(data?.header?.fullName) || "Your Name"}</h1>
        {hasText(data?.header?.headline) ? <p style={{ margin: "6px 0 0", color: "#ffffff", fontFamily: SERIF, fontSize: "16px", lineHeight: 1.15 }}>{clean(data.header.headline)}</p> : null}
      </div>
    </header>
  );
}

function SideTitle({ title }) {
  return (
    <div style={{ margin: "0 0 16px" }}>
      <h2 style={{ margin: 0, color: TEXT, fontSize: "20px", fontWeight: 800, lineHeight: 1.1 }}>{title}</h2>
      <div style={{ height: "1px", background: RULE, marginTop: "12px" }} />
    </div>
  );
}

function Sidebar({ data, pageIndex }) {
  const education = getMeaningfulEducation(data?.education);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  return (
    <aside style={{ background: SIDE, padding: "14mm 10mm 16mm", minHeight: pageIndex === 0 ? "235mm" : "297mm" }}>
      {pageIndex === 0 ? (
        <section style={{ marginBottom: "24px" }}>
          <SideTitle title="Contact" />
          {[data?.header?.phone, data?.header?.email, data?.additional?.portfolio, data?.header?.location].filter(hasText).map((item, index) => (
            <p key={`${item}-${index}`} style={{ margin: "0 0 8px", color: TEXT, fontSize: "11px", lineHeight: 1.35 }}>{clean(item)}</p>
          ))}
        </section>
      ) : null}
      {education.length ? (
        <section style={{ marginBottom: "24px" }}>
          <SideTitle title="Education" />
          {education.map((edu, index) => (
            <article key={`creative2-edu-${index}`} style={{ marginBottom: "16px" }}>
              <p style={{ margin: 0, color: TEXT, fontSize: "11px", fontStyle: "italic", lineHeight: 1.25 }}>{dateRange(edu.startDate, edu.endDate, edu.currentlyStudying)}</p>
              <p style={{ margin: "5px 0 0", color: TEXT, fontSize: "11px", fontWeight: 800, lineHeight: 1.25 }}>{clean(edu.degree) || clean(edu.institution)}</p>
              {hasText(edu.institution) ? <p style={{ margin: "3px 0 0", color: TEXT, fontSize: "11px", lineHeight: 1.25 }}>{clean(edu.institution)}</p> : null}
            </article>
          ))}
        </section>
      ) : null}
      {skills.length ? (
        <section style={{ marginBottom: "24px" }}>
          <SideTitle title="Skills" />
          <ul style={{ margin: 0, padding: "0 0 0 17px", color: TEXT }}>
            {skills.map((skill, index) => <li key={`${skill}-${index}`} style={{ marginBottom: "11px", fontSize: "12px", lineHeight: 1.25 }}>{clean(skill)}</li>)}
          </ul>
        </section>
      ) : null}
      {languages.length ? (
        <section>
          <SideTitle title="Language" />
          <ul style={{ margin: 0, padding: "0 0 0 17px", color: TEXT }}>
            {languages.map((language, index) => <li key={`${language}-${index}`} style={{ marginBottom: "11px", fontSize: "12px", lineHeight: 1.25 }}>{clean(language)}</li>)}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}

function MainTitle({ title }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <h2 style={{ margin: 0, color: TEXT, fontSize: "20px", fontWeight: 800, lineHeight: 1.1 }}>{title}</h2>
      <div style={{ height: "1px", background: RULE, marginTop: "12px" }} />
    </div>
  );
}

function Paragraphs({ value, items }) {
  if (hasHtmlMarkup(value)) {
    return <div style={{ color: TEXT, fontSize: "11.5px", lineHeight: 1.55, letterSpacing: "0.6px" }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }} />;
  }
  const lines = items || splitText(value || "");
  return (
    <div style={{ color: TEXT, fontSize: "11.5px", lineHeight: 1.55, letterSpacing: "0.6px" }}>
      {lines.filter(hasText).map((line, index) => <p key={`${line}-${index}`} style={{ margin: index ? "7px 0 0" : 0 }}>{clean(line)}</p>)}
    </div>
  );
}

function Entry({ item, type }) {
  const date = type === "project" ? item.date : dateRange(item.startDate, item.endDate, item.currentlyWorking);
  const title = type === "project" ? item.name : clean(item.jobTitle);
  const org = type === "project" ? item.tech : [clean(item.employer), [item.city, item.country].filter(hasText).join(" - ")].filter(Boolean).join(" | ");
  const text = type === "project" ? item.description : item.bullets;
  return (
    <article style={{ breakInside: "avoid" }}>
      {date ? <p style={{ margin: 0, color: TEXT, fontSize: "12px", fontStyle: "italic", lineHeight: 1.2 }}>{date}</p> : null}
      {org ? <p style={{ margin: "5px 0 0", color: TEXT, fontSize: "12px", lineHeight: 1.2 }}>{org}</p> : null}
      <p style={{ margin: "5px 0 0", color: TEXT, fontSize: "12px", fontWeight: 800, lineHeight: 1.2 }}>{title || "Experience"}</p>
      <div style={{ marginTop: "7px" }}><Paragraphs value={text} /></div>
    </article>
  );
}

function parseProject(item) {
  const [name = "", tech = "", date = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!tech && !date && !description) return { name: clean(item), tech: "", date: "", description: "" };
  return { name, tech, date, description };
}

function Block({ block }) {
  return (
    <section style={{ marginTop: block.showTitle ? "26px" : "21px", breakInside: "avoid" }}>
      {block.showTitle ? <MainTitle title={block.section} /> : null}
      {block.kind === "summary" ? <Paragraphs value={block.item.text} /> : null}
      {block.kind === "experience" ? <Entry item={block.item} type="experience" /> : null}
      {block.kind === "project" ? <Entry item={block.item} type="project" /> : null}
      {block.kind === "text" ? <Paragraphs value={block.item.text} /> : null}
      {block.kind === "references" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {block.item.items.map((ref, index) => <Paragraphs key={`${ref}-${index}`} value={ref} />)}
        </div>
      ) : null}
    </section>
  );
}

function buildBlocks({ summary, experience, projects, customSections, references }) {
  const blocks = [];
  if (hasText(summary)) splitText(summary, 720).forEach((text, index) => blocks.push(makeBlock("About Me", "summary", { text }, index === 0)));
  experience.forEach((item, index) => blocks.push(makeBlock("Experience", "experience", item, index === 0)));
  projects.forEach((item, index) => blocks.push(makeBlock("Projects", "project", item, index === 0)));
  if (references.length) blocks.push(makeBlock("References", "references", { items: references }, true));
  customSections.forEach((section) => {
    const title = clean(section.title);
    (section.items || []).filter(hasText).forEach((text, index) => blocks.push(makeBlock(title, "text", { text }, index === 0)));
  });
  return blocks;
}

function Page({ data, blocks, pageIndex }) {
  return (
    <div
      data-resume-page="true"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        color: TEXT,
        fontFamily: FONT,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateRows: pageIndex === 0 ? "62mm 1fr" : "1fr",
        overflow: "hidden",
        pageBreakAfter: "always"
      }}
    >
      {pageIndex === 0 ? <Header data={data} /> : null}
      <div style={{ display: "grid", gridTemplateColumns: "76mm 1fr", minHeight: pageIndex === 0 ? "235mm" : "297mm" }}>
        <Sidebar data={data} pageIndex={pageIndex} />
        <main style={{ padding: pageIndex === 0 ? "14mm 12mm 16mm" : "18mm 12mm 16mm" }}>
          {blocks.map((block, index) => <Block key={`${block.section}-${block.kind}-${index}`} block={block} />)}
        </main>
      </div>
    </div>
  );
}

export default function CreativeTwoPreview({ data }) {
  const experience = getMeaningfulExperience(data?.experience);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
  const references = (getSectionByTitle(data?.additional, "References")?.items || []).filter(hasText).map(clean);
  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });
  const pages = paginate(buildBlocks({ summary: data?.summary?.text || "", experience, projects, customSections, references }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {pages.map((blocks, index) => <Page key={`creative2-${index}`} data={data} blocks={blocks} pageIndex={index} />)}
    </div>
  );
}
