import { splitByCommaOrLine } from "../common/previewUtils.js";

export default function ResumeSkills({ skills = "" }) {
  const list = splitByCommaOrLine(skills);
  if (!list.length) return null;

  return (
    <section className="section" data-resume-section="true">
      <h2 className="section-title">Skills</h2>
      <ul className="skills-list">
        {list.map((skill, index) => (
          <li key={`${skill}-${index}`}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}
