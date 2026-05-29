export default function ResumeProjects({ section }) {
  return (
    <div className="resume-entry-stack">
      {section.data.projects.map((project, index) => (
        <article className="resume-entry" key={project.id || `${project.name}-${index}`}>
          <div className="resume-entry-heading">
            <div>
              <h3 className="resume-entry-title">{project.name || "Project"}</h3>
              {project.type ? <p className="resume-entry-subtitle">{project.type}</p> : null}
            </div>
            {project.year ? <p className="resume-entry-meta">{project.year}</p> : null}
          </div>
          {project.description ? <p className="resume-paragraph">{project.description}</p> : null}
        </article>
      ))}
    </div>
  );
}
