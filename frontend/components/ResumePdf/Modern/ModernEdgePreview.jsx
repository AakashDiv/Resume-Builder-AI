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
  splitByCommaOrLine
} from "../common/previewUtils.js";
import { FaBriefcase, FaGraduationCap, FaUserTie } from "react-icons/fa6";

export default function ModernEdgePreview({
  data,
  accentColor = "#4a8fa8",
  headerBgColor = "#1e2d3d",
  sidebarBgColor = "#f4f6f8",
  mainBgColor = "#ffffff",
  primaryTextColor = "#1e2d3d",
  mutedTextColor = "#6b7a8d",
  inverseTextColor = "#ffffff"
}) {
  const skills = splitByCommaOrLine(data.skills?.primarySkills || "");
  const languagesSection = getSectionByTitle(data.additional, "Languages");
  const languages = splitByCommaOrLine((languagesSection?.items || []).join("\n") || data.additional?.languages || "");
  const references = parseReferenceItems(data.additional);
  const experience = getMeaningfulExperience(data.experience).slice(0, 3);
  const education = getMeaningfulEducation(data.education).slice(0, 3);
  const additionalSections = getRenderableAdditionalSections(data.additional, ["languages", "references"]).slice(0, 2);
  const contactLines = [data.header?.phone, data.header?.email, data.header?.location, data.additional?.portfolio].filter(hasText);
  const initials = getInitials(data.header?.fullName);

  return (
    <article data-resume-padding="true" className="h-full w-full overflow-hidden bg-white" style={{ fontFamily: "Barlow, Arial, sans-serif", color: primaryTextColor }}>
      <div className="grid h-full grid-rows-[auto,1fr]">
        <header className="grid grid-cols-[240px,1fr]" style={{ background: headerBgColor }}>
          <div className="flex items-end px-6 pb-4 pt-7">
            <div className="h-[128px] w-[128px] overflow-hidden rounded-full border-4 border-white/20 bg-white/10 shadow-lg">
              {data.header?.photo ? (
                <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover object-top" />
              ) : (
                <div className="grid h-full place-items-center text-3xl font-bold tracking-[0.08em]" style={{ color: inverseTextColor }}>
                  {initials}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-end px-9 pb-6 pt-9">
            <h1 className="font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[40px] font-extrabold uppercase tracking-[0.04em] leading-none" style={{ color: inverseTextColor }}>
              {data.header?.fullName || "Your Name"}
            </h1>
            {hasText(data.header?.headline) ? (
              <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.22em]" style={{ color: `${inverseTextColor}B3` }}>
                {data.header.headline}
              </p>
            ) : null}
          </div>
        </header>

        <div className="grid grid-cols-[240px,1fr]">
          <aside className="flex flex-col gap-6 border-r px-5 py-7" style={{ background: sidebarBgColor, borderColor: `${mutedTextColor}40` }}>
            {contactLines.length ? (
              <SidebarBlock title="Contact" primaryTextColor={primaryTextColor}>
                <div className="space-y-2 text-[11px] leading-relaxed" style={{ color: primaryTextColor }}>
                  {contactLines.map((line, index) => (
                    <p key={`contact-${index}`}>{line}</p>
                  ))}
                </div>
              </SidebarBlock>
            ) : null}

            {skills.length ? (
              <SidebarBlock title="Skills" primaryTextColor={primaryTextColor}>
                <ul className="space-y-1 text-[11px]" style={{ color: primaryTextColor }}>
                  {skills.slice(0, 8).map((skill, index) => (
                    <li key={`${skill}-${index}`} className="flex items-start gap-2">
                      <span className="text-[14px] leading-none" style={{ color: accentColor }}>*</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </SidebarBlock>
            ) : null}

            {languages.length ? (
              <SidebarBlock title="Languages" primaryTextColor={primaryTextColor}>
                <ul className="space-y-1 text-[11px]" style={{ color: primaryTextColor }}>
                  {languages.slice(0, 6).map((language, index) => (
                    <li key={`${language}-${index}`} className="flex items-start gap-2">
                      <span className="text-[14px] leading-none" style={{ color: accentColor }}>*</span>
                      <span>{language}</span>
                    </li>
                  ))}
                </ul>
              </SidebarBlock>
            ) : null}

            {references.length ? (
              <SidebarBlock title="References" primaryTextColor={primaryTextColor}>
                <div className="space-y-4 text-[11px]" style={{ color: primaryTextColor }}>
                  {references.slice(0, 2).map((reference, index) => (
                    <div key={`${reference.name || "reference"}-${index}`} className="space-y-1">
                      {hasText(reference.name) ? <p className="font-semibold">{reference.name}</p> : null}
                      {hasText(reference.role) ? <p style={{ color: mutedTextColor }}>{reference.role}</p> : null}
                      {hasText(reference.phone) ? <p><span className="font-semibold">Phone:</span> {reference.phone}</p> : null}
                      {hasText(reference.email) ? <p><span className="font-semibold">Email:</span> {reference.email}</p> : null}
                    </div>
                  ))}
                </div>
              </SidebarBlock>
            ) : null}
          </aside>

          <main className="px-8 py-7" style={{ background: mainBgColor }}>
            <div className="space-y-6">
              {hasText(data.summary?.text) ? (
                <MainSection icon={<FaUserTie size={12} />} title="Profile" primaryTextColor={primaryTextColor} mutedTextColor={mutedTextColor} inverseTextColor={inverseTextColor}>
                  {hasHtmlMarkup(data.summary.text) ? (
                    <div
                      className="text-[11px] leading-[1.7] [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                      style={{ color: mutedTextColor }}
                      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }}
                    />
                  ) : (
                    <p className="text-[11px] leading-[1.7]" style={{ color: mutedTextColor }}>{data.summary.text}</p>
                  )}
                </MainSection>
              ) : null}

              {experience.length ? (
                <MainSection icon={<FaBriefcase size={12} />} title="Work Experience" primaryTextColor={primaryTextColor} mutedTextColor={mutedTextColor} inverseTextColor={inverseTextColor}>
                  <div className="space-y-4">
                    {experience.map((exp, index) => {
                      const bulletItems = splitBullets(exp.bullets);
                      const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking, "PRESENT");
                      const location = [exp.city, exp.country].filter(hasText).join(", ");
                      return (
                        <div key={`${exp.jobTitle || exp.employer || "experience"}-${index}`} className="border-l-2 border-transparent pl-3">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="text-[12px] font-bold" style={{ color: primaryTextColor }}>{exp.employer || exp.jobTitle}</p>
                            {dateRange ? <p className="shrink-0 text-[10px] font-semibold tracking-[0.06em]" style={{ color: mutedTextColor }}>{dateRange}</p> : null}
                          </div>
                          {hasText(exp.jobTitle) ? <p className="text-[11px]" style={{ color: mutedTextColor }}>{exp.jobTitle}</p> : null}
                          {location ? <p className="text-[10px] uppercase tracking-[0.08em]" style={{ color: `${mutedTextColor}CC` }}>{location}</p> : null}
                          {hasHtmlMarkup(exp.bullets) ? (
                            <div
                              className="mt-1 text-[11px] leading-[1.6] [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                              style={{ color: mutedTextColor }}
                              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
                            />
                          ) : bulletItems.length ? (
                            <ul className="mt-1 space-y-1 text-[11px] leading-[1.6]" style={{ color: mutedTextColor }}>
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

              {education.length ? (
                <MainSection icon={<FaGraduationCap size={12} />} title="Education" primaryTextColor={primaryTextColor} mutedTextColor={mutedTextColor} inverseTextColor={inverseTextColor}>
                  <div className="space-y-3">
                    {education.map((edu, index) => {
                      const dateRange = formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying, "PRESENT");
                      const details = splitBullets(edu.details);
                      return (
                        <div key={`${edu.degree || edu.institution || "education"}-${index}`} className="border-l-2 border-transparent pl-3">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="text-[12px] font-bold" style={{ color: primaryTextColor }}>{edu.degree || edu.institution}</p>
                            {dateRange ? <p className="shrink-0 text-[10px] font-semibold" style={{ color: mutedTextColor }}>{dateRange}</p> : null}
                          </div>
                          {hasText(edu.institution) ? <p className="text-[11px]" style={{ color: mutedTextColor }}>{edu.institution}</p> : null}
                          {details.length ? (
                            <ul className="mt-1 space-y-1 text-[11px] leading-[1.55]" style={{ color: mutedTextColor }}>
                              {details.slice(0, 3).map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex gap-2">
                                  <span style={{ color: accentColor }}>*</span>
                                  <span>{detail}</span>
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

              {additionalSections.map((section) => (
                <MainSection
                  key={section.id || section.title}
                  icon={<FaBriefcase size={12} />}
                  title={section.title || "Additional"}
                  primaryTextColor={primaryTextColor}
                  mutedTextColor={mutedTextColor}
                  inverseTextColor={inverseTextColor}
                >
                  <ul className="space-y-1 text-[11px] leading-[1.6]" style={{ color: mutedTextColor }}>
                    {section.items.filter(hasText).slice(0, 5).map((item, index) => (
                      <li key={`${section.title}-${index}`} className="flex gap-2">
                        <span style={{ color: accentColor }}>*</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </MainSection>
              ))}
            </div>
          </main>
        </div>
      </div>
    </article>
  );
}

function SidebarBlock({ title, primaryTextColor, children }) {
  return (
    <div>
      <p className="border-b-2 pb-2 font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: primaryTextColor, borderColor: primaryTextColor }}>
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MainSection({ icon, title, primaryTextColor, mutedTextColor, inverseTextColor, children }) {
  return (
    <section className="relative flex gap-4">
      <div className="z-[1] flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: primaryTextColor, color: inverseTextColor }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="mb-3 border-b pb-2 font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[14px] font-bold uppercase tracking-[0.12em]" style={{ color: primaryTextColor, borderColor: `${mutedTextColor}40` }}>
          {title}
        </p>
        {children}
      </div>
    </section>
  );
}
