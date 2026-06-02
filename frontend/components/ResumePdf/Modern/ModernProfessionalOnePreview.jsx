import { FaBriefcase, FaEnvelope, FaGlobe, FaGraduationCap, FaLocationDot, FaPhone, FaUser } from "react-icons/fa6";
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

const NAVY = "#303b4d";
const SIDEBAR = "#e2e2e2";
const INK = "#313b4b";
const MUTED = "#4b5563";
const INVERSE = "#ffffff";
const MAIN = "#ffffff";
const ACCENT = "#1f3449";
const HEADER_BG = "var(--resume-header-bg, #303b4d)";
const SIDEBAR_BG = "var(--resume-sidebar-bg, #e2e2e2)";
const MAIN_BG = "var(--resume-main-bg, #ffffff)";
const PRIMARY_TEXT = "var(--resume-primary-text, #313b4b)";
const MUTED_TEXT = "var(--resume-muted-text, #4b5563)";
const INVERSE_TEXT = "var(--resume-inverse-text, #ffffff)";
const ACCENT_COLOR = "var(--resume-accent, #1f3449)";
const FONT = "Inter, Arial, sans-serif";
const FIRST_UNITS = 112;
const NEXT_UNITS = 128;
const DEFAULT_PHOTO = "/resume-assets/modern-professional-1-photo.png";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function textUnits(value, base = 2) {
  const text = clean(value);
  if (!text) return 0;
  return base + Math.ceil(text.length / 120) + Math.max(0, splitBullets(value || "").length - 1);
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
  let units = 8;
  if (kind === "profile") units = 8 + textUnits(item.text, 1);
  if (kind === "experience") units = 10 + textUnits(item.bullets, 1);
  if (kind === "education") units = 8 + textUnits(item.details, 0);
  if (kind === "project") units = 8 + textUnits(item.description, 1);
  if (kind === "text") units = 6 + textUnits(item.text, 0);
  return { section, kind, item, showTitle, units: (showTitle ? 6 : 0) + units };
}

function paginate(blocks) {
  const pages = [];
  let current = [];
  let used = 0;
  let pageIndex = 0;
  blocks.forEach((block) => {
    const capacity = pageIndex === 0 ? FIRST_UNITS : NEXT_UNITS;
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
  return (
    <header style={{ gridColumn: "1 / -1", background: HEADER_BG, height: "50mm", display: "grid", gridTemplateColumns: "64mm 1fr", alignItems: "center", padding: "0 15mm" }}>
      <div />
      <div>
        <h1 style={{ margin: 0, color: INVERSE_TEXT, fontSize: "32px", fontWeight: 800, lineHeight: 1.05, textTransform: "uppercase" }}>{clean(data?.header?.fullName) || "Your Name"}</h1>
        {hasText(data?.header?.headline) ? <p style={{ margin: "9px 0 0", color: INVERSE_TEXT, fontSize: "17px", lineHeight: 1.15, textTransform: "uppercase" }}>{clean(data.header.headline)}</p> : null}
      </div>
    </header>
  );
}

function SidebarTitle({ title }) {
  return (
    <div style={{ margin: "0 0 14px" }}>
      <h2 style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "17px", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase" }}>{title}</h2>
      <div style={{ height: "2px", background: ACCENT_COLOR, marginTop: "8px" }} />
    </div>
  );
}

function ContactRow({ icon, text }) {
  if (!hasText(text)) return null;
  return (
    <p style={{ margin: "0 0 14px", color: PRIMARY_TEXT, fontSize: "11px", lineHeight: 1.25, display: "grid", gridTemplateColumns: "16px 1fr", gap: "9px", alignItems: "center" }}>
      <span>{icon}</span><span>{clean(text)}</span>
    </p>
  );
}

function Sidebar({ data, pageIndex }) {
  const uploadedPhoto = String(data?.header?.photo || "").trim();
  const photo = uploadedPhoto || DEFAULT_PHOTO;
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const references = (getSectionByTitle(data?.additional, "References")?.items || []).filter(hasText);
  return (
    <aside style={{ background: SIDEBAR_BG, padding: pageIndex === 0 ? "0 10mm 14mm" : "14mm 10mm", minHeight: pageIndex === 0 ? "247mm" : "297mm" }}>
      {pageIndex === 0 ? (
        <img src={photo} alt="" style={{ width: "49mm", height: "49mm", borderRadius: "50%", objectFit: "cover", border: "4px solid #ffffff", margin: "-35mm auto 22mm", display: "block" }} />
      ) : null}
      {pageIndex === 0 ? (
        <section style={{ marginBottom: "26px" }}>
          <SidebarTitle title="Contact" />
          <ContactRow icon={<FaPhone />} text={data?.header?.phone} />
          <ContactRow icon={<FaEnvelope />} text={data?.header?.email} />
          <ContactRow icon={<FaLocationDot />} text={data?.header?.location} />
          <ContactRow icon={<FaGlobe />} text={data?.additional?.portfolio || data?.additional?.linkedin} />
        </section>
      ) : null}
      {skills.length ? (
        <section style={{ marginBottom: "26px" }}>
          <SidebarTitle title="Skills" />
          <ul style={{ margin: 0, padding: "0 0 0 14px", color: PRIMARY_TEXT }}>
            {skills.map((skill, index) => <li key={`${skill}-${index}`} style={{ margin: "0 0 9px", fontSize: "11px", lineHeight: 1.25 }}>{clean(skill)}</li>)}
          </ul>
        </section>
      ) : null}
      {languages.length ? (
        <section style={{ marginBottom: "26px" }}>
          <SidebarTitle title="Languages" />
          <ul style={{ margin: 0, padding: "0 0 0 14px", color: PRIMARY_TEXT }}>
            {languages.map((language, index) => <li key={`${language}-${index}`} style={{ margin: "0 0 7px", fontSize: "10.5px", lineHeight: 1.25 }}>{clean(language)}</li>)}
          </ul>
        </section>
      ) : null}
      {references.length ? (
        <section>
          <SidebarTitle title="Reference" />
          {references.map((item, index) => <p key={`${item}-${index}`} style={{ margin: "0 0 9px", color: PRIMARY_TEXT, fontSize: "10.5px", lineHeight: 1.35 }}>{clean(item)}</p>)}
        </section>
      ) : null}
    </aside>
  );
}

function SectionTitle({ title, icon }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: "12px", alignItems: "center", marginBottom: "13px" }}>
      <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: ACCENT_COLOR, color: INVERSE_TEXT, display: "grid", placeItems: "center", fontSize: "11px" }}>{icon}</span>
      <div>
        <h2 style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "18px", fontWeight: 800, letterSpacing: "5px", textTransform: "uppercase" }}>{title}</h2>
        <div style={{ height: "2px", background: ACCENT_COLOR, marginTop: "7px" }} />
      </div>
    </div>
  );
}

