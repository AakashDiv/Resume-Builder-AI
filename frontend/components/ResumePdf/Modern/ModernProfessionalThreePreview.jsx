import { FaEnvelope, FaGlobe, FaLocationDot, FaPhone } from "react-icons/fa6";
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
  splitByCommaOrLine
} from "../common/previewUtils.js";

const DARK = "#333c4c";
const SIDE = "#e4ebf3";
const INK = "#333c4c";
const MUTED = "#737373";
const WHITE = "#ffffff";
const FONT = "Montserrat, Arial, sans-serif";
const DEFAULT_PHOTO = "/resume-assets/modern-professional-3-photo.png";
const ACCENT_COLOR = "var(--resume-accent, #333c4c)";
const HEADER_BG = "var(--resume-header-bg, #333c4c)";
const SIDEBAR_BG = "var(--resume-sidebar-bg, #e4ebf3)";
const MAIN_BG = "var(--resume-main-bg, #ffffff)";
const PRIMARY_TEXT = "var(--resume-primary-text, #333c4c)";
const MUTED_TEXT = "var(--resume-muted-text, #737373)";
const INVERSE_TEXT = "var(--resume-inverse-text, #ffffff)";
const FIRST_PAGE_UNITS = 112;
const NEXT_PAGE_UNITS = 144;

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, current) {
  return formatDateRange(startDate, endDate, current);
}

function textUnits(value, base = 2) {
  const text = clean(value);
  if (!text) return 0;
  return base + Math.ceil(text.length / 118) + Math.max(0, splitBullets(value || "").length - 1);
}

function splitText(value, maxChars = 780) {
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
  let units = 7;
  if (kind === "profile") units = 8 + textUnits(item.text, 1);
  if (kind === "experience") units = 10 + textUnits(item.bullets, 1);
  if (kind === "project") units = 8 + textUnits(item.description, 1);
  if (kind === "reference") units = 14 + Math.ceil((item.items || []).length / 2) * 8;
  if (kind === "text") units = 6 + textUnits(item.text, 0);
  return { section, kind, item, showTitle, units: (showTitle ? 7 : 0) + units };
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
  const photo = String(data?.header?.photo || "").trim() || DEFAULT_PHOTO;
  return (
    <>
      <img src={photo} alt="" style={{ position: "absolute", left: "15mm", top: "7mm", width: "48mm", height: "48mm", borderRadius: "50%", objectFit: "cover", objectPosition: "center top", zIndex: 2 }} />
      <header style={{ position: "absolute", left: "80mm", top: 0, width: "125mm", height: "60mm", background: HEADER_BG, color: INVERSE_TEXT, display: "grid", placeItems: "center", boxSizing: "border-box" }}>
        <div style={{ width: "103mm", height: "32mm", border: "2px solid currentColor", display: "grid", placeItems: "center", boxSizing: "border-box", position: "relative" }}>
          <h1 style={{ margin: 0, fontSize: "28px", lineHeight: 1, fontWeight: 700, letterSpacing: "8px", textAlign: "center", textTransform: "uppercase" }}>{clean(data?.header?.fullName) || "Your Name"}</h1>
          {hasText(data?.header?.headline) ? (
            <p style={{ position: "absolute", bottom: "-12px", left: "18mm", right: "18mm", margin: 0, background: HEADER_BG, fontSize: "13px", lineHeight: 1, fontWeight: 400, letterSpacing: "6px", textAlign: "center", textTransform: "uppercase" }}>{clean(data.header.headline)}</p>
          ) : null}
        </div>
      </header>
    </>
  );
}

function SideTitle({ title }) {
  return (
    <div style={{ marginBottom: "11px" }}>
      <h2 style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "15px", lineHeight: 1, fontWeight: 800, letterSpacing: "7px", textTransform: "uppercase" }}>{title}</h2>
      <div style={{ height: "1.2px", background: PRIMARY_TEXT, marginTop: "9px" }} />
    </div>
  );
}

function ContactRow({ icon, text }) {
  if (!hasText(text)) return null;
  return (
    <p style={{ margin: "0 0 12px", display: "grid", gridTemplateColumns: "15px 1fr", gap: "8px", alignItems: "center", color: MUTED_TEXT, fontSize: "11.5px", lineHeight: 1.25 }}>
      <span style={{ color: PRIMARY_TEXT }}>{icon}</span>
      <span>{clean(text)}</span>
    </p>
  );
}

