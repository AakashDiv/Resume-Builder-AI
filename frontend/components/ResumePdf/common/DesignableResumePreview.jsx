import ResumePdfPreview from "./ResumePdfPreview.jsx";

function getFontFamilyByKey(key) {
  if (key === "roboto") return "Roboto, Arial, sans-serif";
  if (key === "lato") return "Lato, Arial, sans-serif";
  if (key === "poppins") return "Poppins, Arial, sans-serif";
  if (key === "merriweather") return "Merriweather, Georgia, serif";
  return "Inter, Helvetica, Arial, sans-serif";
}

export default function DesignableResumePreview({ selectedTemplate, resumeData, designSettings }) {
  const accent = designSettings?.accentColor || selectedTemplate?.accent || "#1d4ed8";
  const fontFamily = getFontFamilyByKey(designSettings?.fontStyle || "inter");

  return (
    <div style={{ ["--resume-accent-color"]: accent, ["--resume-font-family"]: fontFamily }}>
      <ResumePdfPreview selectedTemplate={selectedTemplate} resumeData={resumeData} designSettings={designSettings} />
    </div>
  );
}
