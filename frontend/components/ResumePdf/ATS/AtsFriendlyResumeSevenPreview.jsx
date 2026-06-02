import {
  FaCalendar,
  FaCodeBranch,
  FaEnvelope,
  FaGithub,
  FaGlobe,
  FaGraduationCap,
  FaLocationDot,
  FaMicrophone,
  FaTwitter
} from "react-icons/fa6";
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

const INK = "#31343a";
const BODY = "#55575c";
const BLUE = "#2562a0";
const LINK = "#0d8bff";
const BAND = "#d9edff";
const RULE = "#eef1f4";
const FIRST_LEFT_UNITS = 92;
const FIRST_RIGHT_UNITS = 76;
const NEXT_LEFT_UNITS = 112;
const NEXT_RIGHT_UNITS = 94;

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

function splitText(value, maxChars = 620) {
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

function makeBlock(section, kind, item, showTitle = false, side = "left") {
  let contentUnits = 6;
  if (kind === "experience") contentUnits = 8 + textUnits(item.bullets, 1);
  if (kind === "project") contentUnits = 7 + textUnits(item.description, 1);
  if (kind === "education") contentUnits = 8 + textUnits(item.details, 0);
  if (kind === "text") contentUnits = 4 + textUnits(item.text, 0);
  if (kind === "skills") contentUnits = 6 + Math.ceil((item.items || []).length / 2) * 3;
  return {
    section,
    kind,
    item,
    showTitle,
    side,
    units: (showTitle ? 7 : 0) + contentUnits
  };
}

function paginate(leftBlocks, rightBlocks) {
  const pages = [];
  let leftIndex = 0;
  let rightIndex = 0;
  let pageIndex = 0;

  while (leftIndex < leftBlocks.length || rightIndex < rightBlocks.length || !pages.length) {
    const leftCapacity = pageIndex === 0 ? FIRST_LEFT_UNITS : NEXT_LEFT_UNITS;
    const rightCapacity = pageIndex === 0 ? FIRST_RIGHT_UNITS : NEXT_RIGHT_UNITS;
    const left = [];
    const right = [];
    let leftUsed = 0;
    let rightUsed = 0;

    while (leftIndex < leftBlocks.length && (!left.length || leftUsed + leftBlocks[leftIndex].units <= leftCapacity)) {
      left.push(leftBlocks[leftIndex]);
      leftUsed += leftBlocks[leftIndex].units;
      leftIndex += 1;
    }

    while (rightIndex < rightBlocks.length && (!right.length || rightUsed + rightBlocks[rightIndex].units <= rightCapacity)) {
      right.push(rightBlocks[rightIndex]);
      rightUsed += rightBlocks[rightIndex].units;
      rightIndex += 1;
    }

    pages.push({ left, right });
    pageIndex += 1;
  }

  return pages;
}

function Header({ data }) {
  const fullName = clean(data?.header?.fullName) || "Saurabh Daware";
  const headline = clean(data?.header?.headline) || "Professional Title";
  const email = clean(data?.header?.email);
  const phone = clean(data?.header?.phone);
  const location = clean(data?.header?.location);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);

  return (
    <header style={{ background: BAND, margin: "-14mm -14mm 16mm", padding: "13mm 14mm 10mm" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "18px", alignItems: "start" }}>
        <div>
          <h1 style={{ margin: 0, color: "#282b30", fontSize: "36px", fontWeight: 500, lineHeight: 1.05, letterSpacing: 0 }}>
            {fullName}
          </h1>
          {headline ? (
            <p style={{ margin: "7px 0 0", color: "#4a4f58", fontSize: "20px", lineHeight: 1.15 }}>
              # {headline}
            </p>
          ) : null}
        </div>
        <div style={{ color: "#4a4f58", fontSize: "11.5px", lineHeight: 1.5, minWidth: "56mm" }}>
          {location ? <ContactLine icon={<FaLocationDot />} text={location} /> : null}
          {email ? <ContactLine icon={<FaEnvelope />} text={email} /> : null}
          {phone ? <ContactLine icon={<FaGlobe />} text={phone} /> : null}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "11px", color: "#4a4f58", fontSize: "10.5px" }}>
        {portfolio ? <InlineContact icon={<FaGlobe />} text={portfolio} /> : null}
        {linkedin ? <InlineContact icon={<FaGithub />} text={linkedin} /> : null}
        {email ? <InlineContact icon={<FaTwitter />} text={email.split("@")[0]} /> : null}
      </div>
    </header>
  );
}

