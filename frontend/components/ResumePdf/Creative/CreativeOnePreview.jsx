import { FaEnvelope, FaLocationDot, FaPhone } from "react-icons/fa6";
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

const DARK = "#626465";
const TEXT = "#66676a";
const ORANGE = "#ff9f18";
const FONT = "Poppins, Arial, sans-serif";
const FIRST_MAIN_UNITS = 88;
const NEXT_MAIN_UNITS = 112;

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
  let contentUnits = 8;
  if (kind === "summary") contentUnits = 8 + textUnits(item.text, 1);
  if (kind === "experience") contentUnits = 10 + textUnits(item.bullets, 1);
  if (kind === "project") contentUnits = 9 + textUnits(item.description, 1);
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

function SidebarTitle({ title }) {
  return (
    <div style={{ margin: "22px 0 13px" }}>
      <h2 style={{ margin: 0, color: "#ffffff", fontSize: "18px", fontWeight: 700, lineHeight: 1.1 }}>{title}</h2>
      <div style={{ height: "1px", background: "#e5e5e5", marginTop: "12px" }} />
    </div>
  );
}

function ContactRow({ icon, text }) {
  if (!hasText(text)) return null;
  return (
    <p style={{ margin: "0 0 10px", color: "#ffffff", fontSize: "10px", lineHeight: 1.25, display: "grid", gridTemplateColumns: "18px 1fr", gap: "9px", alignItems: "center" }}>
      <span style={{ fontSize: "14px" }}>{icon}</span>
      <span>{text}</span>
    </p>
  );
}

function Sidebar({ data, pageIndex }) {
  const education = getMeaningfulEducation(data?.education);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const certs = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || []).filter(hasText);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const photo = data?.header?.photo;

  return (
    <aside style={{ background: DARK, color: "#ffffff", padding: "23mm 10mm 12mm", minHeight: "297mm" }}>
      {pageIndex === 0 && photo ? (
        <img src={photo} alt="" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "12px", marginBottom: "28px", filter: "grayscale(100%)" }} />
      ) : null}
      {pageIndex === 0 ? (
        <>
          <SidebarTitle title="Contact" />
          <ContactRow icon={<FaPhone />} text={data?.header?.phone} />
          <ContactRow icon={<FaEnvelope />} text={data?.header?.email} />
          <ContactRow icon={<FaLocationDot />} text={data?.header?.location} />
        </>
      ) : null}
      {education.length ? (
        <>
          <SidebarTitle title="Education" />
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {education.map((edu, index) => (
              <article key={`creative1-edu-${index}`} style={{ color: "#ffffff" }}>
                <p style={{ margin: 0, fontSize: "10.5px", lineHeight: 1.25 }}>
                  • {clean(edu.degree) || clean(edu.institution)}
                  <span style={{ float: "right" }}>{dateRange(edu.startDate, edu.endDate, edu.currentlyStudying)}</span>
                </p>
                {hasText(edu.institution) ? <p style={{ margin: "4px 0 0 14px", fontSize: "10px", fontStyle: "italic" }}>{clean(edu.institution)}</p> : null}
                {hasText(edu.details) ? <p style={{ margin: "6px 0 0 14px", fontSize: "9.5px", lineHeight: 1.45 }}>{clean(edu.details)}</p> : null}
              </article>
            ))}
          </div>
        </>
      ) : null}
      {(skills.length || certs.length || languages.length) ? (
        <>
          <SidebarTitle title="Skills" />
          <ul style={{ margin: 0, padding: "0 0 0 17px", color: "#ffffff" }}>
            {[...skills, ...certs, ...languages].filter(hasText).map((skill, index) => (
              <li key={`${skill}-${index}`} style={{ margin: "0 0 13px", fontSize: "11.5px", lineHeight: 1.25 }}>{clean(skill)}</li>
            ))}
          </ul>
        </>
      ) : null}
    </aside>
  );
}

function MainTitle({ title }) {
  return <h2 style={{ margin: "0 0 14px", color: TEXT, fontSize: "26px", fontWeight: 500, lineHeight: 1.1 }}>{title}</h2>;
}

