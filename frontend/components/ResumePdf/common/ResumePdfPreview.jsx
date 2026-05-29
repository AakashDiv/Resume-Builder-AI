import CreativePreview from "../Creative/CreativePreview.jsx";
import ModernEdgePreview from "../Modern/ModernEdgePreview.jsx";
import OrangeSlatePreview from "../Modern/OrangeSlatePreview.jsx";
import TechFocusPreview from "../Modern/TechFocusPreview.jsx";
import SharpClassicPreview from "../Simple/SharpClassicPreview.jsx";
import SimpleProfessionalPreview from "../Simple/SimpleProfessionalPreview.jsx";
import SimplePreview from "../Simple/SimplePreview.jsx";
import HarvardTemplate from "../templates/harvard.jsx";
import MinimalTemplate from "../templates/minimal.jsx";

export default function ResumePdfPreview({ selectedTemplate, resumeData, designSettings }) {
  const templateId = String(selectedTemplate?.id || "");
  const sharedDesignProps = {
    accentColor: designSettings?.accentColor || selectedTemplate?.accent,
    headerBgColor: designSettings?.headerBgColor,
    sidebarBgColor: designSettings?.sidebarBgColor,
    mainBgColor: designSettings?.mainBgColor,
    primaryTextColor: designSettings?.primaryTextColor,
    mutedTextColor: designSettings?.mutedTextColor,
    inverseTextColor: designSettings?.inverseTextColor
  };

  switch (templateId) {
    case "sharp-classic":
      return <SharpClassicPreview data={resumeData} {...sharedDesignProps} />;
    case "classic-pro":
      return <HarvardTemplate data={resumeData} templateId={templateId} />;
    case "executive-lite":
      return <SimplePreview data={resumeData} />;
    case "minimal-clean":
      return <MinimalTemplate data={resumeData} templateId={templateId} />;
    case "creative-grid":
      return <CreativePreview data={resumeData} />;
    case "simple-professional":
      return <SimpleProfessionalPreview data={resumeData} {...sharedDesignProps} />;
    case "modern-edge":
      return <ModernEdgePreview data={resumeData} {...sharedDesignProps} />;
    case "tech-focus":
      return <TechFocusPreview data={resumeData} {...sharedDesignProps} />;
    case "modern-isabel":
      return <OrangeSlatePreview data={resumeData} {...sharedDesignProps} />;
    default:
      return <SharpClassicPreview data={resumeData} {...sharedDesignProps} />;
  }
}
