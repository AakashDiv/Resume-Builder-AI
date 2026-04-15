import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useSearchParams } from "react-router-dom";
import { FaDownload, FaEye, FaUser } from "react-icons/fa6";
import TemplateThumbnail from "../components/TemplateThumbnail.jsx";
import DesignableResumePreview from "../components/ResumePdf/common/DesignableResumePreview.jsx";
import { getTemplateById, resumeTemplates } from "../data/resumeTemplates.js";
import { useResumeBuilder } from "../context/ResumeBuilderContext.jsx";
import {
  buildProfessionalQualityReport,
  computeSmartPageOffsets,
  normalizeResumeForPdf
} from "../utils/resumePdfQuality.js";

const steps = [
  { key: "header", label: "Header" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "summary", label: "Summary" },
  { key: "additional", label: "Additional Details" },
  { key: "finalize", label: "Finalize" }
];
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const A4_WIDTH_MM = "210mm";
const A4_HEIGHT_MM = "297mm";
const EXPERIENCE_PHRASE_LIBRARY = [
  { tags: ["front end developer", "frontend", "react"], text: "Developed responsive web applications using HTML, CSS, and JavaScript frameworks." },
  { tags: ["front end developer", "frontend", "ui"], text: "Collaborated with designers to implement user-friendly interfaces and improve usability." },
  { tags: ["front end developer", "frontend", "performance"], text: "Optimized page load performance and reduced bundle size by refactoring legacy components." },
  { tags: ["front end developer", "frontend", "api"], text: "Integrated REST APIs and handled asynchronous state updates for dynamic user workflows." },
  { tags: ["backend developer", "node", "api"], text: "Built and maintained scalable API endpoints with proper validation, logging, and error handling." },
  { tags: ["backend developer", "database"], text: "Designed database schemas and improved query performance through indexing and optimization." },
  { tags: ["full stack developer", "fullstack"], text: "Delivered end-to-end features across frontend, backend, and database layers in agile sprints." },
  { tags: ["software engineer", "testing"], text: "Wrote unit and integration tests to improve release confidence and reduce regressions." },
  { tags: ["software engineer", "collaboration"], text: "Partnered with cross-functional teams to translate business needs into technical solutions." },
  { tags: ["devops", "deployment"], text: "Automated CI/CD pipelines and standardized deployment steps to reduce release time." },
  { tags: ["data analyst", "sql"], text: "Analyzed large datasets using SQL and BI tools to generate actionable business insights." },
  { tags: ["project manager", "stakeholder"], text: "Coordinated stakeholders, tracked milestones, and ensured on-time delivery of project goals." },
  { tags: ["general"], text: "Led process improvements that increased team productivity and reduced turnaround times." },
  { tags: ["general"], text: "Documented key workflows and created SOPs to improve onboarding and knowledge transfer." },
  { tags: ["general"], text: "Mentored junior team members and provided regular code and process feedback." }
];
const EDUCATION_DETAIL_LIBRARY = [
  "Relevant coursework: Data Structures, Operating Systems, DBMS, Computer Networks.",
  "Completed capstone project focused on scalable web application architecture.",
  "Graduated with distinction and maintained strong academic performance throughout program.",
  "Participated in technical workshops, hackathons, and peer-learning sessions.",
  "Led student team projects and presented outcomes to faculty and peers.",
  "Completed online certifications in cloud fundamentals and modern web development.",
  "Published dissertation on applied machine learning for business use cases.",
  "Served as class representative and coordinated academic events and activities.",
  "Conducted research and documented findings with structured methodology.",
  "Received merit scholarship for academic excellence."
];
const SKILL_LIBRARY = [
  "Code reviews",
  "JavaScript frameworks",
  "Problem solving",
  "Effective communication",
  "Integration testing",
  "Web development",
  "User interface design",
  "Responsive design",
  "Team collaboration",
  "Attention to detail",
  "API integration",
  "Version control (Git)",
  "Debugging",
  "Performance optimization",
  "Stakeholder communication"
];
const SUMMARY_LIBRARY = [
  {
    title: "Technical Skills & Collaboration",
    text:
      "Proficient Front End Developer with expertise in code reviews and JavaScript frameworks. Committed to enhancing user experiences through effective communication and team collaboration."
  },
  {
    title: "Problem Solving & Usability",
    text:
      "Detail-oriented Front End Developer skilled in conducting integration testing and developing responsive web applications. Collaborated with designers to create user-friendly interfaces that significantly improve usability and overall user satisfaction."
  },
  {
    title: "Full Stack Delivery",
    text:
      "Results-driven developer with experience building end-to-end product features across frontend and backend systems. Focused on performance, maintainability, and delivering measurable business impact."
  },
  {
    title: "Operations & Leadership",
    text:
      "Organized professional with a strong track record in process improvements, stakeholder coordination, and mentoring team members to deliver high-quality outcomes on schedule."
  }
];
const FONT_STYLE_OPTIONS = [
  { label: "Inter", value: "inter" },
  { label: "Roboto", value: "roboto" },
  { label: "Lato", value: "lato" },
  { label: "Poppins", value: "poppins" },
  { label: "Merriweather", value: "merriweather" }
];
const DEGREE_OPTIONS = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "MBA",
  "Diploma",
  "Certification"
];
const MONTH_OPTIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const HEADER_COLOR_PRESETS = ["#1e2d3d", "#3a6186", "#4a8fa8", "#0f766e", "#b45309", "#7c3aed"];
const BACKGROUND_COLOR_PRESETS = ["#0f172a", "#1e2d3d", "#f4f6f8", "#f5f1eb", "#ffffff", "#e2ebf0"];
const TEXT_COLOR_PRESETS = ["#0f172a", "#1e2d3d", "#2d3748", "#475569", "#6b7a8d", "#ffffff"];

function getTemplateColorPresets(template) {
  const templateId = String(template?.id || "");
  if (templateId === "simple-professional") {
    return {
      accent: ["#2563a8", "#1a4f8a", "#3b82f6", "#0f766e", "#7c3aed", "#b45309"],
      background: ["#ffffff", "#f4f1ec", "#f0ece4", "#eef3fa", "#fafafa", "#e8e4dc"],
      text: ["#1a1a1a", "#3d3d3d", "#6b6b6b", "#374151", "#111827", "#ffffff"]
    };
  }
  if (templateId === "modern-isabel") {
    return {
      accent: ["#e8a820", "#f0b833", "#d49a1b", "#242424", "#2e2e2e", "#666666"],
      background: ["#2e2e2e", "#242424", "#ffffff", "#f7f7f5", "#e0ddd8", "#d6d3cc"],
      text: ["#2d2d2d", "#666666", "#242424", "#ffffff", "#e8a820", "#f0b833"]
    };
  }
  return {
    accent: HEADER_COLOR_PRESETS,
    background: BACKGROUND_COLOR_PRESETS,
    text: TEXT_COLOR_PRESETS
  };
}

