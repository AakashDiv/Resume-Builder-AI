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
  splitByCommaOrLine,
  splitDisplayName
} from "../common/previewUtils.js";

const NAVY = "#173b5a";
const DARK_NAVY = "#2f4359";
const BLUE = "#4c91c9";
const INK = "#20272b";
const MUTED = "#555555";
const MAIN = "#ffffff";
const INVERSE = "#ffffff";
const FONT = "Montserrat, Arial, sans-serif";
const HEADER_BG = "var(--resume-header-bg, #173b5a)";
const ACCENT_COLOR = "var(--resume-accent, #173b5a)";
const SIDEBAR_BG = "var(--resume-sidebar-bg, #ffffff)";
const MAIN_BG = "var(--resume-main-bg, #ffffff)";
const PRIMARY_TEXT = "var(--resume-primary-text, #20272b)";
const MUTED_TEXT = "var(--resume-muted-text, #555555)";
const INVERSE_TEXT = "var(--resume-inverse-text, #ffffff)";
const DEFAULT_PHOTO = "/resume-assets/modern-professional-2-photo.png";
const FIRST_PAGE_UNITS = 112;
const NEXT_PAGE_UNITS = 146;

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
  let units = 7;
  if (kind === "profile") units = 8 + textUnits(item.text, 1);
  if (kind === "experience") units = 10 + textUnits(item.bullets, 1);
  if (kind === "project") units = 8 + textUnits(item.description, 1);
  if (kind === "reference") units = 15 + Math.ceil((item.items || []).length / 2) * 9;
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

function Decorations({ firstPage }) {
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: firstPage ? "92mm" : "68mm", height: firstPage ? "33mm" : "17mm", background: DARK_NAVY }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: firstPage ? "119mm" : "140mm", height: firstPage ? "17mm" : "11mm", background: BLUE }} />
      <div style={{ position: "absolute", left: firstPage ? "82mm" : "58mm", top: 0, width: 0, height: 0, borderTop: firstPage ? `33mm solid ${DARK_NAVY}` : `17mm solid ${DARK_NAVY}`, borderRight: firstPage ? "16mm solid transparent" : "10mm solid transparent" }} />
      <div style={{ position: "absolute", left: firstPage ? "83mm" : "64mm", top: firstPage ? "17mm" : "11mm", width: 0, height: 0, borderTop: firstPage ? `16mm solid ${NAVY}` : `8mm solid ${NAVY}`, borderLeft: firstPage ? "10mm solid transparent" : "6mm solid transparent" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "155mm", height: "4.5mm", background: BLUE }} />
      <div style={{ position: "absolute", right: 0, bottom: 0, width: "34mm", height: "12mm", background: DARK_NAVY }} />
      <div style={{ position: "absolute", right: "34mm", bottom: 0, width: 0, height: 0, borderBottom: `12mm solid ${DARK_NAVY}`, borderLeft: "7mm solid transparent" }} />
    </>
  );
}

