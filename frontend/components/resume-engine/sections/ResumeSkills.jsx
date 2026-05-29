export default function ResumeSkills({ section }) {
  return (
    <div className="resume-skills">
      {section.data.skills.map((skill, index) => (
        <span className="resume-skill" key={`${skill}-${index}`}>
          {skill}
        </span>
      ))}
    </div>
  );
}
