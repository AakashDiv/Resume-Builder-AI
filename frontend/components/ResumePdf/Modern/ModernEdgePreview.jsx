import { hasHtmlMarkup, sanitizeRichHtml, splitBullets, splitByCommaOrLine, getSectionByTitle } from "../common/previewUtils.js";
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
  const skills = splitByCommaOrLine(data.skills.primarySkills);
  const languagesSection = getSectionByTitle(data.additional, "Languages");
  const referencesSection = getSectionByTitle(data.additional, "References");
  const languages = splitByCommaOrLine((languagesSection?.items || []).join("\n") || data.additional.languages || "");
  const referenceRaw = (referencesSection?.items || []).map((item) => String(item || "").trim()).filter(Boolean);
  const [reference] = referenceRaw.length
    ? referenceRaw.map((item) => {
        const [name = "", role = "", phone = "", email = ""] = item.split("|").map((part) => part.trim());
        return { name, role, phone, email };
      })
    : [{ name: "Reference Name", role: "Company / Role", phone: "+123-456-7890", email: "hello@reallygreatsite.com" }];

  return (
    <article
      data-resume-padding="true"
      className="w-full overflow-hidden bg-white"
      style={{ fontFamily: "Barlow, Arial, sans-serif", color: primaryTextColor, minHeight: "297mm" }}
    >
      <div className="grid grid-rows-[auto,1fr]" style={{ minHeight: "inherit" }}>
        <header className="grid grid-cols-[240px,1fr]" style={{ background: headerBgColor }}>
          <div className="flex items-end px-6 pb-4 pt-7">
            <div className="h-[128px] w-[128px] overflow-hidden rounded-full border-4 border-white/20 bg-slate-300 shadow-lg">
              {data.header.photo ? <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover object-top" /> : <div className="grid h-full place-items-center text-xs font-semibold text-slate-600">PHOTO</div>}
            </div>
          </div>
          <div className="flex flex-col justify-end px-9 pb-6 pt-9">
            <h1 className="font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[40px] font-extrabold uppercase tracking-[0.04em] leading-none" style={{ color: inverseTextColor }}>{data.header.fullName || "Richard Sanchez"}</h1>
            <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.22em]" style={{ color: `${inverseTextColor}B3` }}>{data.header.headline || "Marketing Manager"}</p>
          </div>
        </header>

        <div className="grid grid-cols-[240px,1fr]" style={{ minHeight: "inherit" }}>
          <aside className="flex flex-col justify-between gap-6 border-r px-5 py-7" style={{ background: sidebarBgColor, borderColor: `${mutedTextColor}40` }}>
            <div>
              <p className="border-b-2 pb-2 font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: primaryTextColor, borderColor: primaryTextColor }}>Contact</p>
              <div className="mt-3 space-y-2 text-[11px] leading-relaxed" style={{ color: primaryTextColor }}>
                <p>{data.header.phone || "+123-456-7890"}</p><p>{data.header.email || "hello@reallygreatsite.com"}</p><p>{data.header.location || "123 Anywhere St., Any City"}</p><p>{data.additional.portfolio || "www.reallygreatsite.com"}</p>
              </div>
            </div>
            <div>
              <p className="border-b-2 pb-2 font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: primaryTextColor, borderColor: primaryTextColor }}>Skills</p>
              <ul className="mt-3 space-y-1 text-[11px]" style={{ color: primaryTextColor }}>
                {(skills.length ? skills : ["Project Management", "Leadership", "Critical Thinking", "Digital Marketing"]).slice(0, 8).map((skill, index) => (
                  <li key={`${skill}-${index}`} className="flex items-start gap-2"><span className="text-[14px] leading-none" style={{ color: accentColor }}>*</span><span>{skill}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="border-b-2 pb-2 font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: primaryTextColor, borderColor: primaryTextColor }}>Languages</p>
              <ul className="mt-3 space-y-1 text-[11px]" style={{ color: primaryTextColor }}>
                {(languages.length ? languages : ["English (Fluent)", "Hindi (Fluent)"]).slice(0, 6).map((language, index) => (
                  <li key={`${language}-${index}`} className="flex items-start gap-2"><span className="text-[14px] leading-none" style={{ color: accentColor }}>*</span><span>{language}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="border-b-2 pb-2 font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: primaryTextColor, borderColor: primaryTextColor }}>Reference</p>
              <div className="mt-3 space-y-1 text-[11px]" style={{ color: primaryTextColor }}>
                <p className="font-semibold" style={{ color: primaryTextColor }}>{reference.name || "Estelle Darcy"}</p>
                <p style={{ color: mutedTextColor }}>{reference.role || "Wardiere Inc. / CTO"}</p>
                <p><span className="font-semibold" style={{ color: primaryTextColor }}>Phone:</span> {reference.phone || "+123-456-7890"}</p>
                <p><span className="font-semibold" style={{ color: primaryTextColor }}>Email:</span> {reference.email || "hello@reallygreatsite.com"}</p>
              </div>
            </div>
          </aside>

          <main className="px-8 py-7" style={{ background: mainBgColor }}>
            <div className="flex h-full flex-col justify-between gap-6">
              <section className="relative flex gap-4">
                <div className="z-[1] flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: primaryTextColor, color: inverseTextColor }}><FaUserTie size={12} /></div>
                <div className="flex-1">
                  <p className="mb-3 border-b pb-2 font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[14px] font-bold uppercase tracking-[0.12em]" style={{ color: primaryTextColor, borderColor: `${mutedTextColor}40` }}>Profile</p>
                  {hasHtmlMarkup(data.summary.text) ? <div className="text-[11px] leading-[1.7] [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: mutedTextColor }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }} /> : <p className="text-[11px] leading-[1.7]" style={{ color: mutedTextColor }}>{data.summary.text || "Add your profile summary highlighting strengths, experience, and career focus."}</p>}
                </div>
              </section>

              <section className="relative flex gap-4">
                <div className="z-[1] flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: primaryTextColor, color: inverseTextColor }}><FaBriefcase size={12} /></div>
                <div className="flex-1">
                  <p className="mb-3 border-b pb-2 font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[14px] font-bold uppercase tracking-[0.12em]" style={{ color: primaryTextColor, borderColor: `${mutedTextColor}40` }}>Work Experience</p>
                  <div className="space-y-4">
                    {(data.experience.length ? data.experience : [{ employer: "Borcelle Studio", jobTitle: "Marketing Manager & Specialist", startDate: "2030", currentlyWorking: true, bullets: "Develop and execute comprehensive strategies.\nLead and mentor the marketing team." }]).slice(0, 3).map((exp, index) => (
                      <div key={`${exp.jobTitle}-${index}`} className="border-l-2 border-transparent pl-3">
                        <div className="flex items-baseline justify-between gap-3"><p className="text-[12px] font-bold" style={{ color: primaryTextColor }}>{exp.employer || "Company Name"}</p><p className="shrink-0 text-[10px] font-semibold tracking-[0.06em]" style={{ color: mutedTextColor }}>{exp.startDate || "Start"} - {exp.currentlyWorking ? "PRESENT" : exp.endDate || "End"}</p></div>
                        <p className="text-[11px]" style={{ color: mutedTextColor }}>{exp.jobTitle || "Role Title"}</p>
                        {hasHtmlMarkup(exp.bullets) ? <div className="mt-1 text-[11px] leading-[1.6] [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: mutedTextColor }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }} /> : <ul className="mt-1 space-y-1 text-[11px] leading-[1.6]" style={{ color: mutedTextColor }}>{(splitBullets(exp.bullets).length ? splitBullets(exp.bullets) : ["Add impact-focused bullet points for this role."]).slice(0, 3).map((bullet, bulletIndex) => <li key={bulletIndex} className="flex gap-2"><span style={{ color: accentColor }}>*</span><span>{bullet}</span></li>)}</ul>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="relative flex gap-4">
                <div className="z-[1] flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: primaryTextColor, color: inverseTextColor }}><FaGraduationCap size={12} /></div>
                <div className="flex-1">
                  <p className="mb-3 border-b pb-2 font-['Barlow_Condensed',Barlow,Arial,sans-serif] text-[14px] font-bold uppercase tracking-[0.12em]" style={{ color: primaryTextColor, borderColor: `${mutedTextColor}40` }}>Education</p>
                  <div className="space-y-3">
                    {(data.education.length ? data.education : [{ degree: "Master of Business Management", institution: "Wardiere University", startDate: "2029", endDate: "2031", details: "GPA: 3.8 / 4.0" }]).slice(0, 3).map((edu, index) => (
                      <div key={`${edu.degree}-${index}`} className="border-l-2 border-transparent pl-3">
                        <div className="flex items-baseline justify-between gap-3"><p className="text-[12px] font-bold" style={{ color: primaryTextColor }}>{edu.degree || "Degree"}</p><p className="shrink-0 text-[10px] font-semibold" style={{ color: mutedTextColor }}>{edu.startDate || "Start"} - {edu.currentlyStudying ? "PRESENT" : edu.endDate || "End"}</p></div>
                        <p className="text-[11px]" style={{ color: mutedTextColor }}>{edu.institution || "Institution"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </article>
  );
}


