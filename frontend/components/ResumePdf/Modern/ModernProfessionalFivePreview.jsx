import { useEffect } from "react";
import { FaAt, FaLocationDot, FaPhone } from "react-icons/fa6";
import {
  extractPlainText,
  formatDateRange,
  getAdditionalSections,
  getMeaningfulEducation,
  getMeaningfulExperience,
  getSectionByTitle,
  hasHtmlMarkup,
  hasText,
  parseReferenceItems,
  sanitizeRichHtml,
  splitBullets,
  splitByCommaOrLine,
  splitDisplayName
} from "../common/previewUtils.js";

const CHARCOAL = "#505050";
const INK = "#535353";
const MUTED = "#5f5f5f";
const WHITE = "#ffffff";
const RULE = "#595959";
const FONT = "Montserrat, Avenir Next, Arial, sans-serif";
const DEFAULT_PHOTO = "/resume-assets/modern-professional-4-photo.png";
const FIRST_MAIN_UNITS = 112;
const NEXT_MAIN_UNITS = 146;
const FIRST_SIDE_UNITS = 116;
const NEXT_SIDE_UNITS = 150;
const HEADER_BG = "var(--resume-header-bg, #505050)";
const MAIN_BG = "var(--resume-main-bg, #ffffff)";
const PRIMARY_TEXT = "var(--resume-primary-text, #535353)";
const MUTED_TEXT = "var(--resume-muted-text, #5f5f5f)";
const INVERSE_TEXT = "var(--resume-inverse-text, #ffffff)";
const ACCENT_COLOR = "var(--resume-accent, #505050)";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function textUnits(value, base = 2) {
  const text = clean(value);
  if (!text) return 0;
  return base + Math.ceil(text.length / 116) + Math.max(0, splitBullets(value || "").length - 1);
}

