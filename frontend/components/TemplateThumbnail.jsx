import { useEffect, useRef, useState } from "react";
import DesignableResumePreview from "./ResumePdf/common/DesignableResumePreview.jsx";
import { resumeEngineTemplates } from "./resume-engine/templates/templateRegistry.js";

const A4_WIDTH_PX = 794;

const SAMPLE_DATA = {
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
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California, Berkeley",
      fieldOfStudy: "Computer Science",
      city: "Berkeley",
      country: "CA",
      startDate: "Sep 2013",
      endDate: "May 2017",
      currentlyStudying: false,
      details: "Dean's List · GPA 3.8 · Capstone: Distributed Task Scheduler"
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
        items: ["AWS Certified Solutions Architect – Associate", "Google Cloud Professional Developer"]
      },
      {
        id: "languages",
        title: "Languages",
        items: ["English (Native)", "Spanish (Conversational)"]
      }
    ]
  }
};

export default function TemplateThumbnail({ template, className = "h-full w-full" }) {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(0.202);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const update = () => {
      const w = node.clientWidth;
      if (w > 0) setScale(w / A4_WIDTH_PX);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const templateId = String(template?.id || "");
  const engineTemplate = resumeEngineTemplates[templateId] || resumeEngineTemplates["sharp-classic"];
  const designSettings = {
    accentColor: engineTemplate.colors.accent,
    headerBgColor: engineTemplate.colors.headerBg,
    mainBgColor: engineTemplate.colors.surface,
    primaryTextColor: engineTemplate.colors.text,
    mutedTextColor: engineTemplate.colors.muted,
    inverseTextColor: engineTemplate.colors.inverse,
    fontStyle: "inter",
    fontSize: 11,
    headingSize: 34,
    sectionSpacing: 18,
    paragraphSpacing: 8,
    lineSpacing: 1.45
  };

  return (
    <div
      ref={wrapperRef}
      className={`overflow-hidden rounded-sm border border-slate-200 bg-white shadow-md ${className}`}
    >
      <div
        style={{
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          width: "210mm",
          minHeight: "297mm",
          background: "#ffffff",
          pointerEvents: "none",
          userSelect: "none"
        }}
      >
        <DesignableResumePreview
          selectedTemplate={template}
          resumeData={SAMPLE_DATA}
          designSettings={designSettings}
          mode="thumbnail"
        />
      </div>
    </div>
  );
}
