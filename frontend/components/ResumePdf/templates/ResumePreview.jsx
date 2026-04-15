import ResumeEducation from "./ResumeEducation.jsx";
import ResumeExperience from "./ResumeExperience.jsx";
import ResumeHeader from "./ResumeHeader.jsx";
import ResumeProjects from "./ResumeProjects.jsx";
import ResumeSkills from "./ResumeSkills.jsx";
import ResumeSummary from "./ResumeSummary.jsx";
import "./resume-template.css";

function toProfileClass(templateId) {
  const key = String(templateId || "").trim().toLowerCase();
  if (!key) return "";
  return `profile-${key.replace(/[^a-z0-9]+/g, "-")}`;
}

export default function ResumePreview({ data, variant = "modern", templateId = "" }) {
  const variantClass =
    variant === "harvard"
      ? "template-harvard"
      : variant === "minimal"
        ? "template-minimal"
        : "template-modern";
  const profileClass = toProfileClass(templateId);

  return (
    <div className={`resume-root ${variantClass} ${profileClass}`}>
      <article className="page">
        <ResumeHeader header={data?.header} additional={data?.additional} />
        <ResumeSummary text={data?.summary?.text} />
        <ResumeExperience experience={data?.experience || []} />
        <ResumeSkills skills={data?.skills?.primarySkills || ""} />
        <ResumeEducation education={data?.education || []} />
        <ResumeProjects additional={data?.additional || {}} />
      </article>
    </div>
  );
}