function splitText(value, maxChars = 760) {
  const bullets = splitBullets(value || "");
  if (bullets.length > 1) return bullets;
  const text = clean(value);
  if (!text) return [];
  if (text.length <= maxChars) return [text];

  const chunks = [];
  let current = "";
  text.split(/(?<=[.!?])\s+/).filter(Boolean).forEach((sentence) => {
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

function parseProject(item) {
  const [name = "", type = "", year = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!type && !year && !description) return { name: clean(item), type: "", year: "", description: "" };
  return { name, type, year, description };
}

function makeMainBlock(section, kind, item, showTitle = false) {
  let units = 8;
  if (kind === "summary") units = 8 + textUnits(item.text, 1);
  if (kind === "education") units = 11 + textUnits(item.details, 0);
  if (kind === "experience") units = 12 + textUnits(item.bullets, 1);
  if (kind === "project") units = 9 + textUnits(item.description, 1);
  if (kind === "text") units = 7 + textUnits(item.text, 0);
  return { column: "main", section, kind, item, showTitle, units: units + (showTitle ? 9 : 0) };
}

function makeSideBlock(section, kind, item, showTitle = false) {
  let units = 6;
  if (kind === "contact") units = 6;
  if (kind === "skill") units = 5;
  if (kind === "language") units = 5;
  if (kind === "reference") units = 18;
  if (kind === "text") units = 6 + textUnits(item.text, 0);
  return { column: "side", section, kind, item, showTitle, units: units + (showTitle ? 10 : 0) };
}

function paginate(blocks, firstCapacity, nextCapacity) {
  const pages = [];
  let current = [];
  let used = 0;
  let pageIndex = 0;

  blocks.forEach((block) => {
    const capacity = pageIndex === 0 ? firstCapacity : nextCapacity;
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
    <div style={{ marginBottom: "14px" }}>
      <h2 style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "18px", lineHeight: 1, fontWeight: 800, letterSpacing: "0", textTransform: "capitalize" }}>{title}</h2>
      <div style={{ height: "1px", background: RULE, marginTop: "12px" }} />
    </div>
  );
}

function Header({ data }) {
  const name = splitDisplayName(data?.header?.fullName || "Your Name");
  const photo = String(data?.header?.photo || "").trim() || DEFAULT_PHOTO;

  return (
    <header style={{ height: "46.5mm", background: HEADER_BG, display: "grid", gridTemplateColumns: "80mm 1fr", alignItems: "center", padding: "0 18mm", boxSizing: "border-box" }}>
      <img src={photo} alt="" style={{ width: "41mm", height: "41mm", borderRadius: "50%", objectFit: "cover", objectPosition: "center top", display: "block", marginLeft: "1mm" }} />
      <div style={{ paddingTop: "1mm" }}>
        <h1 style={{ margin: 0, color: INVERSE_TEXT, fontSize: "41px", lineHeight: 1.04, fontWeight: 400, letterSpacing: "0" }}>
          <span style={{ display: "block" }}>{name.primary || "Your"}</span>
          <span style={{ display: "block" }}>{name.secondary || "Name"}</span>
        </h1>
        {hasText(data?.header?.headline) ? <p style={{ margin: "8px 0 0", color: INVERSE_TEXT, fontSize: "17px", lineHeight: 1.1, fontWeight: 400, letterSpacing: "3.2px" }}>{clean(data.header.headline)}</p> : null}
      </div>
    </header>
  );
}

function ContactRow({ icon, text }) {
  if (!hasText(text)) return null;
  return (
    <p style={{ margin: "0 0 9px", color: MUTED_TEXT, fontSize: "11.5px", lineHeight: 1.28, display: "grid", gridTemplateColumns: "23px 1fr", gap: "7px", alignItems: "center" }}>
      <span style={{ color: PRIMARY_TEXT, fontSize: "15px", lineHeight: 1, display: "grid", placeItems: "center" }}>{icon}</span>
      <span>{clean(text)}</span>
    </p>
  );
}

function Paragraphs({ value, items }) {
  if (hasHtmlMarkup(value)) {
    return <div style={{ color: MUTED_TEXT, fontSize: "11.5px", lineHeight: 1.45, textAlign: "justify" }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }} />;
  }

  const lines = items || splitText(value || "");
  return (
    <div style={{ color: MUTED_TEXT, fontSize: "11.5px", lineHeight: 1.48, textAlign: "justify" }}>
      {lines.filter(hasText).map((line, index) => <p key={`${line}-${index}`} style={{ margin: index ? "6px 0 0" : 0 }}>{clean(line)}</p>)}
    </div>
  );
}

function BulletList({ value }) {
  const bullets = splitBullets(value || "");
  if (!bullets.length) return null;
  return <ul style={{ margin: "7px 0 0", padding: "0 0 0 16px", color: MUTED_TEXT }}>{bullets.map((bullet, index) => <li key={`${bullet}-${index}`} style={{ margin: "0 0 4px", fontSize: "11px", lineHeight: 1.32, textAlign: "justify" }}>{clean(bullet)}</li>)}</ul>;
}

function TimelineEntry({ children, isLast }) {
  return (
    <article style={{ position: "relative", paddingLeft: "8.6mm", paddingBottom: isLast ? 0 : "12px", breakInside: "avoid" }}>
      <span style={{ position: "absolute", left: "-1.4mm", top: "3px", width: "2.5mm", height: "2.5mm", borderRadius: "50%", background: ACCENT_COLOR }} />
      {!isLast ? <span style={{ position: "absolute", left: "-0.25mm", top: "5.2mm", bottom: "-5px", width: "0.5px", background: RULE }} /> : null}
      {children}
    </article>
  );
}

function EducationEntry({ item, isLast }) {
  const title = [item.degree, item.fieldOfStudy].filter(hasText).join(" ");
  return (
    <TimelineEntry isLast={isLast}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "baseline" }}>
        <div>
          <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "13px", lineHeight: 1.15, fontWeight: 500 }}>{title || clean(item.institution)}</p>
          {hasText(item.institution) ? <p style={{ margin: "4px 0 0", color: MUTED_TEXT, fontSize: "12.2px", lineHeight: 1.15, fontStyle: "italic" }}>{clean(item.institution)}</p> : null}
        </div>
        <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "11.2px", lineHeight: 1.2, whiteSpace: "nowrap" }}>{dateRange(item.startDate, item.endDate, item.currentlyStudying)}</p>
      </div>
      {hasText(item.details) ? <Paragraphs value={item.details} /> : null}
    </TimelineEntry>
  );
}