function Paragraphs({ value, items }) {
  if (hasHtmlMarkup(value)) {
    return <div style={{ color: PRIMARY_TEXT, fontSize: "11.5px", lineHeight: 1.45, textAlign: "justify" }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }} />;
  }
  const lines = items || splitText(value || "");
  return <div style={{ color: PRIMARY_TEXT, fontSize: "11.5px", lineHeight: 1.45, textAlign: "justify" }}>{lines.filter(hasText).map((line, index) => <p key={`${line}-${index}`} style={{ margin: index ? "7px 0 0" : 0 }}>{clean(line)}</p>)}</div>;
}

function BulletList({ value }) {
  const bullets = splitBullets(value || "");
  if (!bullets.length) return null;
  return <ul style={{ margin: "9px 0 0", padding: "0 0 0 18px", color: PRIMARY_TEXT }}>{bullets.map((bullet, index) => <li key={`${bullet}-${index}`} style={{ margin: "0 0 5px", fontSize: "11px", lineHeight: 1.35 }}>{clean(bullet)}</li>)}</ul>;
}

function ExperienceEntry({ item }) {
  return (
    <article>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", alignItems: "baseline" }}>
        <div>
          <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "12px", fontWeight: 800 }}>{clean(item.employer) || clean(item.jobTitle)}</p>
          <p style={{ margin: "4px 0 0", color: MUTED_TEXT, fontSize: "12px" }}>{clean(item.jobTitle)}</p>
        </div>
        <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "11px", whiteSpace: "nowrap" }}>{dateRange(item.startDate, item.endDate, item.currentlyWorking)}</p>
      </div>
      <BulletList value={item.bullets} />
    </article>
  );
}

