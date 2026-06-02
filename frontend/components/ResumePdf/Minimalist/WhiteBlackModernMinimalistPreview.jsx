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
  sanitizeRichHtml,
  splitBullets,
  splitByCommaOrLine
} from "../common/previewUtils.js";

const DARK = "#272929";
const INK = "#3d3d3d";
const HEADING = "#272727";
const MUTED = "#737373";
const WHITE = "#ffffff";

function clean(value) {
  return extractPlainText(value).replace(/\s+/g, " ").trim();
}

function dateRange(startDate, endDate, isCurrent) {
  return formatDateRange(startDate, endDate, isCurrent);
}

function ContactLine({ icon: Icon, value }) {
  if (!hasText(value)) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: "14px", alignItems: "start" }}>
      <Icon style={{ color: WHITE, fontSize: "12px", marginTop: "2px" }} />
      <p style={{ margin: 0, color: WHITE, fontSize: "11.6px", lineHeight: 1.35, wordBreak: "break-word" }}>
        {value}
      </p>
    </div>
  );
}

function SidebarHeading({ children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          margin: 0,
          color: WHITE,
          fontSize: "18px",
          fontWeight: 800,
          lineHeight: 1.1,
          textTransform: "uppercase",
          letterSpacing: 0
        }}
      >
        {children}
      </h2>
      <div style={{ height: "1px", background: WHITE, marginTop: "17px", width: "100%" }} />
    </div>
  );
}

function SidebarSection({ title, children, marginTop = "0" }) {
  if (!children) return null;
  return (
    <section style={{ marginTop, breakInside: "avoid" }}>
      <SidebarHeading>{title}</SidebarHeading>
      {children}
    </section>
  );
}

function MainHeading({ children }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <h2
        style={{
          margin: 0,
          color: HEADING,
          fontSize: "18px",
          fontWeight: 800,
          lineHeight: 1.1,
          textTransform: "uppercase",
          letterSpacing: 0
        }}
      >
        {children}
      </h2>
      <div style={{ height: "1px", background: HEADING, marginTop: "17px", width: "100%" }} />
    </div>
  );
}