function supportsHeaderColorPicker(template) {
  const templateId = String(template?.id || "");
  return template?.category === "Modern" || ["modern-edge", "tech-focus", "creative-grid", "simple-professional"].includes(templateId);
}

function getTemplateColorDefaults(template) {
  const templateId = String(template?.id || "");
  if (templateId === "modern-edge") {
    return {
      accentColor: template?.accent || "#4a8fa8",
      headerBgColor: "#1e2d3d",
      sidebarBgColor: "#f4f6f8",
      mainBgColor: "#ffffff",
      primaryTextColor: "#1e2d3d",
      mutedTextColor: "#6b7a8d",
      inverseTextColor: "#ffffff"
    };
  }
  if (templateId === "tech-focus") {
    return {
      accentColor: template?.accent || "#c9a96e",
      headerBgColor: "#1e2a38",
      sidebarBgColor: "#1e2a38",
      mainBgColor: "#f5f1eb",
      primaryTextColor: "#1e2a38",
      mutedTextColor: "#7a7a7a",
      inverseTextColor: "#ffffff"
    };
  }
  if (templateId === "modern-isabel") {
    return {
      accentColor: template?.accent || "#e8a820",
      headerBgColor: "#2e2e2e",
      sidebarBgColor: "#2e2e2e",
      mainBgColor: "#ffffff",
      primaryTextColor: "#2d2d2d",
      mutedTextColor: "#666666",
      inverseTextColor: "#ffffff"
    };
  }
  if (templateId === "simple-professional") {
    return {
      accentColor: template?.accent || "#2563a8",
      headerBgColor: "#1a1a1a",
      sidebarBgColor: "#ffffff",
      mainBgColor: "#ffffff",
      primaryTextColor: "#1a1a1a",
      mutedTextColor: "#6b6b6b",
      inverseTextColor: "#ffffff"
    };
  }
  return {
    accentColor: template?.accent || "#2563eb",
    headerBgColor: "#1e2d3d",
    sidebarBgColor: "#f8fafc",
    mainBgColor: "#ffffff",
    primaryTextColor: "#0f172a",
    mutedTextColor: "#64748b",
    inverseTextColor: "#ffffff"
  };
}
const ADDITIONAL_PRESET_SECTIONS = [
  { key: "languages", title: "Languages", defaultItems: ["English"] },
  { key: "websites_social", title: "Websites & Social Links", defaultItems: ["Portfolio: https://"] },
  { key: "activities", title: "Activities", defaultItems: ["Volunteer / extracurricular activity"] },
  { key: "references", title: "References", defaultItems: ["Available on request"] },
  { key: "certifications_licenses", title: "Certifications & Licenses", defaultItems: ["Certification name"] },
  { key: "awards_honors", title: "Awards & Honors", defaultItems: ["Award name"] }
];

function splitByCommaOrLine(text) {
  const normalized = extractPlainText(text);
  return normalized
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitMonthYear(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i);
  if (!match) return { month: "", year: "" };
  return { month: match[1], year: match[2] };
}

function composeMonthYear(month, year) {
  const safeMonth = String(month || "").trim();
  const safeYear = String(year || "").trim();
  if (safeMonth && safeYear) return `${safeMonth} ${safeYear}`;
  return safeYear || safeMonth;
}

