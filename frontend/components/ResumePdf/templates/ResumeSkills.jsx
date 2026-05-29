import { splitByCommaOrLine } from "../common/previewUtils.js";

export default function ResumeSkills({ skills = "" }) {
  const list = splitByCommaOrLine(skills);
  if (!list.length) return null;

  return (
    <section className="section" data-resume-section="true">
      <h2 className="section-title">Skills</h2>
      <div className="skills-wrap">
        {list.map((skill, index) => (
          <span key={`${skill}-${index}`} className="skill-tag">{skill}</span>
        ))}
      </div>
    </section>
  );
}