function Sidebar({ data, pageIndex }) {
  const education = getMeaningfulEducation(data?.education);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const website = data?.additional?.portfolio || data?.additional?.linkedin || data?.additional?.github;
  return (
    <aside style={{ position: "relative", zIndex: 1, minHeight: "297mm", background: SIDEBAR_BG, padding: pageIndex === 0 ? "68mm 9mm 12mm 14mm" : "18mm 9mm 12mm 14mm", boxSizing: "border-box" }}>
      {pageIndex === 0 ? (
        <section style={{ marginBottom: "27px" }}>
          <SideTitle title="Contact" />
          <ContactRow icon={<FaPhone />} text={data?.header?.phone} />
          <ContactRow icon={<FaEnvelope />} text={data?.header?.email} />
          <ContactRow icon={<FaLocationDot />} text={data?.header?.location} />
          <ContactRow icon={<FaGlobe />} text={website} />
        </section>
      ) : null}

      {education.length ? (
        <section style={{ marginBottom: "27px" }}>
          <SideTitle title="Education" />
          {education.map((item, index) => (
            <article key={`edu-${index}`} style={{ marginBottom: "18px", breakInside: "avoid" }}>
              <p style={{ margin: "0 0 5px", color: MUTED_TEXT, fontSize: "11.5px", fontWeight: 800, letterSpacing: "2px" }}>{dateRange(item.startDate, item.endDate, item.currentlyStudying)}</p>
              {hasText(item.institution) ? <p style={{ margin: "0 0 7px", color: MUTED_TEXT, fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>{clean(item.institution)}</p> : null}
              {[item.degree, item.fieldOfStudy, item.details].filter(hasText).map((text, textIndex) => (
                <p key={`${text}-${textIndex}`} style={{ margin: "0 0 4px", color: MUTED_TEXT, fontSize: "11.3px", lineHeight: 1.25 }}>{"\u2022"} {clean(text)}</p>
              ))}
            </article>
          ))}
        </section>
      ) : null}

      {skills.length ? (
        <section style={{ marginBottom: "27px" }}>
          <SideTitle title="Skills" />
          <ul style={{ margin: 0, padding: "0 0 0 12px", color: MUTED_TEXT }}>
            {skills.map((skill, index) => <li key={`${skill}-${index}`} style={{ margin: "0 0 7px", fontSize: "11.3px", lineHeight: 1.2 }}>{clean(skill)}</li>)}
          </ul>
        </section>
      ) : null}

      {languages.length ? (
        <section>
          <SideTitle title="Languages" />
          {languages.map((language, index) => (
            <p key={`${language}-${index}`} style={{ margin: "0 0 5px", color: MUTED_TEXT, fontSize: "11.3px", lineHeight: 1.2 }}>
              <span>{"\u2022"} {clean(language)}</span>
            </p>
          ))}
        </section>
      ) : null}
    </aside>
  );
}

function SectionTitle({ title }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <h2 style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "15px", lineHeight: 1, fontWeight: 800, letterSpacing: "7px", textTransform: "uppercase" }}>{title}</h2>
      <div style={{ height: "1.2px", background: ACCENT_COLOR, marginTop: "9px" }} />
    </div>
  );
}

function Paragraphs({ value, items }) {
  if (hasHtmlMarkup(value)) {
    return <div style={{ color: PRIMARY_TEXT, fontSize: "11.5px", lineHeight: 1.42, textAlign: "justify" }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }} />;
  }
  const lines = items || splitText(value || "");
  return <div style={{ color: PRIMARY_TEXT, fontSize: "11.5px", lineHeight: 1.42, textAlign: "justify" }}>{lines.filter(hasText).map((line, index) => <p key={`${line}-${index}`} style={{ margin: index ? "6px 0 0" : 0 }}>{clean(line)}</p>)}</div>;
}

function BulletList({ value }) {
  const bullets = splitBullets(value || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", color: PRIMARY_TEXT }}>
      {bullets.map((bullet, index) => <li key={`${bullet}-${index}`} style={{ margin: "0 0 4px", fontSize: "11.2px", lineHeight: 1.32, textAlign: "justify" }}>{clean(bullet)}</li>)}
    </ul>
  );
}

function ExperienceEntry({ item }) {
  return (
    <article style={{ position: "relative", paddingLeft: "9mm" }}>
      <span style={{ position: "absolute", left: "-1.35mm", top: "2px", width: "2.3mm", height: "2.3mm", border: `1px solid ${ACCENT_COLOR}`, background: MAIN_BG }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "baseline" }}>
        <div>
          <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "12px", fontWeight: 800 }}>{clean(item.employer) || clean(item.jobTitle)}</p>
          {hasText(item.jobTitle) ? <p style={{ margin: "3px 0 0", color: PRIMARY_TEXT, fontSize: "11.5px" }}>{clean(item.jobTitle)}</p> : null}
        </div>
        <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "11px", whiteSpace: "nowrap" }}>{dateRange(item.startDate, item.endDate, item.currentlyWorking)}</p>
      </div>
      <BulletList value={item.bullets} />
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "baseline" }}>
        <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "12px", fontWeight: 800 }}>{item.name}</p>
        {item.year ? <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "11px" }}>{item.year}</p> : null}
      </div>
      {item.type ? <p style={{ margin: "3px 0 0", color: PRIMARY_TEXT, fontSize: "11px" }}>{item.type}</p> : null}
      <BulletList value={item.description} />
    </article>
  );
}

