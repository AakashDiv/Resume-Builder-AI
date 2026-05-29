import ResumeHeader from "./sections/ResumeHeader.jsx";
import SectionRenderer from "./SectionRenderer.jsx";

export default function PageRenderer({ data, template, sections, pageIndex, totalPages, children }) {
  return (
    <div className="resume-engine-page" data-resume-page="true" data-page-index={pageIndex}>
      <div className="resume-engine-page-inner">
        {pageIndex === 0 ? (
          <ResumeHeader data={data} template={template} />
        ) : (
          <div className="resume-continuation" aria-hidden>
            <span>{data?.header?.fullName || "Resume"}</span>
            <span>Page {pageIndex + 1} of {totalPages}</span>
          </div>
        )}
        <main className="resume-engine-flow">
          {children || sections.map((section, index) => {
            const previous = sections[index - 1];
            const hideTitle = Boolean(previous && previous.groupId === section.groupId && section.canMergeTitle);
            return <SectionRenderer key={section.id} section={section} hideTitle={hideTitle} />;
          })}
        </main>
      </div>
    </div>
  );
}
