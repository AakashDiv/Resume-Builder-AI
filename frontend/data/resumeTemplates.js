export const resumeTemplates = [
  {
    id: "classic-pro",
    name: "Classic Pro",
    category: "Simple",
    accent: "#177ddc",
    thumbnailImage: "classic-pro.jpg"
  },
  {
    id: "modern-edge",
    name: "Modern Edge",
    category: "Modern",
    accent: "#0f766e",
    thumbnailImage: "Modern-Edge.jpg"
  },
  {
    id: "executive-lite",
    name: "Executive Lite",
    category: "Simple",
    accent: "#334155",
    thumbnailImage: "executive-lite.jpg"
  },
  {
    id: "creative-grid",
    name: "Creative Grid",
    category: "Creative",
    accent: "#7c3aed",
    thumbnailImage: "creative-grid.jpg"
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    category: "Simple",
    accent: "#2563eb",
    thumbnailImage: "minimal-clean.jpg"
  },
  {
    id: "simple-professional",
    name: "Simple Professional",
    category: "Simple",
    accent: "#2563a8",
    thumbnailImage: "simple-resume-1.jpg"
  },
  {
    id: "tech-focus",
    name: "Tech Focus",
    category: "Modern",
    accent: "#1e40af",
    thumbnailImage: "Tech-Focus.jpg"
  },
  {
    id: "modern-isabel",
    name: "Modern Isabel",
    category: "Modern",
    accent: "#e8a820",
    thumbnailImage: "Modern-Isabel.jpg"
  }
];

export function getTemplateById(templateId) {
  return resumeTemplates.find((item) => item.id === templateId) || resumeTemplates[0];
}
