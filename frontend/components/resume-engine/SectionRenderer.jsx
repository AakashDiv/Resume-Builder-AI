import { AdditionalGrouped, AdditionalList } from "./sections/AdditionalSections.jsx";
import ResumeEducation from "./sections/ResumeEducation.jsx";
import ResumeExperience from "./sections/ResumeExperience.jsx";
import ResumeProjects from "./sections/ResumeProjects.jsx";
import ResumeSkills from "./sections/ResumeSkills.jsx";
import ResumeSummary from "./sections/ResumeSummary.jsx";

const sectionComponents = {
  summary: ResumeSummary,
  experience: ResumeExperience,
  education: ResumeEducation,
  projects: ResumeProjects,
  skills: ResumeSkills,
  additionalGrouped: AdditionalGrouped,
  additionalList: AdditionalList
};

export default function SectionRenderer({ section, measureRef, hideTitle = false }) {
  const Component = sectionComponents[section.type];
  if (!Component) return null;

  return (
    <section
      ref={measureRef}
      className="resume-section"
      data-resume-section="true"
      data-section-id={section.id}
    >
      {!hideTitle ? <h2 className="resume-section-title">{section.title}</h2> : null}
      <Component section={section} />
    </section>
  );
}
