import { hasHtmlMarkup, sanitizeRichHtml, splitBullets, getAdditionalSections } from "../common/previewUtils.js";
import { FaBriefcase, FaGraduationCap, FaListCheck, FaRegAddressCard, FaUserTie } from "react-icons/fa6";

function PreviewSection({ title, accent, children }) {
  const iconByTitle = {
    "Professional Summary": <FaUserTie size={11} />,
    Experience: <FaBriefcase size={11} />,
    Education: <FaGraduationCap size={11} />,
    Skills: <FaListCheck size={11} />
  };

  return (
    <section className="mt-5">
      <h3 className="mb-2 inline-flex items-center gap-1 border-b pb-1 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: accent, borderColor: `${accent}44` }}>
        {iconByTitle[title] || <FaRegAddressCard size={11} />}
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function DefaultPreview({ data, accent }) {
  return (
    <article data-resume-padding="true" className="rounded-xl bg-white p-6 shadow-sm" style={{ borderTop: `5px solid ${accent}` }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{data.header.fullName || "Your Name"}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {[data.header.email, data.header.phone, data.header.location].filter(Boolean).join(" | ") ||
              "email@example.com | +91 99999 99999 | City, Country"}
          </p>
        </div>
        {data.header.photo ? (
          <div className="h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
            <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>

      <PreviewSection title="Professional Summary" accent={accent}>
        {hasHtmlMarkup(data.summary.text) ? (
          <div
            className="text-sm leading-6 text-slate-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }}
          />
        ) : (
          <p className="text-sm leading-6 text-slate-700">{data.summary.text || "Write a concise professional summary describing your strengths and career direction."}</p>
        )}
      </PreviewSection>

      <PreviewSection title="Experience" accent={accent}>
        {data.experience.map((exp, index) => (
          <div key={`${exp.jobTitle}-${index}`} className="mb-4">
            <p className="text-sm font-bold text-slate-900">{exp.jobTitle || "Job Title"} {exp.employer ? `- ${exp.employer}` : ""}</p>
            <p className="text-xs text-slate-500">
              {[exp.city, exp.country].filter(Boolean).join(", ")} {exp.startDate ? `| ${exp.startDate}` : ""} {exp.currentlyWorking ? "- Present" : exp.endDate ? `- ${exp.endDate}` : ""}
            </p>
            {hasHtmlMarkup(exp.bullets) ? (
              <div
                className="mt-2 text-sm text-slate-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(exp.bullets) }}
              />
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {splitBullets(exp.bullets).length ? splitBullets(exp.bullets).map((bullet, idx) => <li key={idx}>{bullet}</li>) : <li>Add impact-focused bullet points here.</li>}
              </ul>
            )}
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="Education" accent={accent}>
        {data.education.map((edu, index) => (
          <div key={`${edu.degree}-${index}`} className="mb-3">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{edu.degree || "Degree"}</span>
              {edu.institution ? ` - ${edu.institution}` : ""}
            </p>
            {hasHtmlMarkup(edu.details) ? (
              <div
                className="mt-1 text-sm text-slate-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(edu.details) }}
              />
            ) : splitBullets(edu.details).length ? (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {splitBullets(edu.details).slice(0, 4).map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}
              </ul>
            ) : null}
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="Skills" accent={accent}>
        <p className="text-sm text-slate-700">{data.skills.primarySkills || "React, Node.js, MongoDB, Communication, Leadership"}</p>
      </PreviewSection>

      {getAdditionalSections(data.additional)
        .filter((section) => Array.isArray(section?.items) && section.items.some((item) => String(item || "").trim()))
        .slice(0, 3)
        .map((section) => (
          <PreviewSection key={section.id || section.title} title={section.title || "Additional"} accent={accent}>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {section.items.filter((item) => String(item || "").trim()).slice(0, 5).map((item, index) => (
                <li key={`${section.title}-${index}`}>{item}</li>
              ))}
            </ul>
          </PreviewSection>
        ))}
    </article>
  );
}

