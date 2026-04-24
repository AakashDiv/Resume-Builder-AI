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

export default function OrangeSlatePreview({
  data,
  accentColor = "#e8a820",
  sidebarBgColor = "#2e2e2e",
  mainBgColor = "#ffffff",
  primaryTextColor = "#2d2d2d",
  mutedTextColor = "#666666",
  inverseTextColor = "#ffffff"
}) {
  const skills = splitByCommaOrLine(data.skills?.primarySkills || "");
  const languagesSection = getSectionByTitle(data.additional, "Languages");
  const languages = splitByCommaOrLine((languagesSection?.items || []).join("\n") || data.additional?.languages || "");
  const references = parseReferenceItems(data.additional).slice(0, 2);
  const education = getMeaningfulEducation(data.education).slice(0, 2);
  const experience = getMeaningfulExperience(data.experience).slice(0, 3);
  const additionalSections = getRenderableAdditionalSections(data.additional, ["languages", "references"]).slice(0, 2);
  const name = splitDisplayName(data.header?.fullName);
  const initials = getInitials(data.header?.fullName);
  const contactItems = [
    { label: "Phone:", value: data.header?.phone },
    { label: "E-Mail:", value: data.header?.email },
    { label: "Website:", value: data.additional?.portfolio },
    { label: "Address:", value: data.header?.location }
  ].filter((item) => hasText(item.value));

  return (
    <article data-resume-padding="true" className="h-full w-full overflow-hidden" style={{ fontFamily: "Raleway, Arial, sans-serif", background: mainBgColor, color: primaryTextColor }}>
      <div className="grid h-full w-full grid-cols-[32%,68%]">
        <aside className="flex h-full flex-col" style={{ background: sidebarBgColor, color: inverseTextColor }}>
          <div className="relative px-5 pb-6 pt-8">
            <div className="absolute left-0 right-0 top-[106px] h-10" style={{ background: accentColor }} />
            <div className="relative z-[1] mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-full border-[5px] shadow-lg text-3xl font-bold tracking-[0.08em]" style={{ borderColor: `${sidebarBgColor}EE`, color: primaryTextColor, background: "#e5e7eb" }}>
              {data.header?.photo ? <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover object-top" /> : initials}
            </div>
          </div>

          <div className="space-y-0">
            {contactItems.length ? (
              <SidebarBlock title="Contact" accentColor={accentColor}>
                {contactItems.map((item) => (
                  <ContactRow key={`${item.label}-${item.value}`} label={item.label} value={item.value} accentColor={accentColor} inverseTextColor={inverseTextColor} />
                ))}
              </SidebarBlock>
            ) : null}

            {education.length ? (
              <SidebarBlock title="Education" accentColor={accentColor}>
                {education.map((edu, idx) => {
                  const dateRange = formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying);
                  return (
                    <div key={`${edu.degree || edu.institution || "education"}-${idx}`} className="space-y-0.5">
                      {hasText(edu.institution) ? <p className="text-[12px] font-bold" style={{ color: inverseTextColor }}>{edu.institution}</p> : null}
                      {hasText(edu.degree) ? <p className="text-[11px]" style={{ color: `${inverseTextColor}B8` }}>{edu.degree}</p> : null}
                      {dateRange ? <p className="text-[10px]" style={{ color: `${inverseTextColor}80` }}>{dateRange}</p> : null}
                    </div>
                  );
                })}
              </SidebarBlock>
            ) : null}

            {skills.length ? (
              <SidebarBlock title="Skills" accentColor={accentColor}>
                {skills.slice(0, 6).map((skill, idx) => (
                  <DotItem key={`${skill}-${idx}`} text={skill} accentColor={accentColor} inverseTextColor={inverseTextColor} />
                ))}
              </SidebarBlock>
            ) : null}

            {languages.length ? (
              <SidebarBlock title="Languages" accentColor={accentColor}>
                {languages.slice(0, 4).map((lang, idx) => (
                  <DotItem key={`${lang}-${idx}`} text={lang} accentColor={accentColor} inverseTextColor={inverseTextColor} />
                ))}
              </SidebarBlock>
            ) : null}
          </div>
        </aside>

        <main className="flex h-full flex-col" style={{ background: mainBgColor }}>
          <div className="border-b px-10 pb-7 pt-9" style={{ borderColor: `${mutedTextColor}33` }}>
            <p className="text-[42px] font-light uppercase leading-none tracking-[0.04em]" style={{ color: primaryTextColor }}>{name.primary}</p>
            {name.secondary ? <p className="mt-1 text-[42px] font-extrabold uppercase leading-none tracking-[0.04em]" style={{ color: primaryTextColor }}>{name.secondary}</p> : null}
            {hasText(data.header?.headline) ? <p className="mt-2 text-[12px] tracking-[0.08em]" style={{ color: mutedTextColor }}>{data.header.headline}</p> : null}
          </div>

          <div className="flex flex-1 flex-col gap-7 px-10 py-8">
            {hasText(data.summary?.text) ? (
              <MainSection title="About Me" accentColor={accentColor} primaryTextColor={primaryTextColor}>
                {hasHtmlMarkup(data.summary.text) ? (
                  <div className="text-[12px] leading-[1.75] [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: mutedTextColor }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }} />
                ) : (
                  <p className="text-[12px] leading-[1.75]" style={{ color: mutedTextColor }}>{data.summary.text}</p>
                )}
              </MainSection>
            ) : null}

            {experience.length ? (
              <MainSection title="Work Experience" accentColor={accentColor} primaryTextColor={primaryTextColor}>
                <div className="space-y-3">
                  {experience.map((exp, idx) => {
                    const bulletItems = splitBullets(exp.bullets);
                    const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking);
                    return (
                      <div key={`${exp.jobTitle || exp.employer || "experience"}-${idx}`} className="rounded-r border-l-4 p-3" style={{ background: `${mutedTextColor}10`, borderLeftColor: accentColor }}>
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[13px] font-bold" style={{ color: primaryTextColor }}>{exp.jobTitle || exp.employer}</p>
                          {dateRange ? <p className="text-[11px]" style={{ color: mutedTextColor }}>{dateRange}</p> : null}
                        </div>
                        {hasText(exp.employer) ? <p className="text-[11.5px] font-semibold" style={{ color: accentColor }}>{exp.employer}</p> : null}
                        {hasHtmlMarkup(exp.bullets) ? (
                          <div className="mt-1 text-[11.5px] leading-[1.65] [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: mutedTextColor }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }} />
                        ) : bulletItems.length ? (
                          <ul className="mt-1 space-y-1 text-[11.5px] leading-[1.65]" style={{ color: mutedTextColor }}>
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
              <MainSection title="References" accentColor={accentColor} primaryTextColor={primaryTextColor}>
                <div className="grid grid-cols-2 gap-3">
                  {references.map((ref, idx) => (
                    <div key={`${ref.name || "reference"}-${idx}`} className="rounded border-t-[3px] px-3 py-3" style={{ borderColor: `${mutedTextColor}33`, borderTopColor: accentColor }}>
                      {hasText(ref.name) ? <p className="text-[12px] font-bold" style={{ color: primaryTextColor }}>{ref.name}</p> : null}
                      {hasText(ref.role) ? <p className="text-[11px]" style={{ color: mutedTextColor }}>{ref.role}</p> : null}
                      {hasText(ref.phone) ? <p className="mt-1 text-[11px]" style={{ color: primaryTextColor }}><strong style={{ color: accentColor }}>Phone:</strong> {ref.phone}</p> : null}
                      {hasText(ref.email) ? <p className="text-[11px]" style={{ color: primaryTextColor }}><strong style={{ color: accentColor }}>Email:</strong> {ref.email}</p> : null}
                    </div>
                  ))}
                </div>
              </MainSection>
            ) : null}

            {additionalSections.map((section) => (
              <MainSection key={section.id || section.title} title={section.title || "Additional"} accentColor={accentColor} primaryTextColor={primaryTextColor}>
                <ul className="space-y-1 text-[11.5px] leading-[1.65]" style={{ color: mutedTextColor }}>
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
    </article>
  );
}

function SidebarBlock({ title, accentColor, children }) {
  return (
    <div className="border-t px-6 py-5" style={{ borderColor: "rgba(255,255,255,.07)" }}>
      <p className="inline-block border-b-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color: accentColor, borderColor: accentColor }}>{title}</p>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function ContactRow({ label, value, accentColor, inverseTextColor }) {
  const icon = label.includes("Phone")
    ? <FaPhone size={9} />
    : label.includes("Mail")
      ? <FaEnvelope size={9} />
      : label.includes("Address")
        ? <FaLocationDot size={9} />
        : null;

  return (
    <p className="grid grid-cols-[70px,1fr] gap-2 text-[11px] leading-relaxed">
      <span className="inline-flex items-center gap-1 font-bold" style={{ color: accentColor }}>
        {icon} {label}
      </span>
      <span style={{ color: `${inverseTextColor}CC` }}>{value}</span>
    </p>
  );
}

function DotItem({ text, accentColor, inverseTextColor }) {
  return (
    <p className="flex items-center gap-2 text-[11.5px]" style={{ color: `${inverseTextColor}CC` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} />
      <span>{text}</span>
    </p>
  );
}

function MainSection({ title, accentColor, primaryTextColor, children }) {
  return (
    <section>
      <p className="mb-3 border-b-2 pb-2 text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ color: primaryTextColor, borderColor: accentColor }}>{title}</p>
      {children}
    </section>
  );
}