function ContactLine({ icon, text }) {
  return (
    <p style={{ margin: "0 0 5px", display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ width: "12px", color: "#44484f", display: "inline-flex" }}>{icon}</span>
      <span>{text}</span>
    </p>
  );
}

function InlineContact({ icon, text }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
      <span style={{ color: "#44484f", display: "inline-flex" }}>{icon}</span>
      <span>{text}</span>
    </span>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 style={{ margin: "0 0 12px", color: BLUE, fontSize: "13px", fontWeight: 500, lineHeight: 1.2 }}>
      {title}
    </h2>
  );
}

function Paragraphs({ value, items }) {
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color: BODY, fontSize: "10.8px", lineHeight: 1.55 }}
        className="[&_ul]:my-0 [&_ul]:pl-5 [&_li]:mb-1 [&_p]:mb-2"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  const lines = items || splitText(value || "");
  if (!lines.length) return null;
  return (
    <div style={{ color: BODY, fontSize: "10.8px", lineHeight: 1.55 }}>
      {lines.filter(hasText).map((item, index) => (
        <p key={`${item}-${index}`} style={{ margin: index ? "7px 0 0" : 0 }}>
          {clean(item)}
        </p>
      ))}
    </div>
  );
}

function BulletText({ value }) {
  const bullets = splitBullets(value || "");
  if (!bullets.length) return null;
  return (
    <ul style={{ margin: "7px 0 0", padding: "0 0 0 15px", color: BODY }}>
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} style={{ margin: "0 0 6px", paddingLeft: "3px", fontSize: "10.6px", lineHeight: 1.5 }}>
          {clean(bullet)}
        </li>
      ))}
    </ul>
  );
}

function EntryHeader({ title, subtitle, date, icon }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: icon ? "18px 1fr" : "1fr", gap: "8px", alignItems: "start" }}>
      {icon ? <span style={{ color: LINK, fontSize: "15px", lineHeight: 1.2 }}>{icon}</span> : null}
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <p style={{ margin: 0, color: INK, fontSize: "10.8px", fontWeight: 800, lineHeight: 1.25 }}>{title}</p>
          {date ? (
            <p style={{ margin: 0, color: BODY, fontSize: "10.2px", lineHeight: 1.25, display: "inline-flex", gap: "5px", alignItems: "center" }}>
              <FaCalendar /> {date}
            </p>
          ) : null}
        </div>
        {subtitle ? <p style={{ margin: "3px 0 0", color: BODY, fontSize: "10.6px", lineHeight: 1.25 }}>{subtitle}</p> : null}
      </div>
    </div>
  );
}

function ExperienceEntry({ item }) {
  return (
    <article>
      <EntryHeader
        icon={<FaGlobe />}
        title={[clean(item.jobTitle), clean(item.employer)].filter(Boolean).join(", ") || "Experience"}
        subtitle={[item.city, item.country].filter(hasText).join(", ")}
        date={dateRange(item.startDate, item.endDate, item.currentlyWorking)}
      />
      <div style={{ marginLeft: "26px" }}>
        <BulletText value={item.bullets} />
      </div>
    </article>
  );
}

function EducationEntry({ item }) {
  const degree = [item.degree, item.fieldOfStudy].filter(hasText).join(" in ");
  return (
    <article>
      <EntryHeader
        icon={<FaGraduationCap />}
        title={degree || clean(item.institution) || "Education"}
        subtitle={clean(item.institution)}
        date={dateRange(item.startDate, item.endDate, item.currentlyStudying)}
      />
      {hasText(item.details) ? <p style={{ margin: "5px 0 0 26px", color: BODY, fontSize: "10.4px", lineHeight: 1.35 }}>{clean(item.details)}</p> : null}
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
    <article>
      <EntryHeader title={item.name || "Project"} subtitle={item.tech} date={item.date} />
      {hasText(item.description) ? <BulletText value={item.description} /> : null}
    </article>
  );
}

