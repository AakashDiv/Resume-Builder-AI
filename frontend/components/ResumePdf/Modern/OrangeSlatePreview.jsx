import { hasHtmlMarkup, sanitizeRichHtml, splitBullets, splitByCommaOrLine, getSectionByTitle } from "../common/previewUtils.js";
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
  const skills = splitByCommaOrLine(data.skills.primarySkills);
  const languagesSection = getSectionByTitle(data.additional, "Languages");
  const languages = splitByCommaOrLine((languagesSection?.items || []).join("\n") || data.additional.languages || "");
  const referencesSection = getSectionByTitle(data.additional, "References");
  const references = (referencesSection?.items || [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => {
      const [name = "", role = "", phone = "", email = ""] = item.split("|").map((part) => part.trim());
      return { name, role, phone, email };
    });

  const [firstName = "ISABEL", ...restName] = String(data.header.fullName || "").trim().split(/\s+/).filter(Boolean);
  const lastName = restName.join(" ") || "MERCADO";

  return (
    <article
      data-resume-padding="true"
      className="w-full overflow-hidden"
      style={{ fontFamily: "Raleway, Arial, sans-serif", background: mainBgColor, color: primaryTextColor, minHeight: "297mm" }}
    >
      <div className="grid w-full grid-cols-[32%,68%]" style={{ minHeight: "inherit" }}>
        <aside className="flex h-full flex-col justify-between" style={{ background: sidebarBgColor, color: inverseTextColor }}>
          <div className="relative px-5 pb-6 pt-8">
            <div className="absolute left-0 right-0 top-[106px] h-10" style={{ background: accentColor }} />
            <div className="relative z-[1] mx-auto h-32 w-32 overflow-hidden rounded-full border-[5px] shadow-lg" style={{ borderColor: `${sidebarBgColor}EE` }}>
              {data.header.photo ? <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover object-top" /> : <div className="grid h-full place-items-center bg-slate-300 text-xs font-semibold text-slate-600">PHOTO</div>}
            </div>
          </div>

          <div className="space-y-0">
            <SidebarBlock title="Contact" accentColor={accentColor}>
              <ContactRow label="Phone:" value={data.header.phone || "+123-456-7890"} accentColor={accentColor} inverseTextColor={inverseTextColor} />
              <ContactRow label="E-Mail:" value={data.header.email || "hello@reallygreatsite.com"} accentColor={accentColor} inverseTextColor={inverseTextColor} />
              <ContactRow label="Website:" value={data.additional.portfolio || "www.reallygreatsite.com"} accentColor={accentColor} inverseTextColor={inverseTextColor} />
              <ContactRow label="Address:" value={data.header.location || "123 Anywhere St., Any City"} accentColor={accentColor} inverseTextColor={inverseTextColor} />
            </SidebarBlock>

            <SidebarBlock title="Education" accentColor={accentColor}>
              {(data.education.length ? data.education : [{ institution: "Rimberio University", degree: "Bachelor of Business Management", startDate: "2019", endDate: "2023" }]).slice(0, 2).map((edu, idx) => (
                <div key={`${edu.degree}-${idx}`} className="space-y-0.5">
                  <p className="text-[12px] font-bold" style={{ color: inverseTextColor }}>{edu.institution || "University"}</p>
                  <p className="text-[11px]" style={{ color: `${inverseTextColor}B8` }}>{edu.degree || "Degree"}</p>
                  <p className="text-[10px]" style={{ color: `${inverseTextColor}80` }}>{edu.startDate || "Start"} - {edu.currentlyStudying ? "Present" : edu.endDate || "End"}</p>
                </div>
              ))}
            </SidebarBlock>

            <SidebarBlock title="Skills" accentColor={accentColor}>
              {(skills.length ? skills : ["Management Skills", "Negotiation", "Critical Thinking", "Leadership"]).slice(0, 6).map((skill, idx) => (
                <DotItem key={`${skill}-${idx}`} text={skill} accentColor={accentColor} inverseTextColor={inverseTextColor} />
              ))}
            </SidebarBlock>

            <SidebarBlock title="Language" accentColor={accentColor}>
              {(languages.length ? languages : ["English", "German", "Spanish"]).slice(0, 4).map((lang, idx) => (
                <DotItem key={`${lang}-${idx}`} text={lang} accentColor={accentColor} inverseTextColor={inverseTextColor} />
              ))}
            </SidebarBlock>
          </div>
        </aside>

        <main className="flex h-full flex-col" style={{ background: mainBgColor }}>
          <div className="border-b px-10 pb-7 pt-9" style={{ borderColor: `${mutedTextColor}33` }}>
            <p className="text-[42px] font-light uppercase leading-none tracking-[0.04em]" style={{ color: primaryTextColor }}>{firstName}</p>
            <p className="mt-1 text-[42px] font-extrabold uppercase leading-none tracking-[0.04em]" style={{ color: primaryTextColor }}>{lastName}</p>
            <p className="mt-2 text-[12px] tracking-[0.08em]" style={{ color: mutedTextColor }}>{data.header.headline || "Marketing Manager"}</p>
          </div>

          <div className="flex flex-1 flex-col justify-between gap-7 px-10 py-8">
            <MainSection title="About Me" accentColor={accentColor} primaryTextColor={primaryTextColor}>
              {hasHtmlMarkup(data.summary.text) ? (
                <div className="text-[12px] leading-[1.75] [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: mutedTextColor }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }} />
              ) : (
                <p className="text-[12px] leading-[1.75]" style={{ color: mutedTextColor }}>{data.summary.text || "Add your profile summary here."}</p>
              )}
            </MainSection>

            <MainSection title="Work Experience" accentColor={accentColor} primaryTextColor={primaryTextColor}>
              <div className="space-y-3">
                {(data.experience.length ? data.experience : [{ jobTitle: "Marketing Manager", employer: "Arowwai Industries", startDate: "2022", endDate: "2023", bullets: "Led campaigns and improved conversion results." }]).slice(0, 3).map((exp, idx) => (
                  <div key={`${exp.jobTitle}-${idx}`} className="rounded-r border-l-4 p-3" style={{ background: `${mutedTextColor}10`, borderLeftColor: accentColor }}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] font-bold" style={{ color: primaryTextColor }}>{exp.jobTitle || "Role"}</p>
                      <p className="text-[11px]" style={{ color: mutedTextColor }}>{exp.startDate || "Start"} - {exp.currentlyWorking ? "Present" : exp.endDate || "End"}</p>
                    </div>
                    <p className="text-[11.5px] font-semibold" style={{ color: accentColor }}>{exp.employer || "Company"}</p>
                    {hasHtmlMarkup(exp.bullets) ? (
                      <div className="mt-1 text-[11.5px] leading-[1.65] [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: mutedTextColor }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }} />
                    ) : (
                      <p className="mt-1 text-[11.5px] leading-[1.65]" style={{ color: mutedTextColor }}>{splitBullets(exp.bullets).join(" ") || "Add measurable impact statements for this role."}</p>
                    )}
                  </div>
                ))}
              </div>
            </MainSection>

            <MainSection title="References" accentColor={accentColor} primaryTextColor={primaryTextColor}>
              <div className="grid grid-cols-2 gap-3">
                {(references.length ? references : [
                  { name: "Harumi Kobayashi", role: "Salford & Co. / CEO", phone: "123-456-7890", email: "hello@reallygreatsite.com" },
                  { name: "Bailey Dupont", role: "Arowwai Industries / CEO", phone: "123-456-7890", email: "hello@reallygreatsite.com" }
                ]).map((ref, idx) => (
                  <div key={`${ref.name}-${idx}`} className="rounded border-t-[3px] px-3 py-3" style={{ borderColor: `${mutedTextColor}33`, borderTopColor: accentColor }}>
                    <p className="text-[12px] font-bold" style={{ color: primaryTextColor }}>{ref.name || "Reference Name"}</p>
                    <p className="text-[11px]" style={{ color: mutedTextColor }}>{ref.role || "Company / Role"}</p>
                    <p className="mt-1 text-[11px]" style={{ color: primaryTextColor }}><strong style={{ color: accentColor }}>Phone:</strong> {ref.phone || "+123-456-7890"}</p>
                    <p className="text-[11px]" style={{ color: primaryTextColor }}><strong style={{ color: accentColor }}>Email:</strong> {ref.email || "hello@reallygreatsite.com"}</p>
                  </div>
                ))}
              </div>
            </MainSection>
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


