import {
  formatDateRange,
  getInitials,
  getMeaningfulEducation,
  getMeaningfulExperience,
  getRenderableAdditionalSections,
  getSectionByTitle,
  hasHtmlMarkup,
  hasText,
  parseReferenceItems,
  sanitizeRichHtml,
  splitBullets,
  splitByCommaOrLine,
  splitDisplayName
} from "../common/previewUtils.js";
import { FaEnvelope, FaLocationDot, FaPhone } from "react-icons/fa6";

export default function TechFocusPreview({
  data,
  accentColor = "#c9a96e",
  sidebarBgColor = "#1e2a38",
  mainBgColor = "#f5f1eb",
  primaryTextColor = "#1e2a38",
  mutedTextColor = "#7a7a7a",
  inverseTextColor = "#ffffff"
}) {
  const skills = splitByCommaOrLine(data.skills?.primarySkills || "");
  const education = getMeaningfulEducation(data.education).slice(0, 3);
  const experience = getMeaningfulExperience(data.experience).slice(0, 4);
  const references = parseReferenceItems(data.additional).slice(0, 2);
  const languagesSection = getSectionByTitle(data.additional, "Languages");
  const languages = splitByCommaOrLine((languagesSection?.items || []).join("\n") || data.additional?.languages || "");
  const additionalSections = getRenderableAdditionalSections(data.additional, ["references", "languages"]).slice(0, 2);
  const name = splitDisplayName(data.header?.fullName);
  const initials = getInitials(data.header?.fullName);
  const contactLines = [
    { key: "phone", icon: <FaPhone size={10} />, value: data.header?.phone },
    { key: "email", icon: <FaEnvelope size={10} />, value: data.header?.email },
    { key: "portfolio", icon: null, value: data.additional?.portfolio },
    { key: "location", icon: <FaLocationDot size={10} />, value: data.header?.location }
  ].filter((item) => hasText(item.value));

  return (
    <article data-resume-padding="true" className="h-full w-full overflow-hidden bg-white" style={{ fontFamily: "'DM Sans', Arial, sans-serif", color: primaryTextColor }}>
      <div className="grid h-full w-full grid-cols-[32%,68%]">
        <aside className="relative flex h-full flex-col gap-7 px-6 py-8" style={{ background: sidebarBgColor, color: inverseTextColor }}>
          <div className="mx-auto h-[120px] w-[120px] rounded-full p-[4px]" style={{ background: `linear-gradient(135deg, ${accentColor}, #e8c88a, ${accentColor})` }}>
            <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-slate-200 text-2xl font-bold tracking-[0.08em]" style={{ color: primaryTextColor }}>
              {data.header?.photo ? (
                <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>

          {contactLines.length ? (
            <SidebarSection title="Contact Me" accentColor={accentColor}>
              <div className="space-y-2 text-[11px] leading-relaxed" style={{ color: `${inverseTextColor}D9` }}>
                {contactLines.map((item) => (
                  <p key={item.key} className="inline-flex items-center gap-1">
                    {item.icon}
                    {item.value}
                  </p>
                ))}
              </div>
            </SidebarSection>
          ) : null}

          {education.length ? (
            <SidebarSection title="Education" accentColor={accentColor}>
              <div className="space-y-3">
                {education.map((edu, index) => {
                  const dateRange = formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying);
                  return (
                    <div key={`${edu.degree || edu.institution || "education"}-${index}`} className="space-y-0.5">
                      {hasText(edu.degree) ? <p className="text-[11px]" style={{ color: `${inverseTextColor}E6` }}>{edu.degree}</p> : null}
                      {hasText(edu.institution) ? <p className="text-[10px] font-semibold" style={{ color: accentColor }}>{edu.institution}</p> : null}
                      {dateRange ? <p className="text-[10px]" style={{ color: `${inverseTextColor}80` }}>{dateRange}</p> : null}
                    </div>
                  );
                })}
              </div>
            </SidebarSection>
          ) : null}

          {skills.length ? (
            <SidebarSection title="Skills" accentColor={accentColor}>
              <ul className="space-y-1.5 text-[11px]" style={{ color: `${inverseTextColor}D9` }}>
                {skills.slice(0, 8).map((skill, index) => (
                  <li key={`${skill}-${index}`} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </SidebarSection>
          ) : null}

          {languages.length ? (
            <SidebarSection title="Languages" accentColor={accentColor}>
              <ul className="space-y-1.5 text-[11px]" style={{ color: `${inverseTextColor}D9` }}>
                {languages.slice(0, 6).map((language, index) => (
                  <li key={`${language}-${index}`} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} />
                    <span>{language}</span>
                  </li>
                ))}
              </ul>
            </SidebarSection>
          ) : null}
        </aside>

        <main className="flex h-full flex-col gap-7 px-8 py-9" style={{ background: mainBgColor }}>
          <div>
            <p className="font-serif text-[35px] font-black uppercase leading-none" style={{ color: primaryTextColor }}>
              {name.primary}
            </p>
            {name.secondary ? (
              <p className="mt-1 font-serif text-[30px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedTextColor }}>
                {name.secondary}
              </p>
            ) : null}
            {hasText(data.header?.headline) ? (
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em]" style={{ color: accentColor }}>
                {data.header.headline}
              </p>
            ) : null}
          </div>

          {hasText(data.summary?.text) ? (
            <MainSection title="Professional Summary" primaryTextColor={primaryTextColor} accentColor={accentColor}>
              {hasHtmlMarkup(data.summary.text) ? (
                <div
                  className="text-[10.8px] leading-[1.7] [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                  style={{ color: mutedTextColor }}
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }}
                />
              ) : (
                <p className="text-[10.8px] leading-[1.7]" style={{ color: mutedTextColor }}>{data.summary.text}</p>
              )}
            </MainSection>
          ) : null}

          {experience.length ? (
            <MainSection title="Work Experience" primaryTextColor={primaryTextColor} accentColor={accentColor}>
              <div className="mt-4 space-y-3">
                {experience.map((exp, index) => {
                  const bulletItems = splitBullets(exp.bullets);
                  const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking);
                  const employerLine = [exp.employer, [exp.city, exp.country].filter(hasText).join(", ")].filter(Boolean).join(" - ");
                  return (
                    <div key={`${exp.jobTitle || exp.employer || "experience"}-${index}`} className="border-l-2 border-transparent pl-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[12px] font-semibold" style={{ color: primaryTextColor }}>{exp.jobTitle || exp.employer}</p>
                        {dateRange ? <p className="shrink-0 text-[10px] font-medium tracking-[0.04em]" style={{ color: accentColor }}>{dateRange}</p> : null}
                      </div>
                      {employerLine ? <p className="text-[10.5px] font-medium tracking-[0.04em]" style={{ color: mutedTextColor }}>{employerLine}</p> : null}
                      {hasHtmlMarkup(exp.bullets) ? (
                        <div
                          className="mt-1 text-[10.5px] leading-[1.6] [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                          style={{ color: mutedTextColor }}
                          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
                        />
                      ) : bulletItems.length ? (
                        <ul className="mt-1 space-y-1 text-[10.5px] leading-[1.6]" style={{ color: mutedTextColor }}>
                          {bulletItems.slice(0, 4).map((bullet, bulletIndex) => (
                            <li key={bulletIndex} className="flex gap-2">
                              <span style={{ color: accentColor }}>*</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </MainSection>
          ) : null}

          {references.length ? (
            <MainSection title="References" primaryTextColor={primaryTextColor} accentColor={accentColor}>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {references.map((ref, index) => (
                  <div key={`${ref.name || "reference"}-${index}`} className="rounded-md border bg-white px-3 py-3" style={{ borderColor: `${mutedTextColor}33` }}>
                    {hasText(ref.name) ? <p className="text-[11px] font-bold" style={{ color: primaryTextColor }}>{ref.name}</p> : null}
                    {hasText(ref.role) ? <p className="mt-0.5 text-[10px]" style={{ color: mutedTextColor }}>{ref.role}</p> : null}
                    {hasText(ref.phone) ? <p className="mt-1 text-[10px]" style={{ color: mutedTextColor }}><span className="font-semibold uppercase tracking-[0.06em]" style={{ color: accentColor }}>Phone:</span> {ref.phone}</p> : null}
                    {hasText(ref.email) ? <p className="text-[10px]" style={{ color: mutedTextColor }}><span className="font-semibold uppercase tracking-[0.06em]" style={{ color: accentColor }}>Email:</span> {ref.email}</p> : null}
                  </div>
                ))}
              </div>
            </MainSection>
          ) : null}

          {additionalSections.map((section) => (
            <MainSection key={section.id || section.title} title={section.title || "Additional"} primaryTextColor={primaryTextColor} accentColor={accentColor}>
              <ul className="mt-4 space-y-1 text-[10.5px] leading-[1.6]" style={{ color: mutedTextColor }}>
                {section.items.filter(hasText).slice(0, 5).map((item, index) => (
                  <li key={`${section.title}-${index}`} className="flex gap-2">
                    <span style={{ color: accentColor }}>*</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </MainSection>
          ))}
        </main>
      </div>
    </article>
  );
}

function SidebarSection({ title, accentColor, children }) {
  return (
    <div>
      <p className="border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accentColor, borderColor: `${accentColor}55` }}>
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MainSection({ title, primaryTextColor, accentColor, children }) {
  return (
    <section>
      <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: primaryTextColor }}>
        <span>{title}</span>
        <span className="h-px flex-1" style={{ background: accentColor }} />
      </p>
      {children}
    </section>
  );
}