function ExperienceEntry({ item, isLast }) {
  return (
    <TimelineEntry isLast={isLast}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "baseline" }}>
        <div>
          <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "13px", lineHeight: 1.15, fontWeight: 500 }}>{clean(item.jobTitle) || clean(item.employer)}</p>
          {hasText(item.employer) ? <p style={{ margin: "4px 0 0", color: MUTED_TEXT, fontSize: "12.2px", lineHeight: 1.15, fontStyle: "italic" }}>{clean(item.employer)}</p> : null}
        </div>
        <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "11.2px", lineHeight: 1.2, whiteSpace: "nowrap" }}>{dateRange(item.startDate, item.endDate, item.currentlyWorking)}</p>
      </div>
      <BulletList value={item.bullets} />
    </TimelineEntry>
  );
}

function ProjectEntry({ item }) {
  return (
    <article style={{ breakInside: "avoid" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "baseline" }}>
        <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "13px", lineHeight: 1.2, fontWeight: 600 }}>{item.name}</p>
        {item.year ? <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "11.2px", whiteSpace: "nowrap" }}>{item.year}</p> : null}
      </div>
      {item.type ? <p style={{ margin: "4px 0 0", color: MUTED_TEXT, fontSize: "12px", fontStyle: "italic" }}>{item.type}</p> : null}
      <BulletList value={item.description} />
    </article>
  );
}

function ReferenceBlock({ item }) {
  return (
    <article style={{ color: MUTED_TEXT, breakInside: "avoid" }}>
      {item.name ? <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "13px", fontWeight: 800, lineHeight: 1.2 }}>{item.name}</p> : null}
      {item.role ? <p style={{ margin: "5px 0 0", fontSize: "12px", lineHeight: 1.2 }}>{item.role}</p> : null}
      {item.phone ? <p style={{ margin: "10px 0 0", fontSize: "10.8px", lineHeight: 1.25 }}><strong style={{ color: PRIMARY_TEXT }}>Phone:</strong> {item.phone}</p> : null}
      {item.email ? <p style={{ margin: "4px 0 0", fontSize: "10.8px", lineHeight: 1.25 }}><strong style={{ color: PRIMARY_TEXT }}>Email :</strong> {item.email}</p> : null}
    </article>
  );
}

function SideBlock({ block }) {
  return (
    <section style={{ marginTop: block.showTitle ? "0" : "9px", marginBottom: block.showTitle ? "26px" : "0", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} /> : null}
      {block.kind === "contact" ? <ContactRow icon={block.item.icon} text={block.item.text} /> : null}
      {block.kind === "skill" || block.kind === "language" ? <p style={{ margin: "0 0 14px", color: MUTED_TEXT, fontSize: "13px", lineHeight: 1.2 }}>{"\u2022"}<span style={{ marginLeft: "9px" }}>{clean(block.item.text)}</span></p> : null}
      {block.kind === "reference" ? <ReferenceBlock item={block.item} /> : null}
      {block.kind === "text" ? <Paragraphs value={block.item.text} /> : null}
    </section>
  );
}

function MainBlock({ block, blocks, index }) {
  const next = blocks[index + 1];
  const isLastInGroup = !next || next.section !== block.section || next.kind !== block.kind;
  return (
    <section style={{ marginTop: block.showTitle ? "0" : "13px", marginBottom: block.showTitle ? "27px" : "0", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} /> : null}
      {block.kind === "summary" ? <Paragraphs value={block.item.text} /> : null}
      {block.kind === "education" ? <EducationEntry item={block.item} isLast={isLastInGroup} /> : null}
      {block.kind === "experience" ? <ExperienceEntry item={block.item} isLast={isLastInGroup} /> : null}
      {block.kind === "project" ? <ProjectEntry item={block.item} /> : null}
      {block.kind === "text" ? <Paragraphs value={block.item.text} /> : null}
    </section>
  );
}

function buildSidebarBlocks(data, references, customSections) {
  const blocks = [];
  const contacts = [
    { icon: <FaPhone />, text: data?.header?.phone },
    { icon: <FaAt />, text: data?.header?.email },
    { icon: <FaLocationDot />, text: data?.header?.location }
  ].filter((item) => hasText(item.text));
  contacts.forEach((item, index) => blocks.push(makeSideBlock("Contact", "contact", item, index === 0)));

  splitByCommaOrLine(data?.skills?.primarySkills || "").forEach((skill, index) => {
    blocks.push(makeSideBlock("Skills", "skill", { text: skill }, index === 0));
  });

  (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText).forEach((language, index) => {
    blocks.push(makeSideBlock("Language", "language", { text: language }, index === 0));
  });

  references.forEach((reference, index) => blocks.push(makeSideBlock("References", "reference", reference, index === 0)));

  customSections.filter((section) => section.column === "side").forEach((section) => {
    (section.items || []).filter(hasText).forEach((text, index) => {
      blocks.push(makeSideBlock(clean(section.title), "text", { text }, index === 0));
    });
  });

  return blocks;
}

