import { hasHtmlMarkup, sanitizeRichHtml, splitBullets, splitByCommaOrLine, getSectionByTitle } from "../common/previewUtils.js";
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
  const skills = splitByCommaOrLine(data.skills.primarySkills);
  const referencesSection = getSectionByTitle(data.additional, "References");
  const referenceItems = (referencesSection?.items || [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => {
      const [name = "", role = "", phone = "", email = ""] = item.split("|").map((part) => part.trim());
      return { name, role, phone, email };
    });
  const references = referenceItems.length
    ? referenceItems
    : [
        { name: "Reference Name", role: "Company / Role", phone: "+123-456-7890", email: "reference@email.com" },
        { name: "Reference Name", role: "Company / Role", phone: "+123-456-7890", email: "reference@email.com" }
      ];
  const [firstName = "YOUR", ...restName] = String(data.header.fullName || "").trim().split(/\s+/).filter(Boolean);
  const lastName = restName.join(" ") || "NAME";

  

  return (
    <article data-resume-padding="true" className="h-full w-full overflow-hidden bg-white" style={{ fontFamily: "'DM Sans', Arial, sans-serif", color: primaryTextColor }}>
      <div className="grid h-full w-full grid-cols-[32%,68%]">
        <aside className="relative flex h-full flex-col gap-7 px-6 py-8" style={{ background: sidebarBgColor, color: inverseTextColor }}>
          <div className="mx-auto h-[120px] w-[120px] rounded-full p-[4px]" style={{ background: `linear-gradient(135deg, ${accentColor}, #e8c88a, ${accentColor})` }}>
            <div className="h-full w-full overflow-hidden rounded-full bg-slate-200">
              {data.header.photo ? (
                <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xs font-semibold text-slate-500">PHOTO</div>
              )}
            </div>
          </div>

          <div>
            <p className="border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accentColor, borderColor: `${accentColor}55` }}>Contact Me</p>
            <div className="mt-3 space-y-2 text-[11px] leading-relaxed" style={{ color: `${inverseTextColor}D9` }}>
              <p className="inline-flex items-center gap-1"><FaPhone size={10} /> {data.header.phone || "+123-456-7890"}</p><p className="inline-flex items-center gap-1"><FaEnvelope size={10} /> {data.header.email || "hello@reallygreatsite.com"}</p><p>{data.additional.portfolio || "www.reallygreatsite.com"}</p><p className="inline-flex items-center gap-1"><FaLocationDot size={10} /> {data.header.location || "123 Anywhere St., Any City"}</p>
            </div>
          </div>

          <div>
            <p className="border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accentColor, borderColor: `${accentColor}55` }}>Education</p>
            <div className="mt-3 space-y-3">
              {(data.education.length ? data.education : [{ degree: "Bachelor Degree", institution: "University", endDate: "2015" }]).slice(0, 3).map((edu, index) => (
                <div key={`${edu.degree}-${index}`} className="space-y-0.5">
                  <p className="text-[11px]" style={{ color: `${inverseTextColor}E6` }}>{edu.degree || "Bachelor Degree"}</p>
                  <p className="text-[10px] font-semibold" style={{ color: accentColor }}>{edu.institution || "University"}</p>
                  <p className="text-[10px]" style={{ color: `${inverseTextColor}80` }}>{edu.startDate || "Start"} - {edu.currentlyStudying ? "Present" : edu.endDate || "End"}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accentColor, borderColor: `${accentColor}55` }}>Skills</p>
            <ul className="mt-3 space-y-1.5 text-[11px]" style={{ color: `${inverseTextColor}D9` }}>
              {(skills.length ? skills : ["Graphic and Web Design", "Visual Design", "Storyboards", "Branding"]).slice(0, 8).map((skill, index) => (
                <li key={`${skill}-${index}`} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} /><span>{skill}</span></li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex h-full flex-col gap-7 px-8 py-9" style={{ background: mainBgColor }}>
          <div>
            <p className="font-serif text-[35px] font-black uppercase leading-none" style={{ color: primaryTextColor }}>{firstName} {lastName}</p>
            {/* <p className="mt-1 font-serif text-[30px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedTextColor }}>{lastName}</p> */}
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em]" style={{ color: accentColor }}>{data.header.headline || "Professional Title"}</p>
          </div>

          <section>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: primaryTextColor }}><span>Work Experience</span><span className="h-px flex-1" style={{ background: `${primaryTextColor}33` }} /></p>
            <div className="mt-4 space-y-3">
              {(data.experience.length ? data.experience : [{ jobTitle: "Senior Graphic Designer", employer: "Fauget Studio", startDate: "2019", endDate: "2022", bullets: "Add measurable impact statements." }]).slice(0, 4).map((exp, index) => (
                <div key={`${exp.jobTitle}-${index}`} className="border-l-2 border-transparent pl-3">
                  <div className="flex items-baseline justify-between gap-3"><p className="text-[12px] font-semibold" style={{ color: primaryTextColor }}>{exp.jobTitle || "Role Title"}</p><p className="shrink-0 text-[10px] font-medium tracking-[0.04em]" style={{ color: accentColor }}>{exp.startDate || "Start"} - {exp.currentlyWorking ? "Present" : exp.endDate || "End"}</p></div>
                  <p className="text-[10.5px] font-medium tracking-[0.04em]" style={{ color: mutedTextColor }}>{exp.employer || "Company"} {exp.city || exp.country ? `- ${[exp.city, exp.country].filter(Boolean).join(", ")}` : ""}</p>
                  {hasHtmlMarkup(exp.bullets) ? (
                    <div className="mt-1 text-[10.5px] leading-[1.6] [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4" style={{ color: mutedTextColor }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }} />
                  ) : (
                    <p className="mt-1 text-[10.5px] leading-[1.6]" style={{ color: mutedTextColor }}>{splitBullets(exp.bullets).join(" ") || "Add concise role summary and measurable achievements."}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: primaryTextColor }}><span>References</span><span className="h-px flex-1" style={{ background: `${primaryTextColor}33` }} /></p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {references.map((ref, index) => (
                <div key={`${ref.name}-${index}`} className="rounded-md border bg-white px-3 py-3" style={{ borderColor: `${mutedTextColor}33` }}>
                  <p className="text-[11px] font-bold" style={{ color: primaryTextColor }}>{ref.name || "Reference Name"}</p>
                  <p className="mt-0.5 text-[10px]" style={{ color: mutedTextColor }}>{ref.role || "Company / Role"}</p>
                  <p className="mt-1 text-[10px]" style={{ color: mutedTextColor }}><span className="font-semibold uppercase tracking-[0.06em]" style={{ color: accentColor }}>Phone:</span> {ref.phone || "+123-456-7890"}</p>
                  <p className="text-[10px]" style={{ color: mutedTextColor }}><span className="font-semibold uppercase tracking-[0.06em]" style={{ color: accentColor }}>Email:</span> {ref.email || "hello@reallygreatsite.com"}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </article>
  );
}


