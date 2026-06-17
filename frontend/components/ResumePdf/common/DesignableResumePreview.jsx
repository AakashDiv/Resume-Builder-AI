import ResumeRenderer from "../../resume-engine/ResumeRenderer.jsx";
import AtsFriendlyResumeEightPreview from "../ATS/AtsFriendlyResumeEightPreview.jsx";
import AtsFriendlyResumeFivePreview from "../ATS/AtsFriendlyResumeFivePreview.jsx";
import AtsFriendlyResumeFourPreview from "../ATS/AtsFriendlyResumeFourPreview.jsx";
import AtsFriendlyResumeNinePreview from "../ATS/AtsFriendlyResumeNinePreview.jsx";
import AtsFriendlyResumeOnePreview from "../ATS/AtsFriendlyResumeOnePreview.jsx";
import AtsFriendlyResumeSevenPreview from "../ATS/AtsFriendlyResumeSevenPreview.jsx";
import AtsFriendlyResumeSixPreview from "../ATS/AtsFriendlyResumeSixPreview.jsx";
import AtsFriendlyResumeThreePreview from "../ATS/AtsFriendlyResumeThreePreview.jsx";
import AtsFriendlyResumeTenPreview from "../ATS/AtsFriendlyResumeTenPreview.jsx";
import AtsFriendlyResumeTwoPreview from "../ATS/AtsFriendlyResumeTwoPreview.jsx";
import CreativeOnePreview from "../Creative/CreativeOnePreview.jsx";
import CreativeTwoPreview from "../Creative/CreativeTwoPreview.jsx";
import BlackWhiteMinimalistPreview from "../Minimalist/BlackWhiteMinimalistPreview.jsx";
import ModernProfessionalFourPreview from "../Modern/ModernProfessionalFourPreview.jsx";
import ModernProfessionalFivePreview from "../Modern/ModernProfessionalFivePreview.jsx";
import ModernProfessionalOnePreview from "../Modern/ModernProfessionalOnePreview.jsx";
import ModernProfessionalThreePreview from "../Modern/ModernProfessionalThreePreview.jsx";
import ModernProfessionalTwoPreview from "../Modern/ModernProfessionalTwoPreview.jsx";
import WhiteBlackModernMinimalistPreview from "../Minimalist/WhiteBlackModernMinimalistPreview.jsx";
import ProfessionalCVPreview from "../Professional/ProfessionalCVPreview.jsx";

const STANDALONE_TEMPLATES = {
  "ats-friendly-resume-1": AtsFriendlyResumeOnePreview,
  "ats-friendly-resume-2": AtsFriendlyResumeTwoPreview,
  "ats-friendly-resume-3": AtsFriendlyResumeThreePreview,
  "ats-friendly-resume-4": AtsFriendlyResumeFourPreview,
  "ats-friendly-resume-5": AtsFriendlyResumeFivePreview,
  "ats-friendly-resume-6": AtsFriendlyResumeSixPreview,
  "ats-friendly-resume-7": AtsFriendlyResumeSevenPreview,
  "ats-friendly-resume-8": AtsFriendlyResumeEightPreview,
  "ats-friendly-resume-9": AtsFriendlyResumeNinePreview,
  "ats-friendly-resume-10": AtsFriendlyResumeTenPreview,
  "creative-1": CreativeOnePreview,
  "creative-2": CreativeTwoPreview,
  "black-white-minimalist": BlackWhiteMinimalistPreview,
  "modern-professional-1": ModernProfessionalOnePreview,
  "modern-professional-2": ModernProfessionalTwoPreview,
  "modern-professional-3": ModernProfessionalThreePreview,
  "modern-professional-4": ModernProfessionalFourPreview,
  "modern-professional-5": ModernProfessionalFivePreview,
  "white-black-modern-minimalist": WhiteBlackModernMinimalistPreview,
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
        accentColor={designSettings?.accentColor || selectedTemplate?.accent}
        headerBgColor={designSettings?.headerBgColor}
        sidebarBgColor={designSettings?.sidebarBgColor || "#2d2d2d"}
        mainBgColor={designSettings?.mainBgColor || "#ffffff"}
        primaryTextColor={designSettings?.primaryTextColor || "#111827"}
        mutedTextColor={designSettings?.mutedTextColor || "#4b5563"}
        inverseTextColor={designSettings?.inverseTextColor || "#ffffff"}
        onPageCountChange={onPageCountChange}
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