function Paragraphs({ value, items }) {
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: TEXT, fontSize: "13px", lineHeight: 1.5, letterSpacing: "1.2px" }}
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  const lines = items || splitText(value || "");
  return (
    <div style={{ color: TEXT, fontSize: "13px", lineHeight: 1.5, letterSpacing: "1.2px" }}>
      {lines.filter(hasText).map((line, index) => <p key={`${line}-${index}`} style={{ margin: index ? "8px 0 0" : 0 }}>{clean(line)}</p>)}
    </div>
  );
}

function Entry({ item, type }) {
  const title = type === "project" ? item.name : clean(item.jobTitle);
  const subtitle = type === "project" ? item.tech : clean(item.employer);
  const details = type === "project" ? item.description : item.bullets;
  return (
    <article style={{ display: "grid", gridTemplateColumns: "10px 1fr", gap: "12px", breakInside: "avoid" }}>
      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: ORANGE, marginTop: "7px" }} />
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", alignItems: "baseline" }}>
          <div>
            <p style={{ margin: 0, color: TEXT, fontSize: "13px", fontWeight: 500, lineHeight: 1.15 }}>{title || "Experience"}</p>
            {subtitle ? <p style={{ margin: "2px 0 0", color: TEXT, fontSize: "11px", fontStyle: "italic", lineHeight: 1.15 }}>{subtitle}</p> : null}
          </div>
          <p style={{ margin: 0, color: TEXT, fontSize: "10px", lineHeight: 1.15, whiteSpace: "nowrap" }}>{type === "project" ? item.date : dateRange(item.startDate, item.endDate, item.currentlyWorking)}</p>
        </div>
        <div style={{ marginTop: "8px" }}><Paragraphs value={details} /></div>
      </div>
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
    <section style={{ marginTop: block.showTitle ? "26px" : "20px", breakInside: "avoid" }}>
      {block.showTitle ? <MainTitle title={block.section} /> : null}
      {block.kind === "summary" ? <Paragraphs value={block.item.text} /> : null}
      {block.kind === "experience" ? <Entry item={block.item} type="experience" /> : null}
      {block.kind === "project" ? <Entry item={block.item} type="project" /> : null}
      {block.kind === "text" ? <Paragraphs value={block.item.text} /> : null}
    </section>
  );
}

function buildBlocks({ summary, experience, projects, customSections }) {
  const blocks = [];
  if (hasText(summary)) splitText(summary, 720).forEach((text, index) => blocks.push(makeBlock("About Me", "summary", { text }, index === 0)));
  experience.forEach((item, index) => blocks.push(makeBlock("Experience", "experience", item, index === 0)));
  projects.forEach((item, index) => blocks.push(makeBlock("Projects", "project", item, index === 0)));
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
        gridTemplateColumns: "76mm 1fr",
        overflow: "hidden",
        pageBreakAfter: "always"
      }}
    >
      <Sidebar data={data} pageIndex={pageIndex} />
      <main
        style={{
          padding: pageIndex === 0 ? "34mm 14mm 16mm" : "18mm 14mm 16mm",
          background:
            "radial-gradient(circle at 35% 10%, rgba(0,0,0,0.035), transparent 23%), linear-gradient(120deg, rgba(0,0,0,0.025), transparent 45%), #fbfbfa"
        }}
      >
        {pageIndex === 0 ? (
          <header style={{ marginBottom: "24px" }}>
            <h1 style={{ margin: 0, color: TEXT, fontSize: "39px", fontWeight: 800, lineHeight: 1, textTransform: "uppercase" }}>{clean(data?.header?.fullName) || "Your Name"}</h1>
            {hasText(data?.header?.headline) ? <p style={{ margin: "8px 0 0", color: TEXT, fontSize: "17px", fontWeight: 700 }}>{clean(data.header.headline)}</p> : null}
          </header>
        ) : null}
        {blocks.map((block, index) => <Block key={`${block.section}-${block.kind}-${index}`} block={block} />)}
      </main>
    </div>
  );
}

export default function CreativeOnePreview({ data }) {
  const experience = getMeaningfulExperience(data?.experience);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });
  const pages = paginate(buildBlocks({ summary: data?.summary?.text || "", experience, projects, customSections }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {pages.map((blocks, index) => <Page key={`creative1-${index}`} data={data} blocks={blocks} pageIndex={index} />)}
    </div>
  );
}