function Header({ data }) {
  const name = splitDisplayName(data?.header?.fullName || "Your Name");
  const photo = String(data?.header?.photo || "").trim() || DEFAULT_PHOTO;
  return (
    <>
      <img src={photo} alt="" style={{ position: "absolute", left: "16mm", top: "21mm", width: "44mm", height: "44mm", borderRadius: "50%", objectFit: "cover", objectPosition: "center top", border: "4px solid #ffffff", zIndex: 2 }} />
      <header style={{ position: "relative", zIndex: 1, marginLeft: "74mm", paddingTop: "37mm", height: "77mm" }}>
        <h1 style={{ margin: 0, color: MUTED_TEXT, fontSize: "30px", lineHeight: 1.1, fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase" }}>
          <span>{name.primary || "Your"}</span>
          {name.secondary ? <span style={{ color: HEADER_BG, fontWeight: 400, marginLeft: "9px" }}>{name.secondary}</span> : null}
        </h1>
        {hasText(data?.header?.headline) ? <p style={{ margin: "8px 0 0", color: MUTED_TEXT, fontSize: "20px", lineHeight: 1.2, fontWeight: 400, textTransform: "uppercase" }}>{clean(data.header.headline)}</p> : null}
        <div style={{ width: "22mm", height: "1.3mm", background: ACCENT_COLOR, marginTop: "9px" }} />
      </header>
    </>
  );
}

function SideTitle({ title }) {
  return (
    <div style={{ marginBottom: "11px" }}>
      <h2 style={{ margin: 0, color: PRIMARY_TEXT, fontSize: "17px", lineHeight: 1, fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase" }}>{title}</h2>
      <div style={{ height: "1px", background: PRIMARY_TEXT, marginTop: "9px" }} />
    </div>
  );
}

function ContactRow({ icon, text }) {
  if (!hasText(text)) return null;
  return (
    <p style={{ margin: "0 0 12px", display: "grid", gridTemplateColumns: "15px 1fr", gap: "8px", alignItems: "center", color: PRIMARY_TEXT, fontSize: "12px", lineHeight: 1.2 }}>
      <span style={{ color: PRIMARY_TEXT, fontSize: "12px" }}>{icon}</span>
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
    <aside style={{ background: SIDEBAR_BG, padding: pageIndex === 0 ? "0 8mm 0 14mm" : "0 8mm 0 14mm" }}>
      {pageIndex === 0 ? (
        <section style={{ marginBottom: "26px" }}>
          <SideTitle title="Contact" />
          <ContactRow icon={<FaPhone />} text={data?.header?.phone} />
          <ContactRow icon={<FaEnvelope />} text={data?.header?.email} />
          <ContactRow icon={<FaLocationDot />} text={data?.header?.location} />
          <ContactRow icon={<FaGlobe />} text={website} />
        </section>
      ) : null}

      {education.length ? (
        <section style={{ marginBottom: "26px" }}>
          <SideTitle title="Education" />
          {education.map((item, index) => (
            <article key={`edu-${index}`} style={{ marginBottom: "18px", breakInside: "avoid" }}>
              <p style={{ margin: "0 0 5px", color: PRIMARY_TEXT, fontSize: "12px", fontWeight: 800, letterSpacing: "1.8px" }}>{dateRange(item.startDate, item.endDate, item.currentlyStudying)}</p>
              {hasText(item.institution) ? <p style={{ margin: "0 0 7px", color: PRIMARY_TEXT, fontSize: "11.5px", fontWeight: 800, textTransform: "uppercase" }}>{clean(item.institution)}</p> : null}
              {[item.degree, item.fieldOfStudy, item.details].filter(hasText).map((text, textIndex) => (
                <p key={`${text}-${textIndex}`} style={{ margin: "0 0 4px", color: PRIMARY_TEXT, fontSize: "11.5px", lineHeight: 1.25 }}>{textIndex === 0 ? "• " : "• "}{clean(text)}</p>
              ))}
            </article>
          ))}
        </section>
      ) : null}

      {skills.length ? (
        <section style={{ marginBottom: "26px" }}>
          <SideTitle title="Skills" />
          <ul style={{ margin: 0, padding: "0 0 0 12px", color: PRIMARY_TEXT }}>
            {skills.map((skill, index) => <li key={`${skill}-${index}`} style={{ margin: "0 0 8px", fontSize: "11.5px", lineHeight: 1.2 }}>{clean(skill)}</li>)}
          </ul>
        </section>
      ) : null}

      {languages.length ? (
        <section>
          <SideTitle title="Languages" />
          <ul style={{ margin: 0, padding: "0 0 0 12px", color: PRIMARY_TEXT }}>
            {languages.map((language, index) => <li key={`${language}-${index}`} style={{ margin: "0 0 6px", fontSize: "11.5px", lineHeight: 1.2 }}>{clean(language)}</li>)}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}

function SectionTitle({ title }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <h2 style={{ margin: 0, color: HEADER_BG, fontSize: "17px", lineHeight: 1, fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase" }}>{title}</h2>
      <div style={{ height: "1.2px", background: ACCENT_COLOR, marginTop: "9px" }} />
    </div>
  );
}

function Paragraphs({ value, items }) {
  if (hasHtmlMarkup(value)) {
    return <div style={{ color: MUTED_TEXT, fontSize: "11.5px", lineHeight: 1.42, textAlign: "justify" }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }} />;
  }
  const lines = items || splitText(value || "");
  return (
    <div style={{ color: MUTED_TEXT, fontSize: "11.5px", lineHeight: 1.42, textAlign: "justify" }}>
      {lines.filter(hasText).map((line, index) => <p key={`${line}-${index}`} style={{ margin: index ? "6px 0 0" : 0 }}>{clean(line)}</p>)}
    </div>
  );
}

function BulletList({ value }) {
  const bullets = splitBullets(value || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", color: MUTED_TEXT }}>
      {bullets.map((bullet, index) => <li key={`${bullet}-${index}`} style={{ margin: "0 0 4px", fontSize: "11.3px", lineHeight: 1.32, textAlign: "justify" }}>{clean(bullet)}</li>)}
    </ul>
  );
}

function ExperienceEntry({ item, showNode }) {
  return (
    <article style={{ position: "relative", paddingLeft: "9mm" }}>
      {showNode ? <span style={{ position: "absolute", left: "-1.25mm", top: "2px", width: "2.5mm", height: "2.5mm", borderRadius: "50%", background: ACCENT_COLOR }} /> : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "baseline" }}>
        <div>
          <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "12px", fontWeight: 800 }}>{clean(item.employer) || clean(item.jobTitle)}</p>
          {hasText(item.jobTitle) ? <p style={{ margin: "3px 0 0", color: MUTED_TEXT, fontSize: "11.5px" }}>{clean(item.jobTitle)}</p> : null}
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
        <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "12px", fontWeight: 800 }}>{item.name}</p>
        {item.year ? <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "11px" }}>{item.year}</p> : null}
      </div>
      {item.type ? <p style={{ margin: "3px 0 0", color: MUTED_TEXT, fontSize: "11px" }}>{item.type}</p> : null}
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
          {item.name ? <p style={{ margin: 0, color: MUTED_TEXT, fontSize: "13px", fontWeight: 800 }}>{item.name}</p> : null}
          {item.role ? <p style={{ margin: "7px 0 0", color: MUTED_TEXT, fontSize: "12px" }}>{item.role}</p> : null}
          {item.phone ? <p style={{ margin: "7px 0 0", color: MUTED_TEXT, fontSize: "10.5px" }}><strong>Phone:</strong> {item.phone}</p> : null}
          {item.email ? <p style={{ margin: "5px 0 0", color: MUTED_TEXT, fontSize: "10.5px" }}><strong>Email :</strong> {item.email}</p> : null}
        </article>
      ))}
    </div>
  );
}

