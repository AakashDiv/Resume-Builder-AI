import {
  formatDateRange,
  getInitials,
  getMeaningfulEducation,
  getMeaningfulExperience,
  hasHtmlMarkup,
  hasText,
  sanitizeRichHtml,
  splitBullets,
  splitByCommaOrLine
} from "../common/previewUtils.js";
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
  const skills = splitByCommaOrLine(data.skills?.primarySkills || "");
  const experience = getMeaningfulExperience(data.experience).slice(0, 1);
  const education = getMeaningfulEducation(data.education).slice(0, 1);
  const firstExperience = experience[0];
  const firstEducation = education[0];
  const initials = getInitials(data.header?.fullName);
  const dateRange = firstExperience ? formatDateRange(firstExperience.startDate, firstExperience.endDate, firstExperience.currentlyWorking) : "";

  return (
    <article data-resume-padding="true" className="h-full w-full overflow-hidden bg-white">
      <div className="grid h-full grid-cols-[34%,66%]">
        <aside
          className="text-white"
          style={{
            background:
              "linear-gradient(180deg, #5a4a3f 0%, #5a4a3f 17%, #d47f13 17%, #d47f13 100%)"
          }}
        >
          <div className="px-4 pt-4">
            <div className="mx-auto grid h-28 w-24 place-items-center overflow-hidden rounded-sm border-4 border-white bg-slate-200 text-xl font-bold tracking-[0.08em] text-slate-700">
              {data.header?.photo ? (
                <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>

          <div className="px-4 pb-4 pt-5 text-[10px]">
            {(hasText(data.header?.location) || hasText(data.header?.phone) || hasText(data.header?.email)) ? (
              <>
                <p className="mb-1 font-bold uppercase">Contact</p>
                {hasText(data.header?.location) ? <p className="inline-flex items-center gap-1"><FaLocationDot size={9} /> {data.header.location}</p> : null}
                {hasText(data.header?.phone) ? <p className="inline-flex items-center gap-1"><FaPhone size={9} /> {data.header.phone}</p> : null}
                {hasText(data.header?.email) ? <p className="inline-flex items-center gap-1"><FaEnvelope size={9} /> {data.header.email}</p> : null}
              </>
            ) : null}

            {skills.length ? (
              <>
                <hr className="my-3 border-white/30" />
                <p className="mb-1 font-bold uppercase">Skills</p>
                <ul className="list-disc space-y-1 pl-4">
                  {skills.slice(0, 7).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {firstExperience ? (
              <>
                <hr className="my-3 border-white/30" />
                <p className="mb-1 font-bold uppercase">Work History</p>
                {hasText(firstExperience.jobTitle) ? <p className="font-semibold">{firstExperience.jobTitle}</p> : null}
                {hasText(firstExperience.employer) ? <p>{firstExperience.employer}</p> : null}
                {dateRange ? <p>{dateRange}</p> : null}
              </>
            ) : null}
          </div>
        </aside>

        <section className="px-4 pb-4 pt-3">
          <h1 className="text-4xl font-extrabold leading-none text-amber-600">{data.header?.fullName || "Your Name"}</h1>
          {hasText(data.header?.headline) ? <p className="mt-1 text-xl font-semibold">{data.header.headline}</p> : null}

          {hasText(data.summary?.text) ? (
            <CreativeBlock title="Career Objective">
              {hasHtmlMarkup(data.summary.text) ? (
                <div
                  className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.summary.text) }}
                />
              ) : (
                <p>{data.summary.text}</p>
              )}
            </CreativeBlock>
          ) : null}

          {firstExperience ? (
            <CreativeBlock title="Professional Experience">
              {hasText(firstExperience.jobTitle) ? <p className="font-semibold">{firstExperience.jobTitle}</p> : null}
              {hasText(firstExperience.employer) ? <p>{firstExperience.employer}</p> : null}
              {hasHtmlMarkup(firstExperience.bullets) ? (
                <div
                  className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(firstExperience.bullets) }}
                />
              ) : splitBullets(firstExperience.bullets).length ? (
                <ul className="list-disc pl-4">
                  {splitBullets(firstExperience.bullets).slice(0, 4).map((bullet, idx) => <li key={idx}>{bullet}</li>)}
                </ul>
              ) : null}
            </CreativeBlock>
          ) : null}

          {firstEducation ? (
            <CreativeBlock title="Education">
              {hasText(firstEducation.endDate) ? <p className="font-semibold">{firstEducation.endDate}</p> : null}
              {hasText(firstEducation.degree) ? <p className="font-semibold">{firstEducation.degree}</p> : null}
              {hasText(firstEducation.institution) ? <p>{firstEducation.institution}</p> : null}
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
          ) : null}
        </section>
      </div>
    </article>
  );
}