function buildMainBlocks({ data, education, experience, projects, customSections }) {
  const blocks = [];
  if (hasText(data?.summary?.text)) {
    splitText(data.summary.text, 760).forEach((text, index) => blocks.push(makeMainBlock("About Me", "summary", { text }, index === 0)));
  }
  education.forEach((item, index) => blocks.push(makeMainBlock("Education", "education", item, index === 0)));
  experience.forEach((item, index) => blocks.push(makeMainBlock("Experience", "experience", item, index === 0)));
  projects.forEach((item, index) => blocks.push(makeMainBlock("Projects", "project", item, index === 0)));
  customSections.filter((section) => section.column === "main").forEach((section) => {
    (section.items || []).filter(hasText).forEach((text, index) => {
      blocks.push(makeMainBlock(clean(section.title), "text", { text }, index === 0));
    });
  });
  return blocks;
}

function Page({ data, mainBlocks, sideBlocks, pageIndex }) {
  return (
    <div data-resume-page="true" style={{ width: "210mm", minHeight: "297mm", height: "297mm", overflow: "hidden", background: MAIN_BG, color: PRIMARY_TEXT, fontFamily: FONT, boxSizing: "border-box", pageBreakAfter: "always" }}>
      {pageIndex === 0 ? <Header data={data} /> : null}
      <div style={{ display: "grid", gridTemplateColumns: "63mm 1fr", columnGap: "13mm", padding: pageIndex === 0 ? "16mm 13mm 13mm" : "16mm 13mm 13mm", boxSizing: "border-box", height: pageIndex === 0 ? "250.5mm" : "297mm" }}>
        <aside>{sideBlocks.map((block, index) => <SideBlock key={`side-${pageIndex}-${block.section}-${block.kind}-${index}`} block={block} />)}</aside>
        <main>{mainBlocks.map((block, index) => <MainBlock key={`main-${pageIndex}-${block.section}-${block.kind}-${index}`} block={block} blocks={mainBlocks} index={index} />)}</main>
      </div>
    </div>
  );
}

export default function ModernProfessionalFivePreview({
  data,
  accentColor = CHARCOAL,
  headerBgColor = CHARCOAL,
  mainBgColor = WHITE,
  primaryTextColor = INK,
  mutedTextColor = MUTED,
  inverseTextColor = WHITE,
  onPageCountChange
}) {
  const education = getMeaningfulEducation(data?.education);
  const experience = getMeaningfulExperience(data?.experience);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
  const references = parseReferenceItems(data?.additional);
  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional)
    .filter((section) => {
      const title = clean(section?.title).toLowerCase();
      return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
    })
    .map((section) => {
      const sideTitles = new Set(["interests", "hobbies"]);
      return { ...section, column: sideTitles.has(clean(section.title).toLowerCase()) ? "side" : "main" };
    });

  const mainPages = paginate(buildMainBlocks({ data, education, experience, projects, customSections }), FIRST_MAIN_UNITS, NEXT_MAIN_UNITS);
  const sidePages = paginate(buildSidebarBlocks(data, references, customSections), FIRST_SIDE_UNITS, NEXT_SIDE_UNITS);
  const pageCount = Math.max(mainPages.length, sidePages.length);

  useEffect(() => {
    onPageCountChange?.(pageCount);
  }, [onPageCountChange, pageCount]);

  return (
    <div
      style={{
        "--resume-accent": accentColor,
        "--resume-header-bg": headerBgColor,
        "--resume-main-bg": mainBgColor,
        "--resume-primary-text": primaryTextColor,
        "--resume-muted-text": mutedTextColor,
        "--resume-inverse-text": inverseTextColor,
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      {Array.from({ length: pageCount }).map((_, index) => (
        <Page
          key={`modernpro5-${index}`}
          data={data}
          mainBlocks={mainPages[index] || []}
          sideBlocks={sidePages[index] || []}
          pageIndex={index}
        />
      ))}
    </div>
  );
}
