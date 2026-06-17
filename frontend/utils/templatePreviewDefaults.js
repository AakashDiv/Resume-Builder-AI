import { resumeEngineTemplates } from "../components/resume-engine/templates/templateRegistry.js";

export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export const templatePreviewSampleData = {
  header: {
    fullName: "Alexandra Johnson",
    headline: "Senior Software Engineer",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    photo: ""
  },
  summary: {
    text: "Results-driven software engineer with 6+ years building scalable web applications. Passionate about clean code, performance optimization, and mentoring engineers to deliver impactful products."
  },
  experience: [
    {
      jobTitle: "Senior Software Engineer",
      employer: "TechCorp Inc.",
      city: "San Francisco",
      country: "CA",
      startDate: "Jan 2021",
      endDate: "",
      currentlyWorking: true,
      bullets: "Led migration of monolithic app to microservices, reducing latency by 40%.\nManaged and mentored a team of 5 engineers across 3 product squads.\nDelivered 12 major features on schedule with 99.8% uptime SLA."
    },
    {
      jobTitle: "Software Engineer",
      employer: "Startup Hub",
      city: "New York",
      country: "NY",
      startDate: "Jun 2018",
      endDate: "Dec 2020",
      currentlyWorking: false,
      bullets: "Built REST APIs serving 500K+ daily active users.\nReduced page load time by 35% through code splitting and lazy loading.\nImplemented CI/CD pipeline using GitHub Actions and Docker."
    },
    {
      jobTitle: "Junior Developer",
      employer: "Digital Agency Co.",
      city: "Austin",
      country: "TX",
      startDate: "Jul 2017",
      endDate: "May 2018",
      currentlyWorking: false,
      bullets: "Developed client-facing landing pages and marketing sites.\nCollaborated with designers to implement responsive layouts."
    }
  ],
  education: [
    {
      degree: "Bachelor of Science",
      institution: "University of California, Berkeley",
      fieldOfStudy: "Computer Science",
      city: "Berkeley",
      country: "CA",
      startDate: "Sep 2013",
      endDate: "May 2017",
      currentlyStudying: false,
      details: "Dean's List - GPA 3.8 - Capstone: Distributed Task Scheduler"
    }
  ],
  skills: {
    primarySkills: "React, TypeScript, Node.js, Python, PostgreSQL, Redis, Docker, AWS, Git, REST APIs"
  },
  additional: {
    linkedin: "linkedin.com/in/alexjohnson",
    portfolio: "alexjohnson.dev",
    certifications: "",
    languages: "",
    sections: [
      {
        id: "certifications_licenses",
        title: "Certifications & Licenses",
        items: ["AWS Certified Solutions Architect - Associate", "Google Cloud Professional Developer"]
      },
      {
        id: "languages",
        title: "Languages",
        items: ["English (Native)", "Spanish (Conversational)"]
      }
    ]
  }
};

const TEMPLATE_COLOR_DEFAULTS = {
  "creative-1": ["#626465", "#626465", "#626465", "#fbfbfa", "#66676a", "#66676a"],
  "creative-2": ["#444a4d", "#444a4d", "#f4f4f4", "#ffffff", "#4a4f52", "#6b7280"],
  "modern-professional-1": ["#303b4d", "#303b4d", "#e2e2e2", "#ffffff", "#313b4b", "#4b5563"],
  "modern-professional-2": ["#173b5a", "#173b5a", "#ffffff", "#ffffff", "#20272b", "#555555"],
  "modern-professional-3": ["#333c4c", "#333c4c", "#e4ebf3", "#ffffff", "#333c4c", "#737373"],
  "modern-professional-4": ["#173d5a", "#173d5a", "#173d5a", "#ffffff", "#183c58", "#555555"],
  "black-white-minimalist": ["#323b4c", "#323b4c", "#323b4c", "#ffffff", "#323846", "#747474"],
  "white-black-modern-minimalist": ["#272929", "#272929", "#272929", "#ffffff", "#3d3d3d", "#737373"],
  "ats-friendly-resume-1": ["#2e3d50", "#ffffff", "#ffffff", "#ffffff", "#2e3d50", "#475569"],
  "ats-friendly-resume-2": ["#000000", "#ffffff", "#ffffff", "#ffffff", "#000000", "#111827"],
  "ats-friendly-resume-3": ["#8055a2", "#ffffff", "#ffffff", "#ffffff", "#1e1e1e", "#334155"],
  "ats-friendly-resume-4": ["#1674ea", "#ffffff", "#ffffff", "#ffffff", "#1f2430", "#4b5563"],
  "ats-friendly-resume-5": ["#111111", "#ffffff", "#ffffff", "#ffffff", "#111111", "#4f4f4f"],
  "ats-friendly-resume-6": ["#6366f1", "#ffffff", "#ffffff", "#ffffff", "#1d1d1f", "#555555"],
  "ats-friendly-resume-7": ["#2562a0", "#d9edff", "#ffffff", "#ffffff", "#31343a", "#55575c"],
  "ats-friendly-resume-8": ["#0f6890", "#ffffff", "#ffffff", "#ffffff", "#000000", "#374151"],
  "ats-friendly-resume-9": ["#df3527", "#ffffff", "#ffffff", "#ffffff", "#3a3a3d", "#6f6f73"],
  "ats-friendly-resume-10": ["#1557e6", "#ffffff", "#ffffff", "#ffffff", "#171717", "#5d5d5d"],
  "professional-cv": ["#2d2d2d", "#2d2d2d", "#2d2d2d", "#ffffff", "#111827", "#4b5563"]
};

export function getTemplatePreviewDesignSettings(template) {
  const templateId = String(template?.id || "");
  const engineTemplate = resumeEngineTemplates[templateId] || resumeEngineTemplates["sharp-classic"];
  const fallback = [
    engineTemplate.colors.accent,
    engineTemplate.colors.headerBg,
    engineTemplate.colors.sidebar || "#f8fafc",
    engineTemplate.colors.surface,
    engineTemplate.colors.text,
    engineTemplate.colors.muted
  ];
  const [accentColor, headerBgColor, sidebarBgColor, mainBgColor, primaryTextColor, mutedTextColor] =
    TEMPLATE_COLOR_DEFAULTS[templateId] || fallback;

  return {
    accentColor: template?.accent || accentColor,
    headerBgColor,
    sidebarBgColor,
    mainBgColor,
    primaryTextColor,
    mutedTextColor,
    inverseTextColor: "#ffffff",
    fontStyle: "inter",
    fontSize: 11,
    headingSize: 34,
    sectionSpacing: 18,
    paragraphSpacing: 8,
    lineSpacing: 1.45,
    sideMargin: 24,
    paragraphIndent: 0
  };
}
