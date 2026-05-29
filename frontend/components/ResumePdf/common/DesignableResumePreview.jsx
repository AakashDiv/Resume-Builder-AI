import ResumeRenderer from "../../resume-engine/ResumeRenderer.jsx";
import ProfessionalCVPreview from "../Professional/ProfessionalCVPreview.jsx";

const STANDALONE_TEMPLATES = {
  "professional-cv": ProfessionalCVPreview
};

export default function DesignableResumePreview({
  selectedTemplate,
  resumeData,
  designSettings,
  mode = "preview",
  onPageCountChange
}) {
  const StandaloneComponent = STANDALONE_TEMPLATES[selectedTemplate?.id];

  if (StandaloneComponent) {
    return (
      <StandaloneComponent
        data={resumeData}
        sidebarBgColor={designSettings?.sidebarBgColor || "#2d2d2d"}
        mainBgColor={designSettings?.mainBgColor || "#ffffff"}
        primaryTextColor={designSettings?.primaryTextColor || "#111827"}
        mutedTextColor={designSettings?.mutedTextColor || "#4b5563"}
      />
    );
  }

  return (
    <ResumeRenderer
      selectedTemplate={selectedTemplate}
      resumeData={resumeData}
      designSettings={designSettings}
      mode={mode}
      onPageCountChange={onPageCountChange}
    />
  );
}