function TextBlock({ item }) {
  return <Paragraphs value={item.text} items={item.items} />;
}

function SkillsBlock({ item }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
      {item.items.map((skill, index) => (
        <p key={`${skill}-${index}`} style={{ margin: 0, color: BODY, fontSize: "10.5px", lineHeight: 1.3 }}>
          {clean(skill)}
        </p>
      ))}
    </div>
  );
}

function Block({ block }) {
  return (
    <section style={{ marginTop: block.showTitle ? "16px" : "15px", breakInside: "avoid" }}>
      {block.showTitle ? <SectionTitle title={block.section} /> : null}
      {block.kind === "summary" ? <TextBlock item={block.item} /> : null}
      {block.kind === "experience" ? <ExperienceEntry item={block.item} /> : null}
      {block.kind === "project" ? <ProjectEntry item={block.item} /> : null}
      {block.kind === "education" ? <EducationEntry item={block.item} /> : null}
      {block.kind === "text" ? <TextBlock item={block.item} /> : null}
      {block.kind === "skills" ? <SkillsBlock item={block.item} /> : null}
    </section>
  );
}

function buildBlocks({ summary, experiences, projects, education, skills, certs, languages, customSections, socials }) {
  const left = [];
  const right = [];

  if (hasText(summary)) {
    splitText(summary, 900).forEach((text, index) => left.push(makeBlock("Summary", "summary", { text }, index === 0)));
  }
  experiences.forEach((item, index) => left.push(makeBlock("Work Experience", "experience", item, index === 0)));
  projects.forEach((item, index) => left.push(makeBlock("Projects", "project", item, index === 0)));

  const achievementSections = customSections.filter((section) => /achieve|award|talk|open|contribution|leadership|activity/i.test(section.title || ""));
  const otherSections = customSections.filter((section) => !achievementSections.includes(section));
  achievementSections.forEach((section) => {
    (section.items || []).filter(hasText).forEach((text, index) => {
      right.push(makeBlock(clean(section.title), "text", { text }, index === 0, "right"));
    });
  });

  const skillItems = [...skills, ...certs.map((item) => `Certification: ${clean(item)}`), ...languages.map((item) => `Language: ${clean(item)}`), ...socials];
  if (skillItems.length) right.push(makeBlock("Technical Skills", "skills", { items: skillItems }, true, "right"));
  education.forEach((item, index) => right.push(makeBlock("Education", "education", item, index === 0, "right")));

  otherSections.forEach((section) => {
    (section.items || []).filter(hasText).forEach((text, index) => {
      left.push(makeBlock(clean(section.title), "text", { text }, index === 0));
    });
  });

  return { left, right };
}

function Page({ page, index, data }) {
  return (
    <div
      data-resume-page="true"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        color: INK,
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        padding: "14mm",
        overflow: "hidden",
        pageBreakAfter: "always"
      }}
    >
      {index === 0 ? <Header data={data} /> : null}
      <main style={{ display: "grid", gridTemplateColumns: "1fr 62mm", gap: "12mm", alignItems: "start" }}>
        <div>
          {page.left.map((block, blockIndex) => (
            <Block key={`left-${index}-${blockIndex}`} block={block} />
          ))}
        </div>
        <aside style={{ borderLeft: `1px solid ${RULE}`, paddingLeft: "8mm" }}>
          {page.right.map((block, blockIndex) => (
            <Block key={`right-${index}-${blockIndex}`} block={block} />
          ))}
        </aside>
      </main>
    </div>
  );
}

export default function AtsFriendlyResumeSevenPreview({ data }) {
  const experiences = getMeaningfulExperience(data?.experience);
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
  const blocks = buildBlocks({
    summary: data?.summary?.text || "",
    experiences,
    projects,
    education,
    skills,
    certs,
    languages,
    customSections,
    socials
  });
  const pages = paginate(blocks.left, blocks.right);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {pages.map((page, index) => (
        <Page key={`ats7-page-${index}`} page={page} index={index} data={data} />
      ))}
    </div>
  );
}
