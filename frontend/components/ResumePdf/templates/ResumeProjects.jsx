import { getSectionByTitle } from "../common/previewUtils.js";

function parseProject(item) {
  const parts = String(item || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return null;
  if (parts.length === 1) return { title: parts[0], description: "" };

  return {
    title: parts[0],
    description: parts.slice(1).join(" | ")
  };
}

export default function ResumeProjects({ additional = {} }) {
  const projectsSection = getSectionByTitle(additional, "Projects");
  const parsed = (projectsSection?.items || []).map(parseProject).filter(Boolean);

  if (!parsed.length) return null;

  return (
    <section className="section" data-resume-section="true">
      <h2 className="section-title">Projects</h2>
      {parsed.map((project, index) => (
        <article className="project-entry" key={`${project.title}-${index}`}>
          <p className="project-title">{project.title}</p>
          {project.description ? <p className="project-description">{project.description}</p> : null}
        </article>
      ))}
    </section>
  );
}
