import HarvardTemplate from "../templates/harvard.jsx";
import MinimalTemplate from "../templates/minimal.jsx";
import ModernTemplate from "../templates/modern.jsx";

export default function ResumePdfPreview({ selectedTemplate, resumeData }) {
  const templateId = String(selectedTemplate?.id || "");

  if (["classic-pro", "executive-lite"].includes(templateId)) {
    return <HarvardTemplate data={resumeData} templateId={templateId} />;
  }

  if (["minimal-clean", "creative-grid", "simple-professional"].includes(templateId)) {
    return <MinimalTemplate data={resumeData} templateId={templateId} />;
  }

  return <ModernTemplate data={resumeData} templateId={templateId} />;
}