function ReferenceBlock({ items }) {
  if (!items.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: items.length > 1 ? "1fr 1fr" : "1fr", columnGap: "18mm", rowGap: "10px" }}>
      {items.map((item, index) => (
        <article key={`${item.name}-${index}`}>
          {item.name ? <p style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "12px", fontWeight: 800 }}>{item.name}</p> : null}
          {item.role ? <p style={{ margin: "6px 0 0", color: PRIMARY_TEXT, fontSize: "11px" }}>{item.role}</p> : null}
          {item.phone ? <p style={{ margin: "7px 0 0", color: PRIMARY_TEXT, fontSize: "10px" }}><strong>Phone:</strong> {item.phone}</p> : null}
          {item.email ? <p style={{ margin: "5px 0 0", color: PRIMARY_TEXT, fontSize: "10px" }}><strong>Email :</strong> {item.email}</p> : null}
        </article>
      ))}
    </div>
  );
}

function Block({ block }) {
  const isExperience = block.kind === "experience";
  return (
    <section style={{ position: "relative", marginTop: block.showTitle ? "18px" : "16px", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} /> : null}
      {isExperience ? <div style={{ position: "absolute", left: "1.05mm", top: block.showTitle ? "34px" : 0, bottom: "-8px", width: "1px", background: ACCENT_COLOR }} /> : null}
      {block.kind === "profile" ? <Paragraphs value={block.item.text} /> : null}
      {block.kind === "experience" ? <ExperienceEntry item={block.item} /> : null}
      {block.kind === "project" ? <ProjectEntry item={block.item} /> : null}
      {block.kind === "reference" ? <ReferenceBlock items={block.item.items} /> : null}
      {block.kind === "text" ? <Paragraphs value={block.item.text} /> : null}
    </section>
  );
}

function buildBlocks({ summary, experience, projects, references, customSections }) {
  const blocks = [];
  if (hasText(summary)) splitText(summary, 780).forEach((text, index) => blocks.push(makeBlock("Profile", "profile", { text }, index === 0)));
  experience.forEach((item, index) => blocks.push(makeBlock("Work Experience", "experience", item, index === 0)));
  projects.forEach((item, index) => blocks.push(makeBlock("Projects", "project", item, index === 0)));
  customSections.forEach((section) => {
    const title = clean(section.title);
    (section.items || []).filter(hasText).forEach((text, index) => blocks.push(makeBlock(title, "text", { text }, index === 0)));
  });
  if (references.length) blocks.push(makeBlock("Reference", "reference", { items: references }, true));
  return blocks;
}

function Page({ data, blocks, pageIndex }) {
  const firstPage = pageIndex === 0;
  return (
    <div
      data-resume-page="true"
      style={{
        position: "relative",
        width: "210mm",
        minHeight: "297mm",
        overflow: "hidden",
        background: `linear-gradient(to right, ${MAIN_BG} 0, ${MAIN_BG} 8mm, ${SIDEBAR_BG} 8mm, ${SIDEBAR_BG} 72mm, ${MAIN_BG} 72mm, ${MAIN_BG} 100%)`,
        color: PRIMARY_TEXT,
        fontFamily: FONT,
        boxSizing: "border-box",
        pageBreakAfter: "always"
      }}
    >
      {firstPage ? <Header data={data} /> : null}
      <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "64mm 1fr", columnGap: "9mm", paddingLeft: "8mm", paddingRight: "13mm", paddingTop: firstPage ? "0" : "17mm", paddingBottom: "14mm" }}>
        <Sidebar data={data} pageIndex={pageIndex} />
        <main style={{ paddingTop: firstPage ? "67mm" : "0" }}>{blocks.map((block, index) => <Block key={`${block.section}-${block.kind}-${index}`} block={block} />)}</main>
      </div>
    </div>
  );
}

export default function ModernProfessionalThreePreview({
  data,
  accentColor = DARK,
  headerBgColor = DARK,
  sidebarBgColor = SIDE,
  mainBgColor = WHITE,
  primaryTextColor = INK,
  mutedTextColor = MUTED,
  inverseTextColor = WHITE
}) {
  const experience = getMeaningfulExperience(data?.experience);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
  const references = parseReferenceItems(data?.additional);
  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });
  const pages = paginate(buildBlocks({ summary: data?.summary?.text || "", experience, projects, references, customSections }));

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
      {pages.map((blocks, index) => <Page key={`modernpro3-${index}`} data={data} blocks={blocks} pageIndex={index} />)}
    </div>
  );
}
