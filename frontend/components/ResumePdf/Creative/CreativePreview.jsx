import { hasHtmlMarkup, sanitizeRichHtml, splitBullets, splitByCommaOrLine } from "../common/previewUtils.js";
import { FaEnvelope, FaLocationDot, FaPhone } from "react-icons/fa6";

function CreativeBlock({ title, children }) {
  return (
    <section className="mt-3 text-[11px] leading-relaxed text-slate-800">
      <h3 className="border-b border-amber-200 pb-0.5 text-[12px] font-extrabold uppercase tracking-wide">{title}</h3>
      <div className="mt-1">{children}</div>
    </section>
  );
}

export default function CreativePreview({ data }) {
  const skills = splitByCommaOrLine(data.skills.primarySkills);
  const firstExperience = data.experience[0] || {};
  const firstEducation = data.education[0] || {};

  return (
    <article className="overflow-hidden rounded-[22px] bg-white shadow-lg" style={{ aspectRatio: "1 / 1.23" }}>
      <div className="grid h-full grid-cols-[34%,66%]">
        <aside
          className="text-white"
          style={{
            background:
              "linear-gradient(180deg, #5a4a3f 0%, #5a4a3f 17%, #d47f13 17%, #d47f13 100%)"
          }}
        >
          <div className="px-4 pt-4">
            <div className="mx-auto h-28 w-24 overflow-hidden rounded-sm border-4 border-white bg-slate-200">
              {data.header.photo ? (
                <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xs font-semibold text-slate-500">PHOTO</div>
              )}
            </div>
          </div>

          <div className="px-4 pb-4 pt-5 text-[10px]">
            <p className="mb-1 font-bold uppercase">Contact</p>
            <p className="inline-flex items-center gap-1"><FaLocationDot size={9} /> {data.header.location || "City, Country"}</p>
            <p className="inline-flex items-center gap-1"><FaPhone size={9} /> {data.header.phone || "+1 555 0000"}</p>
            <p className="inline-flex items-center gap-1"><FaEnvelope size={9} /> {data.header.email || "example@email.com"}</p>

            <hr className="my-3 border-white/30" />
            <p className="mb-1 font-bold uppercase">Skills</p>
            <ul className="list-disc space-y-1 pl-4">
              {(skills.length ? skills : ["Theme development", "Research skills", "Active listening", "Time management"]).slice(0, 7).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <hr className="my-3 border-white/30" />
            <p className="mb-1 font-bold uppercase">Work History</p>
            <p className="font-semibold">{firstExperience.jobTitle || "Role Title"}</p>
            <p>{firstExperience.employer || "Company"}</p>
            <p>
              {firstExperience.startDate || "Jan 2022"} {firstExperience.currentlyWorking ? "- Present" : firstExperience.endDate ? `- ${firstExperience.endDate}` : ""}
            </p>
          </div>
        </aside>

        <section className="px-4 pb-4 pt-3">
          <h1 className="text-4xl font-extrabold leading-none text-amber-600">{data.header.fullName || "Diana Hughes"}</h1>
          <p className="mt-1 text-xl font-semibold">{data.header.headline || "A dynamic writer and meticulous editor"}</p>

          <CreativeBlock title="Career Objective">
            {hasHtmlMarkup(data.summary.text) ? (
              <div
                className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }}
              />
            ) : (
              <p>{data.summary.text || "A creative writer and editor with internship experience writing in magazines and crafting content for digital platforms."}</p>
            )}
          </CreativeBlock>

          <CreativeBlock title="Professional Skills">
            <p className="font-semibold">{skills[0] || "Content strategy"}</p>
            {hasHtmlMarkup(firstExperience.bullets) ? (
              <div
                className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(firstExperience.bullets) }}
              />
            ) : (
              <ul className="list-disc pl-4">
                {splitBullets(firstExperience.bullets).length ? (
                  splitBullets(firstExperience.bullets).slice(0, 4).map((bullet, idx) => <li key={idx}>{bullet}</li>)
                ) : (
                  <>
                    <li>Adhered to monthly editorial release timelines.</li>
                    <li>Produced optimized copy and integrated feedback quickly.</li>
                    <li>Edited articles for structure and clarity.</li>
                  </>
                )}
              </ul>
            )}
          </CreativeBlock>

          <CreativeBlock title="Education">
            <p className="font-semibold">{firstEducation.endDate || "June 2022"}</p>
            <p className="font-semibold">{firstEducation.degree || "Bachelor of Arts | English Composition"}</p>
            <p>{firstEducation.institution || "University / College"}</p>
            {hasHtmlMarkup(firstEducation.details) ? (
              <div
                className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(firstEducation.details) }}
              />
            ) : splitBullets(firstEducation.details).length ? (
              <ul className="mt-1 list-disc pl-4">
                {splitBullets(firstEducation.details).slice(0, 3).map((bullet, idx) => <li key={idx}>{bullet}</li>)}
              </ul>
            ) : null}
          </CreativeBlock>
        </section>
      </div>
    </article>
  );
}