function RichText({ value, size = "10.6px", color = MUTED, lineHeight = 1.42 }) {
  if (!hasText(value)) return null;
  if (hasHtmlMarkup(value)) {
    return (
      <div
        style={{ color, fontSize: size, lineHeight }}
        className="[&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1 [&_p]:mb-1"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }
  return <p style={{ margin: 0, color, fontSize: size, lineHeight }}>{clean(value)}</p>;
}

function EducationList({ educations }) {
  if (!educations.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {educations.map((edu, index) => {
        const date = dateRange(edu.startDate, edu.endDate, edu.currentlyStudying);
        const course = [edu.degree, edu.fieldOfStudy].filter(hasText).join(" - ");
        return (
          <article key={`wb-edu-${index}`} style={{ breakInside: "avoid" }}>
            {course ? (
              <p
                style={{
                  margin: "0 0 3px",
                  color: WHITE,
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: 1.2
                }}
              >
                {course}
              </p>
            ) : null}
            {hasText(edu.institution) ? (
              <p style={{ margin: "0 0 1px", color: WHITE, fontSize: "12.3px", lineHeight: 1.25 }}>
                {clean(edu.institution)}
              </p>
            ) : null}
            {date ? <p style={{ margin: 0, color: WHITE, fontSize: "11.5px", lineHeight: 1.25 }}>{date}</p> : null}
          </article>
        );
      })}
    </div>
  );
}

function SkillList({ items }) {
  const filtered = items.filter(hasText);
  if (!filtered.length) return null;
  return (
    <ul
      style={{
        margin: 0,
        padding: "0 0 0 15px",
        color: WHITE,
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      {filtered.map((item, index) => (
        <li key={`${item}-${index}`} style={{ paddingLeft: "6px", fontSize: "11.8px", lineHeight: 1.2 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ExperienceList({ experiences }) {
  if (!experiences.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "21px" }}>
      {experiences.map((exp, index) => {
        const date = dateRange(exp.startDate, exp.endDate, exp.currentlyWorking);
        const company = [exp.employer, exp.city, exp.country].filter(hasText).join(" | ");
        const bullets = splitBullets(exp.bullets || "");
        return (
          <article key={`wb-exp-${index}`} style={{ breakInside: "avoid" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "baseline" }}>
              {hasText(exp.jobTitle) ? (
                <p style={{ margin: 0, color: INK, fontSize: "13px", fontWeight: 400, lineHeight: 1.25 }}>
                  {clean(exp.jobTitle)}
                </p>
              ) : <span />}
              {date ? (
                <p style={{ margin: 0, color: INK, fontSize: "13px", fontWeight: 400, lineHeight: 1.25, whiteSpace: "nowrap" }}>
                  {date}
                </p>
              ) : null}
            </div>
            {company ? (
              <p style={{ margin: "3px 0 8px", color: INK, fontSize: "12px", fontWeight: 800, lineHeight: 1.25 }}>
                {company}
              </p>
            ) : null}
            {hasHtmlMarkup(exp.bullets) ? (
              <RichText value={exp.bullets} />
            ) : bullets.length ? (
              <p style={{ margin: 0, color: MUTED, fontSize: "10.5px", lineHeight: 1.42 }}>
                {bullets.join(" ")}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function parseProject(item) {
  const [name = "", type = "", year = "", description = ""] = String(item || "").split("|").map((part) => part.trim());
  if (!type && !year && !description) return { name: clean(item), meta: "", description: "" };
  return { name, meta: [type, year].filter(Boolean).join(" / "), description };
}

function parseReferences(additional) {
  const section = getSectionByTitle(additional, "References");
  return (section?.items || [])
    .filter(hasText)
    .map((item) => {
      const [name = "", role = "", phone = "", email = ""] = String(item).split("|").map((part) => part.trim());
      return { name, role, phone, email };
    })
    .filter((item) => item.name || item.role || item.phone || item.email);
}

function MainSection({ title, children }) {
  if (!children) return null;
  return (
    <section style={{ marginTop: "24px", breakInside: "avoid" }}>
      <MainHeading>{title}</MainHeading>
      {children}
    </section>
  );
}

export default function WhiteBlackModernMinimalistPreview({ data }) {
  const fullName = clean(data?.header?.fullName) || "Your Name";
  const headline = clean(data?.header?.headline);
  const photo = data?.header?.photo || "";
  const phone = clean(data?.header?.phone);
  const email = clean(data?.header?.email);
  const location = clean(data?.header?.location);
  const linkedin = clean(data?.additional?.linkedin);
  const portfolio = clean(data?.additional?.portfolio);
  const summary = data?.summary?.text || "";
  const educations = getMeaningfulEducation(data?.education);
  const experiences = getMeaningfulExperience(data?.experience);
  const skills = splitByCommaOrLine(data?.skills?.primarySkills || "");
  const certifications = (getSectionByTitle(data?.additional, "Certifications & Licenses")?.items || []).filter(hasText);
  const languages = (getSectionByTitle(data?.additional, "Languages")?.items || []).filter(hasText);
  const projects = (getSectionByTitle(data?.additional, "Projects")?.items || []).filter(hasText).map(parseProject);
  const references = parseReferences(data?.additional);

  const excluded = new Set(["projects", "references", "certifications & licenses", "languages"]);
  const customSections = getAdditionalSections(data?.additional).filter((section) => {
    const title = clean(section?.title).toLowerCase();
    return title && !excluded.has(title) && Array.isArray(section?.items) && section.items.some(hasText);
  });

  return (
    <div
      data-resume-page="true"
      style={{
        width: "210mm",
        minHeight: "297mm",
        position: "relative",
        background: WHITE,
        color: INK,
        fontFamily: "'Poppins', 'Manrope', Arial, sans-serif",
        fontSize: "11px",
        lineHeight: 1.4,
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "11mm",
          top: "11.4mm",
          width: "61.4mm",
          height: "61.4mm",
          borderRadius: "50%",
          overflow: "hidden",
          background: "#e8e8e4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999999",
          fontSize: "40px",
          fontWeight: 800
        }}
      >
        {photo ? (
          <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          fullName.charAt(0).toUpperCase()
        )}
      </div>

      <header
        style={{
          position: "absolute",
          left: "85.9mm",
          top: "49.6mm",
          right: "10mm"
        }}
      >
        <h1
          style={{
            margin: 0,
            color: INK,
            fontSize: "40px",
            fontWeight: 800,
            lineHeight: 0.96,
            letterSpacing: 0,
            wordBreak: "break-word"
          }}
        >
          {fullName}
        </h1>
        {headline ? (
          <p style={{ margin: "9px 0 0", color: MUTED, fontSize: "19px", fontWeight: 500, lineHeight: 1.1 }}>
            {headline}
          </p>
        ) : null}
      </header>

      <aside
        style={{
          position: "absolute",
          left: "11mm",
          top: "64.9mm",
          width: "64.8mm",
          minHeight: "221.2mm",
          background: DARK,
          color: WHITE,
          padding: "13.3mm 13mm 12mm",
          boxSizing: "border-box"
        }}
      >
        <SidebarSection title="Contact">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <ContactLine icon={FaPhone} value={phone} />
            <ContactLine icon={FaEnvelope} value={email} />
            <ContactLine icon={FaGlobe} value={portfolio || linkedin} />
            <ContactLine icon={FaLocationDot} value={location} />
          </div>
        </SidebarSection>

        {educations.length ? (
          <SidebarSection title="Education" marginTop="45px">
            <EducationList educations={educations} />
          </SidebarSection>
        ) : null}

        {skills.length ? (
          <SidebarSection title="Expertis" marginTop="35px">
            <SkillList items={skills} />
          </SidebarSection>
        ) : null}

        {certifications.length ? (
          <SidebarSection title="Certificates" marginTop="28px">
            <SkillList items={certifications} />
          </SidebarSection>
        ) : null}

        {languages.length ? (
          <SidebarSection title="Languages" marginTop="28px">
            <SkillList items={languages} />
          </SidebarSection>
        ) : null}
      </aside>

      <main
        style={{
          position: "absolute",
          left: "85.9mm",
          top: headline.length > 38 ? "92mm" : "83mm",
          right: "10mm",
          bottom: "11mm",
          overflow: "hidden"
        }}
      >
        {hasText(summary) ? (
          <section style={{ breakInside: "avoid" }}>
            <MainHeading>Profile Summary</MainHeading>
            <RichText value={summary} />
          </section>
        ) : null}

        {experiences.length ? (
          <MainSection title="Work Experience">
            <ExperienceList experiences={experiences} />
          </MainSection>
        ) : null}

        {projects.length ? (
          <MainSection title="Projects">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {projects.map((project, index) => (
                <article key={`wb-project-${index}`} style={{ breakInside: "avoid" }}>
                  <p style={{ margin: "0 0 2px", color: INK, fontSize: "12px", fontWeight: 800, lineHeight: 1.2 }}>
                    {project.name}
                  </p>
                  {project.meta ? (
                    <p style={{ margin: "0 0 5px", color: INK, fontSize: "11px", lineHeight: 1.25 }}>
                      {project.meta}
                    </p>
                  ) : null}
                  <RichText value={project.description} />
                </article>
              ))}
            </div>
          </MainSection>
        ) : null}

        {customSections.map((section) => (
          <MainSection key={section.id || section.title} title={section.title}>
            <ul style={{ margin: 0, padding: "0 0 0 16px", color: MUTED }}>
              {section.items.filter(hasText).map((item, index) => (
                <li key={`${item}-${index}`} style={{ marginBottom: "5px", fontSize: "10.6px", lineHeight: 1.42 }}>
                  {clean(item)}
                </li>
              ))}
            </ul>
          </MainSection>
        ))}

        {references.length ? (
          <MainSection title="References">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
              {references.map((ref, index) => (
                <article key={`wb-ref-${index}`} style={{ minWidth: 0, breakInside: "avoid" }}>
                  {ref.name ? <p style={{ margin: "0 0 3px", color: INK, fontSize: "12px", fontWeight: 800 }}>{ref.name}</p> : null}
                  {ref.role ? <p style={{ margin: "0 0 6px", color: INK, fontSize: "10.5px" }}>{ref.role}</p> : null}
                  {ref.phone ? <p style={{ margin: "0 0 3px", color: INK, fontSize: "9.5px" }}><strong>Phone:</strong> {ref.phone}</p> : null}
                  {ref.email ? <p style={{ margin: 0, color: INK, fontSize: "9.5px" }}><strong>Email:</strong> {ref.email}</p> : null}
                </article>
              ))}
            </div>
          </MainSection>
        ) : null}
      </main>
    </div>
  );
}
