import { getSectionByTitle } from "../common/previewUtils.js";

function parseProject(item) {
  const parts = String(item || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return null;
  if (parts.length === 1) return { title: parts[0], type: "", year: "", description: "" };
  if (parts.length === 2) return { title: parts[0], type: "", year: "", description: parts[1] };
  if (parts.length === 3) return { title: parts[0], type: parts[1], year: parts[2], description: "" };
  return {
    title: parts[0],
    type: parts[1],
    year: parts[2],
    description: parts.slice(3).join(" | ")
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
          <div className="job-header">
            <div className="job-title-block">
              <p className="project-title">
                {project.title}
                {project.type ? <span className="project-type"> &middot; {project.type}</span> : null}
              </p>
            </div>
            {project.year ? <p className="job-meta">{project.year}</p> : null}
          </div>
          {project.description ? (
            <p className="project-description">{project.description}</p>
          ) : null}
        </article>
      ))}
    </section>
  );
}