function EducationEntry({ item }) {
  const degree = [item.degree, item.fieldOfStudy].filter(hasText).join(" | ");
  return (
    <article>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", alignItems: "baseline" }}>
        <div>
          <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "12px", fontWeight: 800 }}>{degree || clean(item.institution)}</p>
          {hasText(item.institution) ? <p style={{ margin: "4px 0 0", color: MUTED_TEXT, fontSize: "12px" }}>{clean(item.institution)}</p> : null}
        </div>
        <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "11px", whiteSpace: "nowrap" }}>{dateRange(item.startDate, item.endDate, item.currentlyStudying)}</p>
      </div>
      {hasText(item.details) ? <p style={{ margin: "6px 0 0", color: PRIMARY_TEXT, fontSize: "11px", lineHeight: 1.35 }}>{clean(item.details)}</p> : null}
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
    <article>
      <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "12px", fontWeight: 800 }}>{item.name}</p>
      {item.type || item.year ? <p style={{ margin: "4px 0 0", color: MUTED_TEXT, fontSize: "11px" }}>{[item.type, item.year].filter(Boolean).join(" | ")}</p> : null}
      <BulletList value={item.description} />
    </article>
  );
}

function Block({ block }) {
  const icon = block.kind === "profile" ? <FaUser /> : block.kind === "education" ? <FaGraduationCap /> : <FaBriefcase />;
  return (
    <section style={{ marginTop: block.showTitle ? "22px" : "18px", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} icon={icon} /> : null}
      {block.kind === "profile" ? <Paragraphs value={block.item.text} /> : null}
      {block.kind === "experience" ? <ExperienceEntry item={block.item} /> : null}
      {block.kind === "education" ? <EducationEntry item={block.item} /> : null}
      {block.kind === "project" ? <ProjectEntry item={block.item} /> : null}
      {block.kind === "text" ? <Paragraphs value={block.item.text} /> : null}
    </section>
  );
}

function buildBlocks({ summary, experience, education, projects, customSections }) {
  const blocks = [];
  if (hasText(summary)) splitText(summary, 760).forEach((text, index) => blocks.push(makeBlock("Profile", "profile", { text }, index === 0)));
  experience.forEach((item, index) => blocks.push(makeBlock("Work Experience", "experience", item, index === 0)));
  education.forEach((item, index) => blocks.push(makeBlock("Education", "education", item, index === 0)));
  projects.forEach((item, index) => blocks.push(makeBlock("Projects", "project", item, index === 0)));
  customSections.forEach((section) => {
    const title = clean(section.title);
    (section.items || []).filter(hasText).forEach((text, index) => blocks.push(makeBlock(title, "text", { text }, index === 0)));
  });
  return blocks;
}

function Page({ data, blocks, pageIndex }) {
  return (
    <div data-resume-page="true" style={{ width: "210mm", minHeight: "297mm", background: MAIN_BG, color: PRIMARY_TEXT, fontFamily: FONT, boxSizing: "border-box", display: "grid", gridTemplateRows: pageIndex === 0 ? "50mm 1fr" : "1fr", overflow: "hidden", pageBreakAfter: "always" }}>
      {pageIndex === 0 ? <Header data={data} /> : null}
      <div style={{ display: "grid", gridTemplateColumns: "65mm 1fr", minHeight: pageIndex === 0 ? "247mm" : "297mm" }}>
        <Sidebar data={data} pageIndex={pageIndex} />
        <main style={{ background: MAIN_BG, padding: pageIndex === 0 ? "15mm 10mm 16mm" : "18mm 10mm 16mm" }}>{blocks.map((block, index) => <Block key={`${block.section}-${block.kind}-${index}`} block={block} />)}</main>
      </div>
    </div>
  );
}

export default function ModernProfessionalOnePreview({
  data,
  accentColor = ACCENT,
  headerBgColor = NAVY,
  sidebarBgColor = SIDEBAR,
  mainBgColor = MAIN,
  primaryTextColor = INK,
  mutedTextColor = MUTED,
  inverseTextColor = INVERSE
}) {
  const experience = getMeaningfulExperience(data?.experience);
  const education = getMeaningfulEducation(data?.education);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });
  const pages = paginate(buildBlocks({ summary: data?.summary?.text || "", experience, education, projects, customSections }));
  return (
    <div
      style={{
        "--resume-accent": accentColor,
        "--resume-header-bg": headerBgColor,
        "--resume-sidebar-bg": sidebarBgColor,
        "--resume-main-bg": mainBgColor,
        "--resume-primary-text": primaryTextColor,
        "--resume-muted-text": mutedTextColor,
        "--resume-inverse-text": inverseTextColor,
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      {pages.map((blocks, index) => <Page key={`modernpro1-${index}`} data={data} blocks={blocks} pageIndex={index} />)}
    </div>
  );
}