function splitBullets(text) {
  const raw = String(text || "");
  if (!raw.trim()) return [];

  if (raw.includes("<")) {
    const parser = document.createElement("div");
    parser.innerHTML = raw;
    const listItems = Array.from(parser.querySelectorAll("li"))
      .map((li) => li.textContent?.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean);
    if (listItems.length) return listItems;
  }

  return extractPlainText(raw)
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

function extractPlainText(value) {
  const raw = String(value || "");
  if (!raw.includes("<")) return raw;
  const parser = document.createElement("div");
  parser.innerHTML = raw;
  return parser.textContent || "";
}

function getAdditionalSections(additional) {
  return Array.isArray(additional?.sections) ? additional.sections : [];
}

function getSectionByTitle(additional, title) {
  return getAdditionalSections(additional).find(
    (section) => String(section?.title || "").trim().toLowerCase() === String(title || "").trim().toLowerCase()
  );
}

function isHeaderComplete(data) {
  return Boolean(data.header.fullName && data.header.email);
}

function isExperienceComplete(data) {
  return data.experience.some((item) => item.jobTitle && item.employer);
}

function isEducationComplete(data) {
  return data.education.some((item) => item.degree && item.institution);
}

function isSkillsComplete(data) {
  return Boolean(data.skills.primarySkills.trim());
}

function isSummaryComplete(data) {
  return Boolean(data.summary.text.trim());
}

function isAdditionalComplete(data) {
  const hasBasic = Boolean(data.additional.linkedin.trim() || data.additional.portfolio.trim() || data.additional.certifications.trim());
  const hasSections = getAdditionalSections(data.additional).some((section) => splitBullets((section.items || []).join("\n")).length);
  return hasBasic || hasSections;
}

export default function ResumeBuilderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => getTemplateById(searchParams.get("template")).id);
  const selectedTemplate = useMemo(() => getTemplateById(selectedTemplateId), [selectedTemplateId]);
  const previewRef = useRef(null);

  const {
    resumeData,
    updateHeader,
    updateSummary,
    updateSkills,
    updateAdditional,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    resetDraft
  } = useResumeBuilder();

  const [activeStep, setActiveStep] = useState("header");
  const [downloading, setDownloading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const initialTemplate = useMemo(() => getTemplateById(searchParams.get("template")), [searchParams]);
  const initialColorDefaults = useMemo(() => getTemplateColorDefaults(initialTemplate), [initialTemplate]);
  const [designSettings, setDesignSettings] = useState({
    accentColor: initialColorDefaults.accentColor,
    headerBgColor: initialColorDefaults.headerBgColor,
    sidebarBgColor: initialColorDefaults.sidebarBgColor,
    mainBgColor: initialColorDefaults.mainBgColor,
    primaryTextColor: initialColorDefaults.primaryTextColor,
    mutedTextColor: initialColorDefaults.mutedTextColor,
    inverseTextColor: initialColorDefaults.inverseTextColor,
    fontStyle: "inter",
    fontSize: 11,
    headingSize: 34,
    sectionSpacing: 18,
    paragraphSpacing: 8,
    lineSpacing: 1.45,
    sideMargin: 24,
    paragraphIndent: 0
  });
  const [finalizeFocus, setFinalizeFocus] = useState("resume_sections");
  const previewViewportRef = useRef(null);
  const pdfRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [estimatedPages, setEstimatedPages] = useState(1);

  const normalizedResult = useMemo(() => normalizeResumeForPdf(resumeData), [resumeData]);
  const resumeForRender = useMemo(
    () => ({ ...normalizedResult.data, _warnings: normalizedResult.warnings }),
    [normalizedResult]
  );
  const qualityReport = useMemo(
    () =>
      buildProfessionalQualityReport({
        rawData: resumeData,
        normalizedData: resumeForRender,
        estimatedPages
      }),
    [resumeData, resumeForRender, estimatedPages]
  );

  useEffect(() => {
    const queryTemplateId = searchParams.get("template");
    if (!queryTemplateId) return;
    if (queryTemplateId !== selectedTemplateId) {
      setSelectedTemplateId(getTemplateById(queryTemplateId).id);
    }
  }, [searchParams, selectedTemplateId]);

  useEffect(() => {
    const nextDefaults = getTemplateColorDefaults(selectedTemplate);
    setDesignSettings((prev) => ({ ...prev, ...nextDefaults }));
  }, [selectedTemplate.id]);

  const completedMap = useMemo(
    () => ({
      header: isHeaderComplete(resumeData),
      experience: isExperienceComplete(resumeData),
      education: isEducationComplete(resumeData),
      skills: isSkillsComplete(resumeData),
      summary: isSummaryComplete(resumeData),
      additional: isAdditionalComplete(resumeData),
      finalize: false
    }),
    [resumeData]
  );

  const progressPercent = useMemo(() => {
    const done = Object.values(completedMap).filter(Boolean).length;
    return Math.round((done / (steps.length - 1)) * 100);
  }, [completedMap]);

  useEffect(() => {
    if (activeStep === "finalize") return;
    const node = previewViewportRef.current;
    if (!node) return;

    let rafId = 0;
    let retries = 0;

    const updateScale = () => {
      const measuredWidth = node.getBoundingClientRect().width || node.clientWidth || 0;
      if (measuredWidth < 120) return false;

      const availableWidth = Math.max(measuredWidth - 16, 1);
      const nextScale = Math.min(1, availableWidth / A4_WIDTH_PX);
      setPreviewScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
      return true;
    };

    const primeScale = () => {
      const hasMeasuredWidth = updateScale();
      if (!hasMeasuredWidth && retries < 12) {
        retries += 1;
        rafId = requestAnimationFrame(primeScale);
      }
    };

    const scheduleScaleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateScale();
      });
    };

    primeScale();
    const observer = new ResizeObserver(scheduleScaleUpdate);
    observer.observe(node);
    window.addEventListener("resize", scheduleScaleUpdate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", scheduleScaleUpdate);
    };
  }, [activeStep]);

  useEffect(() => {
    const node = pdfRef.current;
    if (!node) return;

    let rafId = 0;
    const updatePages = () => {
      const totalHeight = node.scrollHeight || A4_HEIGHT_PX;
      const nextPages = Math.max(1, Math.ceil(totalHeight / A4_HEIGHT_PX));
      setEstimatedPages(nextPages);
    };

    const schedule = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePages);
    };

    updatePages();
    const observer = new ResizeObserver(schedule);
    observer.observe(node);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [resumeForRender, designSettings, selectedTemplate.id]);

  async function handlePhotoUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateHeader("photo", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  async function downloadPdf() {
    const targetNode = pdfRef.current || previewRef.current;
    if (!targetNode || downloading) return;

    setDownloading(true);
    try {
      const contentWidth = targetNode.scrollWidth || A4_WIDTH_PX;
      const contentHeight = targetNode.scrollHeight || A4_HEIGHT_PX;

      const canvas = await html2canvas(targetNode, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        width: contentWidth,
        height: contentHeight,
        windowWidth: contentWidth,
        windowHeight: contentHeight,
        scrollX: 0,
        scrollY: 0
      });

      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      const offsets = computeSmartPageOffsets({
        targetNode,
        imageHeightPt: imageHeight,
        pageHeightPt: pageHeight,
        pageWidthPt: pageWidth,
        canvasWidthPx: canvas.width
      });

      offsets.forEach((offset, index) => {
        if (index > 0) pdf.addPage();
        pdf.addImage(image, "PNG", 0, -offset, pageWidth, imageHeight);
      });

      pdf.save(`${(resumeForRender.header.fullName || "resume").replace(/\s+/g, "_")}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  function goToNextStep() {
    const index = steps.findIndex((step) => step.key === activeStep);
    const next = steps[index + 1];
    if (next) setActiveStep(next.key);
  }

  function goToPreviousStep() {
    const index = steps.findIndex((step) => step.key === activeStep);
    const previous = steps[index - 1];
    if (previous) setActiveStep(previous.key);
  }

  function selectTemplate(templateId) {
    const normalized = getTemplateById(templateId).id;
    setSelectedTemplateId(normalized);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("template", normalized);
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <div
      className={`grid gap-4 print:block ${
        activeStep === "finalize"
          ? isSidebarExpanded
            ? "lg:grid-cols-[220px,minmax(0,1fr)]"
            : "lg:grid-cols-[76px,minmax(0,1fr)]"
          : isSidebarExpanded
            ? "lg:grid-cols-[220px,minmax(0,1fr),420px]"
            : "lg:grid-cols-[76px,minmax(0,1fr),420px]"
      }`}
    >
      <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm print:hidden">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            {isSidebarExpanded ? <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Builder Progress</p> : <span />}
            <button
              type="button"
              onClick={() => setIsSidebarExpanded((prev) => !prev)}
              className="rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              Menu
            </button>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          {isSidebarExpanded ? <p className="mt-1 text-right text-sm font-bold text-brand-700">{progressPercent}%</p> : null}
        </div>

        <nav className="mt-4 space-y-2">
          {steps.map((step) => {
            const active = activeStep === step.key;
            const done = completedMap[step.key];
            return (
              <button
                key={step.key}
                onClick={() => setActiveStep(step.key)}
                className={`flex w-full items-center ${isSidebarExpanded ? "justify-between px-3 py-2" : "justify-center px-2 py-2"} rounded-lg text-left text-sm font-semibold transition ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                }`}
                title={step.label}
              >
                {isSidebarExpanded ? (
                  <>
                    <span>{step.label}</span>
                    <span className={`text-xs ${done ? "text-emerald-600" : "text-slate-400"}`}>{done ? "?" : "?"}</span>
                  </>
                ) : (
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full border text-xs ${
                      active ? "border-brand-600 bg-brand-600 text-white" : done ? "border-emerald-500 text-emerald-600" : "border-slate-300 text-slate-500"
                    }`}
                  >
                    {steps.findIndex((item) => item.key === step.key) + 1}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold">{steps.find((item) => item.key === activeStep)?.label}</h2>
            <p className="text-sm text-slate-500">Template: {selectedTemplate.name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={resetDraft} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              Reset Draft
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              <FaEye className="text-xs" />
              <span>Preview</span>
            </button>
            <button onClick={downloadPdf} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <FaDownload className="text-xs" />
              <span>{downloading ? "Preparing..." : "Download PDF"}</span>
            </button>
          </div>
        </header>

        <div className="transition-all duration-300">
          {renderStepForm(activeStep, resumeData, {
            updateHeader,
            updateSummary,
            updateSkills,
            updateAdditional,
            updateExperience,
            addExperience,
            removeExperience,
            updateEducation,
            addEducation,
            removeEducation,
            handlePhotoUpload,
            goToStep: setActiveStep,
            selectedTemplateId,
            selectTemplate,
            designSettings,
            setDesignSettings,
            selectedTemplate,
            finalizeFocus,
            setFinalizeFocus,
            resumeData,
            previewData: resumeForRender,
            qualityReport
          })}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={activeStep === "header"}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous Section
          </button>
          <button
            type="button"
            onClick={goToNextStep}
            disabled={activeStep === "finalize"}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next Section
          </button>
        </div>
      </section>

      {activeStep !== "finalize" ? (
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm print:border-0 print:bg-white print:p-0">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 print:hidden">
          <FaUser className="text-[10px]" />
          <span>Live Resume Preview</span>
        </p>
        <div ref={previewViewportRef} className="overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-2">
          <div style={{ height: `${A4_HEIGHT_PX * previewScale}px` }}>
            <div
              ref={previewRef}
              className="origin-top-left"
              style={{
                width: A4_WIDTH_MM,
                minHeight: A4_HEIGHT_MM,
                transform: `scale(${previewScale})`
              }}
            >
              <DesignableResumePreview selectedTemplate={selectedTemplate} resumeData={resumeForRender} designSettings={designSettings} />
            </div>
          </div>
        </div>
      </section>
      ) : null}

      <div className="pointer-events-none fixed -left-[10000px] top-0 opacity-0" aria-hidden>
        <div
          ref={pdfRef}
          style={{
            width: A4_WIDTH_MM,
            minHeight: A4_HEIGHT_MM,
            background: "#ffffff"
          }}
        >
          <DesignableResumePreview selectedTemplate={selectedTemplate} resumeData={resumeForRender} designSettings={designSettings} />
        </div>
      </div>

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-700">Resume Preview (A4)</p>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100 p-4">
              <div className="mx-auto bg-white shadow-sm" style={{ width: A4_WIDTH_MM, minHeight: A4_HEIGHT_MM }}>
                <DesignableResumePreview selectedTemplate={selectedTemplate} resumeData={resumeForRender} designSettings={designSettings} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function renderStepForm(step, data, actions) {
  if (step === "header") {
    const showColorPicker = supportsHeaderColorPicker(actions.selectedTemplate);
    const colorPresets = getTemplateColorPresets(actions.selectedTemplate);

    return (
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Full Name" value={data.header.fullName} onChange={(v) => actions.updateHeader("fullName", v)} />
          <Input label="Headline" value={data.header.headline || ""} onChange={(v) => actions.updateHeader("headline", v)} />
          <Input label="Email" value={data.header.email} onChange={(v) => actions.updateHeader("email", v)} />
          <Input label="Phone" value={data.header.phone} onChange={(v) => actions.updateHeader("phone", v)} />
          <Input label="Location" value={data.header.location} onChange={(v) => actions.updateHeader("location", v)} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-700">Image Section</p>
          <p className="mt-0.5 text-xs text-slate-500">If the selected template/PDF design supports profile image, it will be shown in preview and export.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="h-20 w-20 overflow-hidden rounded-lg border border-slate-300 bg-white">
              {data.header.photo ? (
                <img src={data.header.photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-[10px] font-semibold text-slate-400">NO IMAGE</div>
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => actions.handlePhotoUpload(event.target.files?.[0])}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => actions.updateHeader("photo", "")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Remove
            </button>
          </div>
        </div>

        {showColorPicker ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-700">Template Color</p>
            <p className="mt-0.5 text-xs text-slate-500">Choose one of the default colors or set a custom color.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {colorPresets.accent.map((color) => {
                const isActive = (actions.designSettings?.accentColor || "").toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => actions.setDesignSettings((prev) => ({ ...prev, accentColor: color }))}
                    className={`h-7 w-7 rounded-full border-2 transition ${isActive ? "border-slate-700" : "border-white/80 hover:border-slate-400"}`}
                    style={{ backgroundColor: color }}
                    title={color}
                    aria-label={`Select color ${color}`}
                  />
                );
              })}
              <label className="ml-1 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                Custom
                <input
                  type="color"
                  value={actions.designSettings?.accentColor || "#2563eb"}
                  onChange={(event) => actions.setDesignSettings((prev) => ({ ...prev, accentColor: event.target.value }))}
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
            </div>
          </div>
        ) : null}

        {showColorPicker ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-700">Background Colors</p>
            <p className="mt-0.5 text-xs text-slate-500">Change header, sidebar, and main background colors.</p>

            {[
              { key: "headerBgColor", label: "Header BG", fallback: "#1e2d3d" },
              { key: "sidebarBgColor", label: "Sidebar BG", fallback: "#f4f6f8" },
              { key: "mainBgColor", label: "Main BG", fallback: "#ffffff" }
            ].map((item) => (
              <div key={item.key} className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{item.label}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {colorPresets.background.map((color) => {
                    const current = String(actions.designSettings?.[item.key] || item.fallback).toLowerCase();
                    const isActive = current === color.toLowerCase();
                    return (
                      <button
                        key={`${item.key}-${color}`}
                        type="button"
                        onClick={() => actions.setDesignSettings((prev) => ({ ...prev, [item.key]: color }))}
                        className={`h-7 w-7 rounded-full border-2 transition ${isActive ? "border-slate-700" : "border-white/80 hover:border-slate-400"}`}
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`${item.label} ${color}`}
                      />
                    );
                  })}
                  <label className="ml-1 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                    Custom
                    <input
                      type="color"
                      value={actions.designSettings?.[item.key] || item.fallback}
                      onChange={(event) => actions.setDesignSettings((prev) => ({ ...prev, [item.key]: event.target.value }))}
                      className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {showColorPicker ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-700">Text Colors</p>
            <p className="mt-0.5 text-xs text-slate-500">Change primary, muted, and light text colors.</p>

            {[
              { key: "primaryTextColor", label: "Primary Text", fallback: "#1e2d3d" },
              { key: "mutedTextColor", label: "Muted Text", fallback: "#6b7a8d" },
              { key: "inverseTextColor", label: "Inverse Text", fallback: "#ffffff" }
            ].map((item) => (
              <div key={item.key} className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{item.label}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {colorPresets.text.map((color) => {
                    const current = String(actions.designSettings?.[item.key] || item.fallback).toLowerCase();
                    const isActive = current === color.toLowerCase();
                    return (
                      <button
                        key={`${item.key}-${color}`}
                        type="button"
                        onClick={() => actions.setDesignSettings((prev) => ({ ...prev, [item.key]: color }))}
                        className={`h-7 w-7 rounded-full border-2 transition ${isActive ? "border-slate-700" : "border-white/80 hover:border-slate-400"}`}
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`${item.label} ${color}`}
                      />
                    );
                  })}
                  <label className="ml-1 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                    Custom
                    <input
                      type="color"
                      value={actions.designSettings?.[item.key] || item.fallback}
                      onChange={(event) => actions.setDesignSettings((prev) => ({ ...prev, [item.key]: event.target.value }))}
                      className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (step === "experience") {
    return (
      <div className="space-y-4">
        {data.experience.map((item, index) => (
          <div key={index} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Experience #{index + 1}</p>
              <button
                type="button"
                onClick={() => actions.removeExperience(index)}
                disabled={data.experience.length === 1}
                className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                - Remove
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Job Title" value={item.jobTitle} onChange={(v) => actions.updateExperience(index, "jobTitle", v)} />
              <Input label="Employer" value={item.employer} onChange={(v) => actions.updateExperience(index, "employer", v)} />
              <Input label="City" value={item.city} onChange={(v) => actions.updateExperience(index, "city", v)} />
              <Input label="Country" value={item.country} onChange={(v) => actions.updateExperience(index, "country", v)} />
              <Input label="Start Date" value={item.startDate} onChange={(v) => actions.updateExperience(index, "startDate", v)} />
              <Input label="End Date" value={item.endDate} onChange={(v) => actions.updateExperience(index, "endDate", v)} disabled={item.currentlyWorking} />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.currentlyWorking} onChange={(e) => actions.updateExperience(index, "currentlyWorking", e.target.checked)} />
              Currently Working
            </label>
            <ExperienceBulletComposer
              jobTitle={item.jobTitle}
              value={item.bullets}
              onChange={(v) => actions.updateExperience(index, "bullets", v)}
            />
          </div>
        ))}
        <button onClick={actions.addExperience} className="rounded-lg border border-dashed border-brand-400 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          + Add More Experience
        </button>
      </div>
    );
  }

  if (step === "education") {
    return (
      <div className="space-y-4">
        {data.education.map((item, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Education #{index + 1}</p>
              <button
                type="button"
                onClick={() => actions.removeEducation(index)}
                disabled={data.education.length === 1}
                className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                - Remove
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input label="School Name" value={item.institution || ""} onChange={(v) => actions.updateEducation(index, "institution", v)} />
              <Input label="School Location" value={item.city || ""} onChange={(v) => actions.updateEducation(index, "city", v)} />

              <label className="text-sm font-semibold text-slate-700">
                Degree
                <select
                  value={item.degree || ""}
                  onChange={(event) => actions.updateEducation(index, "degree", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-normal outline-none focus:border-brand-500"
                >
                  <option value="">Select degree</option>
                  {DEGREE_OPTIONS.map((degree) => (
                    <option key={degree} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label="Field of Study"
                value={item.fieldOfStudy || item.country || ""}
                onChange={(v) => {
                  actions.updateEducation(index, "fieldOfStudy", v);
                  actions.updateEducation(index, "country", v);
                }}
              />

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Graduation Date</label>
                <div className="mt-1 grid gap-3 sm:grid-cols-2">
                  <select
                    value={splitMonthYear(item.endDate).month}
                    onChange={(event) =>
                      actions.updateEducation(
                        index,
                        "endDate",
                        composeMonthYear(event.target.value, splitMonthYear(item.endDate).year)
                      )
                    }
                    disabled={item.currentlyStudying}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-brand-500 disabled:opacity-60"
                  >
                    <option value="">Month</option>
                    {MONTH_OPTIONS.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={splitMonthYear(item.endDate).year}
                    onChange={(event) =>
                      actions.updateEducation(
                        index,
                        "endDate",
                        composeMonthYear(splitMonthYear(item.endDate).month, event.target.value)
                      )
                    }
                    disabled={item.currentlyStudying}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-brand-500 disabled:opacity-60"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 70 }, (_, i) => String(1990 + i)).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={item.currentlyStudying} onChange={(e) => actions.updateEducation(index, "currentlyStudying", e.target.checked)} />
              I&apos;m still enrolled
            </label>

            <EducationDetailComposer
              value={item.details || ""}
              onChange={(v) => actions.updateEducation(index, "details", v)}
            />
          </div>
        ))}
        <button onClick={actions.addEducation} className="rounded-lg border border-dashed border-brand-400 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          + Add More Education
        </button>
      </div>
    );
  }

  if (step === "skills") {
    return <SkillsComposer value={data.skills.primarySkills} onChange={actions.updateSkills} />;
  }

  if (step === "summary") {
    return <SummaryComposer value={data.summary.text} onChange={actions.updateSummary} />;
  }

  if (step === "additional") {
    return <AdditionalSectionsEditor additional={data.additional} onChange={actions.updateAdditional} />;
  }

  return <FinalizeReviewPanel data={data} actions={actions} />;
}

function FinalizeReviewPanel({ data, actions }) {
  const previewData = actions.previewData || data;
  const qualityReport = actions.qualityReport || { score: 0, checks: [], blockingCount: 0 };

  const reviewItems = [
    { key: "resume_sections", label: "Resume sections", done: isHeaderComplete(data) && isExperienceComplete(data) && isEducationComplete(data) },
    { key: "templates", label: "Templates", done: Boolean(actions.selectedTemplateId) },
    { key: "design", label: "Design & formatting", done: Boolean(actions.designSettings?.accentColor) },
    { key: "professional_quality", label: "Professional quality", done: qualityReport.score >= 80 && qualityReport.blockingCount <= 2 },
    { key: "spelling", label: "Spelling & grammar", done: true },
    { key: "share", label: "Share, save, print", done: true }
  ];

  const jumpLinks = [
    ["Heading", "header"],
    ["Summary", "summary"],
    ["Skills", "skills"],
    ["Experience", "experience"],
    ["Education and Training", "education"],
    ["Additional", "additional"]
  ];

  return (
    <div className="grid gap-4 rounded-2xl bg-[#1d2a61] p-4 text-white xl:grid-cols-[260px,minmax(0,1fr),280px]">
      <aside className="rounded-xl bg-[#192454] p-4">
        {actions.finalizeFocus === "resume_sections" ? (
          <>
            <h3 className="text-3xl font-extrabold">Resume sections</h3>
            <div className="mt-4 space-y-2">
              {jumpLinks.map(([label, key]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => actions.goToStep(key)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-semibold hover:bg-white/10"
                >
                  <span>{label}</span>
                  <span className="text-xs text-cyan-200">Edit</span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {actions.finalizeFocus === "templates" ? (
          <>
            <h3 className="text-3xl font-extrabold">Templates</h3>
            <div className="mt-4 grid max-h-[640px] grid-cols-2 gap-2 overflow-auto pr-1">
              {resumeTemplates.map((template) => {
                const active = template.id === actions.selectedTemplateId;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => actions.selectTemplate(template.id)}
                    className={`overflow-hidden rounded-lg border p-1 ${
                      active ? "border-brand-400 ring-2 ring-brand-400/40" : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <div className="h-24">
                      <TemplateThumbnail template={template} className="h-full w-full" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {actions.finalizeFocus === "design" ? (
          <>
            <h3 className="text-3xl font-extrabold">Design & formatting</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold">Font Style</label>
              <select
                value={actions.designSettings?.fontStyle || "inter"}
                onChange={(event) =>
                  actions.setDesignSettings((prev) => ({ ...prev, fontStyle: event.target.value }))
                }
                className="w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm"
              >
                {FONT_STYLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="text-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>

              <RangeControl
                label="Font Size"
                min={9}
                max={14}
                step={1}
                value={actions.designSettings?.fontSize || 11}
                suffix="pt"
                onChange={(value) => actions.setDesignSettings((prev) => ({ ...prev, fontSize: value }))}
              />

              <RangeControl
                label="Heading Size"
                min={26}
                max={44}
                step={1}
                value={actions.designSettings?.headingSize || 34}
                suffix="px"
                onChange={(value) => actions.setDesignSettings((prev) => ({ ...prev, headingSize: value }))}
              />

              <RangeControl
                label="Section Spacing"
                min={10}
                max={30}
                step={1}
                value={actions.designSettings?.sectionSpacing || 18}
                suffix="px"
                onChange={(value) => actions.setDesignSettings((prev) => ({ ...prev, sectionSpacing: value }))}
              />

              <RangeControl
                label="Paragraph Spacing"
                min={2}
                max={16}
                step={1}
                value={actions.designSettings?.paragraphSpacing || 8}
                suffix="px"
                onChange={(value) => actions.setDesignSettings((prev) => ({ ...prev, paragraphSpacing: value }))}
              />

              <RangeControl
                label="Line Spacing"
                min={1.1}
                max={2}
                step={0.05}
                value={actions.designSettings?.lineSpacing || 1.45}
                suffix="x"
                onChange={(value) => actions.setDesignSettings((prev) => ({ ...prev, lineSpacing: value }))}
              />

              <RangeControl
                label="Side Margins"
                min={10}
                max={40}
                step={1}
                value={actions.designSettings?.sideMargin || 24}
                suffix="px"
                onChange={(value) => actions.setDesignSettings((prev) => ({ ...prev, sideMargin: value }))}
              />

              <RangeControl
                label="Paragraph Indent"
                min={0}
                max={40}
                step={1}
                value={actions.designSettings?.paragraphIndent || 0}
                suffix="px"
                onChange={(value) => actions.setDesignSettings((prev) => ({ ...prev, paragraphIndent: value }))}
              />

              <label className="block text-sm font-semibold">Accent color</label>
              <input
                type="color"
                value={actions.designSettings?.accentColor || "#2563eb"}
                onChange={(event) =>
                  actions.setDesignSettings((prev) => ({ ...prev, accentColor: event.target.value }))
                }
                className="h-12 w-full cursor-pointer rounded border border-white/20 bg-transparent p-1"
              />
              <p className="text-xs text-slate-200">Changes are applied live to center resume and PDF export.</p>
            </div>
          </>
        ) : null}
      </aside>

      <section className="min-w-0 rounded-xl bg-white p-3 text-slate-900">
        <div className="mx-auto max-w-[760px] overflow-auto">
          <DesignableResumePreview
            selectedTemplate={actions.selectedTemplate}
            resumeData={previewData}
            designSettings={actions.designSettings}
          />
        </div>
      </section>

      <aside className="rounded-xl bg-[#192454] p-4">
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Professional Score</p>
          <p className="mt-1 text-3xl font-extrabold text-white">{qualityReport.score}/100</p>
          <p className="mt-1 text-xs text-slate-300">
            {qualityReport.blockingCount ? `${qualityReport.blockingCount} item(s) need attention.` : "Resume is in strong shape for export."}
          </p>
        </div>
        <h3 className="text-3xl font-extrabold">Review checklist</h3>
        <div className="mt-4 space-y-2">
          {reviewItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (["resume_sections", "templates", "design"].includes(item.key)) {
                  actions.setFinalizeFocus(item.key);
                }
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                actions.finalizeFocus === item.key ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <span>{item.label}</span>
              <span className={item.done ? "text-emerald-300" : "text-amber-300"}>{item.done ? "OK" : "Pending"}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Quality Checks</p>
          <div className="mt-2 space-y-2">
            {(qualityReport.checks || []).map((check) => (
              <div key={check.key} className="flex items-start justify-between gap-2 rounded bg-white/5 px-2 py-1.5">
                <p className="text-xs text-slate-100">{check.label}</p>
                <span className={`shrink-0 text-[11px] font-semibold ${check.status === "ok" ? "text-emerald-300" : "text-amber-300"}`}>
                  {check.status === "ok" ? "OK" : "Fix"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function RangeControl({ label, min, max, step, value, suffix, onChange }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        <span>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-emerald-300"
      />
    </label>
  );
}

function ExperienceBulletComposer({ jobTitle, value, onChange }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = String(query || jobTitle || "").trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return EXPERIENCE_PHRASE_LIBRARY.slice(0, 8);
    }

    const filtered = EXPERIENCE_PHRASE_LIBRARY.filter((item) => {
      const tags = item.tags.join(" ").toLowerCase();
      return tags.includes(normalizedQuery) || item.text.toLowerCase().includes(normalizedQuery);
    });

    return (filtered.length ? filtered : EXPERIENCE_PHRASE_LIBRARY).slice(0, 12);
  }, [normalizedQuery]);

  function addPhrase(phrase) {
    const lines = splitBullets(value);
    if (lines.includes(phrase)) return;
    onChange([...lines, phrase].join("\n"));
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-700">Experience Highlights</p>
      <p className="mt-0.5 text-xs text-slate-500">Select ready phrases or write your own.</p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <label className="block text-xs font-semibold text-slate-600">Search by Job Title / Keyword</label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={jobTitle ? `Try: ${jobTitle}` : "e.g. Front End Developer"}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />

          <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
            {suggestions.map((item, index) => (
              <div key={`${item.text}-${index}`} className="flex items-start gap-2 rounded-lg border border-slate-200 p-2">
                <button
                  type="button"
                  onClick={() => addPhrase(item.text)}
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-amber-300 bg-amber-100 text-lg font-bold text-amber-700 hover:bg-amber-200"
                  title="Add phrase"
                >
                  +
                </button>
                <p className="text-sm text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <label className="block rounded-lg border border-slate-200 bg-white p-3">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Description Bullets</span>
          <RichTextEditor
            value={value}
            onChange={(nextValue) => onChange(nextValue)}
            placeholder="Add ready-to-use phrases or write your own. One bullet per line."
            mode="bullets"
            minHeight={220}
          />
          <span className="mt-1 block text-xs text-slate-500">One bullet per line</span>
        </label>
      </div>
    </div>
  );
}

function EducationDetailComposer({ value, onChange }) {
  const [open, setOpen] = useState(true);
  const selected = useMemo(() => splitBullets(value), [value]);

  function addPhrase(phrase) {
    const lines = splitBullets(value);
    if (lines.includes(phrase)) return;
    onChange([...lines, phrase].join("\n"));
  }

  function removePhrase(phrase) {
    const lines = splitBullets(value).filter((line) => line !== phrase);
    onChange(lines.join("\n"));
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-slate-700">Add education details</span>
        <span className="text-base font-bold text-slate-500">{open ? "⌃" : "⌄"}</span>
      </button>

      {open ? (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="max-h-64 space-y-2 overflow-auto pr-1">
              {EDUCATION_DETAIL_LIBRARY.map((item, index) => {
                const isAdded = selected.includes(item);
                return (
                  <div key={`${item}-${index}`} className="flex items-start gap-2 rounded-lg border border-slate-200 p-2">
                    <button
                      type="button"
                      onClick={() => (isAdded ? removePhrase(item) : addPhrase(item))}
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-lg font-bold ${
                        isAdded ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-amber-200 text-amber-800 hover:bg-amber-300"
                      }`}
                      title={isAdded ? "Remove phrase" : "Add phrase"}
                    >
                      {isAdded ? "-" : "+"}
                    </button>
                    <p className={`text-sm ${isAdded ? "text-slate-500" : "text-slate-700"}`}>{item}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <label className="block rounded-lg border border-slate-200 bg-white p-3">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Education Notes</span>
            <RichTextEditor
              value={value}
              onChange={(nextValue) => onChange(nextValue)}
              placeholder="Add achievements, honors, thesis, clubs, projects."
              mode="bullets"
              minHeight={260}
            />
            <span className="mt-2 block text-xs text-slate-600">
              Pro tip: details like honors, clubs, and research projects show growth.
            </span>
          </label>
        </div>
      ) : null}
    </div>
  );
}

function SkillsComposer({ value, onChange }) {
  const [query, setQuery] = useState("");
  const selectedSkills = useMemo(() => splitByCommaOrLine(value), [value]);
  const normalizedQuery = String(query || "").trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return SKILL_LIBRARY;
    const filtered = SKILL_LIBRARY.filter((item) => item.toLowerCase().includes(normalizedQuery));
    return filtered.length ? filtered : SKILL_LIBRARY;
  }, [normalizedQuery]);

  function addSkill(skill) {
    if (selectedSkills.includes(skill)) return;
    onChange([...selectedSkills, skill].join(", "));
  }

  function removeSkill(skill) {
    onChange(selectedSkills.filter((item) => item !== skill).join(", "));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-700">We recommend including 6-8 skills</p>
      <p className="mt-0.5 text-xs text-slate-500">Select skills with + and remove with -.</p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <label className="block text-xs font-semibold text-slate-600">Search by keyword</label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. frontend, communication, testing"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />

          <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
            {suggestions.map((skill) => {
              const selected = selectedSkills.includes(skill);
              return (
                <div key={skill} className="flex items-center justify-between rounded-full border border-slate-200 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => (selected ? removeSkill(skill) : addSkill(skill))}
                    className={`grid h-7 w-7 place-items-center rounded-full border text-lg font-bold ${
                      selected
                        ? "border-rose-300 bg-rose-100 text-rose-700 hover:bg-rose-200"
                        : "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                    title={selected ? "Remove skill" : "Add skill"}
                  >
                    {selected ? "-" : "+"}
                  </button>
                  <p className={`text-sm ${selected ? "text-slate-400 line-through" : "text-slate-700"}`}>{skill}</p>
                </div>
              );
            })}
          </div>
        </div>

        <label className="block rounded-lg border border-slate-200 bg-white p-3">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Selected Skills</span>
          <RichTextEditor
            value={selectedSkills.join("\n")}
            onChange={(nextValue) => onChange(splitByCommaOrLine(nextValue).join(", "))}
            placeholder="Selected skills appear here. One per line."
            mode="bullets"
            minHeight={220}
          />
          <span className="mt-1 block text-xs text-slate-500">You can also type custom skills manually.</span>
        </label>
      </div>
    </div>
  );
}

function SummaryComposer({ value, onChange }) {
  function addSummary(text) {
    const current = String(value || "").trim();
    if (!current) {
      onChange(text);
      return;
    }
    if (current.includes(text)) return;
    onChange(`${current}\n\n${text}`);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-700">Craft your summary</p>
      <p className="mt-0.5 text-xs text-slate-500">Start with a prewritten option or write your own. Edit as needed.</p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="max-h-[440px] space-y-2 overflow-auto rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold text-slate-600">Prewritten options</p>
          {SUMMARY_LIBRARY.map((item) => (
            <div key={item.title} className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3">
              <span className="inline-flex rounded border border-indigo-400 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                Personalized for you
              </span>
              <p className="mt-2 text-sm font-bold text-slate-800">{item.title}</p>
              <p className="mt-1 text-sm text-slate-700">{item.text}</p>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => addSummary(item.text)}
                  className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-200"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>

        <label className="block rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2">
            <span className="text-sm font-semibold text-slate-700">Summary Editor</span>
          </div>
          <RichTextEditor
            value={value}
            onChange={(nextValue) => onChange(nextValue)}
            placeholder="Enter summary text here"
            mode="paragraph"
            minHeight={320}
            showEnhance
          />
          <span className="mt-1 block text-xs text-slate-500">You can fully edit or overwrite the text manually.</span>
        </label>
      </div>
    </div>
  );
}

function AdditionalSectionsEditor({ additional, onChange }) {
  const sections = getAdditionalSections(additional);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPresetKeys, setSelectedPresetKeys] = useState([]);
  const [customSectionName, setCustomSectionName] = useState("");
  const [editingSection, setEditingSection] = useState(null);

  function updateSections(nextSections) {
    onChange("sections", nextSections);
  }

  function togglePreset(key) {
    setSelectedPresetKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }

  function handleAddSections() {
    const existingTitles = new Set(sections.map((section) => String(section.title || "").trim().toLowerCase()));
    const nextSections = [...sections];

    selectedPresetKeys.forEach((key) => {
      const preset = ADDITIONAL_PRESET_SECTIONS.find((item) => item.key === key);
      if (!preset) return;
      const normalizedTitle = preset.title.toLowerCase();
      if (existingTitles.has(normalizedTitle)) return;
      existingTitles.add(normalizedTitle);
      nextSections.push({
        id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: preset.title,
        items: [...preset.defaultItems]
      });
    });

    const customTitle = String(customSectionName || "").trim();
    if (customTitle && !existingTitles.has(customTitle.toLowerCase())) {
      nextSections.push({
        id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: customTitle,
        items: [""]
      });
    }

    updateSections(nextSections);
    setSelectedPresetKeys([]);
    setCustomSectionName("");
    setIsAddModalOpen(false);
  }

  function handleDeleteSection(sectionId) {
    updateSections(sections.filter((section) => section.id !== sectionId));
  }

  function openEditSection(section, withNewLine = false) {
    const items = Array.isArray(section.items) ? [...section.items] : [];
    if (withNewLine) items.push("");
    setEditingSection({
      id: section.id,
      title: section.title || "",
      items: items.length ? items : [""]
    });
  }

  function handleSaveEditSection() {
    if (!editingSection) return;
    const cleaned = {
      ...editingSection,
      title: String(editingSection.title || "").trim() || "Additional Section",
      items: editingSection.items.map((item) => String(item || "").trim()).filter(Boolean)
    };
    updateSections(sections.map((section) => (section.id === cleaned.id ? cleaned : section)));
    setEditingSection(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-slate-900">Add details that show you are well-rounded</p>
          <p className="text-sm text-slate-600">Add sections, edit content, and include them in resume preview.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-full border border-amber-300 bg-amber-100 px-5 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200"
        >
          + Add section
        </button>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        {sections.length ? (
          sections.map((section) => (
            <article key={section.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="p-4">
                <h4 className="text-xl font-bold text-slate-900">{section.title || "Additional Section"}</h4>
                {Array.isArray(section.items) && section.items.some((item) => String(item || "").trim()) ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {section.items.filter((item) => String(item || "").trim()).map((item, index) => (
                      <li key={`${section.id}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No details added yet.</p>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2">
                <p className="text-sm text-emerald-700">Looks good</p>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button type="button" onClick={() => openEditSection(section, true)} className="text-indigo-600 hover:text-indigo-800">
                    Add
                  </button>
                  <button type="button" onClick={() => openEditSection(section)} className="text-indigo-600 hover:text-indigo-800">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDeleteSection(section.id)} className="text-rose-600 hover:text-rose-800">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No additional sections yet. Click "+ Add section" to start.
          </div>
        )}
      </div>

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-4xl font-extrabold">Add sections</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
              >
                X
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {ADDITIONAL_PRESET_SECTIONS.map((preset) => {
                const checked = selectedPresetKeys.includes(preset.key);
                return (
                  <button
                    type="button"
                    key={preset.key}
                    onClick={() => togglePreset(preset.key)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-xl font-semibold ${
                      checked ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="grid h-6 w-6 place-items-center rounded border border-slate-400 text-sm">
                      {checked ? "x" : ""}
                    </span>
                    <span>{preset.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4">
              <label className="block text-sm font-semibold text-slate-700">New custom section</label>
              <input
                value={customSectionName}
                onChange={(event) => setCustomSectionName(event.target.value)}
                placeholder="e.g. Publications, Projects, Achievements"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="mt-7 flex items-center justify-between">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-2xl font-bold text-brand-600 hover:text-brand-700">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSections}
                className="rounded-full bg-brand-600 px-10 py-3 text-2xl font-bold text-white hover:bg-brand-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingSection ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-5xl font-extrabold">{editingSection.title || "Edit Section"}</h3>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
              >
                X
              </button>
            </div>
            <p className="mb-4 text-3xl text-slate-700">Edit title and details for this section.</p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 block text-3xl font-bold text-slate-900">
                Section Title
              </label>
              <input
                value={editingSection.title}
                onChange={(event) => setEditingSection((prev) => ({ ...prev, title: event.target.value }))}
                className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-xl outline-none focus:border-brand-500"
              />

              <div className="space-y-2">
                {editingSection.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={item}
                      onChange={(event) =>
                        setEditingSection((prev) => {
                          const next = [...prev.items];
                          next[index] = event.target.value;
                          return { ...prev, items: next };
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xl outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSection((prev) => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== index)
                        }))
                      }
                      className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                      title="Delete row"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setEditingSection((prev) => ({ ...prev, items: [...prev.items, ""] }))}
                className="mt-4 text-3xl font-bold text-brand-600 hover:text-brand-700"
              >
                + Add another
              </button>
            </div>

            <div className="mt-7 flex items-center justify-between">
              <button type="button" onClick={() => setEditingSection(null)} className="text-2xl font-bold text-brand-600 hover:text-brand-700">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditSection}
                className="rounded-full bg-brand-600 px-10 py-3 text-2xl font-bold text-white hover:bg-brand-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RichTextEditor({ value, onChange, placeholder = "", mode = "paragraph", minHeight = 220, showEnhance = false }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const node = editorRef.current;
    if (!node) return;
    const next = normalizeRichValue(value, mode);
    if (node.innerHTML !== next) {
      node.innerHTML = next;
    }
  }, [value, mode]);

  function exec(command) {
    const node = editorRef.current;
    if (!node) return;
    node.focus();
    document.execCommand(command, false, null);
    onChange(node.innerHTML);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <div className="flex items-center justify-between border-b border-slate-300 bg-slate-50 px-2 py-1.5">
        <div className="flex items-center gap-1">
          <ToolbarButton label="B" onClick={() => exec("bold")} />
          <ToolbarButton label="I" onClick={() => exec("italic")} />
          <ToolbarButton label="U" onClick={() => exec("underline")} />
          <ToolbarButton label="List" onClick={() => exec("insertUnorderedList")} />
          <ToolbarButton label="Undo" onClick={() => exec("undo")} />
          <ToolbarButton label="Redo" onClick={() => exec("redo")} />
        </div>
        {showEnhance ? (
          <button
            type="button"
            disabled
            className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
            title="Enhance with AI (coming soon)"
          >
            Enhance with AI
          </button>
        ) : null}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="w-full px-3 py-2 text-sm outline-none"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
}

function ToolbarButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
    >
      {label}
    </button>
  );
}

function normalizeRichValue(value, mode) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.includes("<")) return raw;

  const lines = raw.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (!lines.length) return "";

  if (mode === "bullets") {
    return `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
  }

  return `<p>${lines.map((line) => escapeHtml(line)).join("<br/>")}</p>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function Input({ label, value, onChange, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 disabled:bg-slate-100"
      />
    </label>
  );
}