function Block({ block, index }) {
  const isExperience = block.kind === "experience";
  return (
    <section style={{ position: "relative", marginTop: block.showTitle ? "18px" : "16px", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} /> : null}
      {isExperience ? <div style={{ position: "absolute", left: "1.1mm", top: block.showTitle ? "34px" : 0, bottom: "-8px", width: "1px", background: ACCENT_COLOR }} /> : null}
      {block.kind === "profile" ? <Paragraphs value={block.item.text} /> : null}
      {block.kind === "experience" ? <ExperienceEntry item={block.item} showNode={index > -1} /> : null}
      {block.kind === "project" ? <ProjectEntry item={block.item} /> : null}
      {block.kind === "reference" ? <ReferenceBlock items={block.item.items} /> : null}
      {block.kind === "text" ? <Paragraphs value={block.item.text} /> : null}
    </section>
  );
}

function buildBlocks({ summary, experience, projects, references, customSections }) {
  const blocks = [];
  if (hasText(summary)) splitText(summary, 760).forEach((text, index) => blocks.push(makeBlock("Profile", "profile", { text }, index === 0)));
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
    <div data-resume-page="true" style={{ position: "relative", width: "210mm", minHeight: "297mm", overflow: "hidden", background: MAIN_BG, color: PRIMARY_TEXT, fontFamily: FONT, boxSizing: "border-box", pageBreakAfter: "always" }}>
      <Decorations firstPage={firstPage} />
      {firstPage ? <Header data={data} /> : null}
      <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "65mm 1fr", columnGap: "10mm", paddingRight: "13mm", paddingTop: firstPage ? "2mm" : "25mm", paddingBottom: "20mm" }}>
        <Sidebar data={data} pageIndex={pageIndex} />
        <main style={{ background: MAIN_BG, paddingTop: firstPage ? 0 : 0 }}>{blocks.map((block, index) => <Block key={`${block.section}-${block.kind}-${index}`} block={block} index={index} />)}</main>
      </div>
    </div>
  );
}

export default function ModernProfessionalTwoPreview({
  data,
  accentColor = NAVY,
  headerBgColor = NAVY,
  sidebarBgColor = MAIN,
  mainBgColor = MAIN,
  primaryTextColor = INK,
  mutedTextColor = MUTED,
  inverseTextColor = INVERSE
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
      {pages.map((blocks, index) => <Page key={`modernpro2-${index}`} data={data} blocks={blocks} pageIndex={index} />)}
    </div>
  );
}
