export const resumeTemplates = [
  {
    id: "ats-friendly-resume-1",
    name: "ATS Friendly Resume 1",
    category: "ATS",
    accent: "#2e3d50",
    thumbnailImage: ""
  },
  {
    id: "ats-friendly-resume-2",
    name: "ATS Friendly Resume 2",
    category: "ATS",
    accent: "#000000",
    thumbnailImage: ""
  },
  {
    id: "ats-friendly-resume-3",
    name: "ATS Friendly Resume 3",
    category: "ATS",
    accent: "#8055a2",
    thumbnailImage: ""
  },
  {
    id: "ats-friendly-resume-4",
    name: "ATS Friendly Resume 4",
    category: "ATS",
    accent: "#1674ea",
    thumbnailImage: ""
  },
  {
    id: "ats-friendly-resume-5",
    name: "ATS Friendly Resume 5",
    category: "ATS",
    accent: "#111111",
    thumbnailImage: ""
  },
  {
    id: "ats-friendly-resume-6",
    name: "ATS Friendly Resume 6",
    category: "ATS",
    accent: "#6366f1",
    thumbnailImage: ""
  },
  {
    id: "ats-friendly-resume-7",
    name: "ATS Friendly Resume 7",
    category: "ATS",
    accent: "#2562a0",
    thumbnailImage: ""
  },
  {
    id: "ats-friendly-resume-8",
    name: "ATS Friendly Resume 8",
    category: "ATS",
    accent: "#0f6890",
    thumbnailImage: ""
  },
  {
    id: "ats-friendly-resume-9",
    name: "ATS Friendly Resume 9",
    category: "ATS",
    accent: "#df3527",
    thumbnailImage: ""
  },
  {
    id: "ats-friendly-resume-10",
    name: "ATS Friendly Resume 10",
    category: "ATS",
    accent: "#1557e6",
    thumbnailImage: ""
  },
  {
    id: "modern-professional-1",
    name: "Modern Professional 1",
    category: "Modern",
    accent: "#303b4d",
    thumbnailImage: "/resume-thumbnails/modern-professional-1.png"
  },
  {
    id: "modern-professional-2",
    name: "Modern Professional 2",
    category: "Modern",
    accent: "#173b5a",
    thumbnailImage: "/resume-thumbnails/modern-professional-2.png"
  },
  {
    id: "modern-professional-3",
    name: "Modern Professional 3",
    category: "Modern",
    accent: "#333c4c",
    thumbnailImage: "/resume-thumbnails/modern-professional-3.png"
  },
  {
    id: "modern-professional-4",
    name: "Modern Professional 4",
    category: "Modern",
    accent: "#173d5a",
    thumbnailImage: "/resume-thumbnails/modern-professional-4.png"
  },
  {
    id: "black-white-minimalist",
    name: "Black White Minimalist",
    category: "Minimalist",
    accent: "#323b4c",
    thumbnailImage: ""
  },
  {
    id: "white-black-modern-minimalist",
    name: "White Black Modern Minimalist",
    category: "Minimalist",
    accent: "#272929",
    thumbnailImage: ""
  },
  {
    id: "professional-cv",
    name: "Professional CV",
    category: "Creative",
    accent: "#2d2d2d",
    thumbnailImage: ""
  },
  {
    id: "creative-1",
    name: "Creative Resume 1",
    category: "Creative",
    accent: "#626465",
    thumbnailImage: ""
  },
  {
    id: "creative-2",
    name: "Creative Resume 2",
    category: "Creative",
    accent: "#444a4d",
    thumbnailImage: ""
  }
];

export function getTemplateById(templateId) {
  return resumeTemplates.find((item) => item.id === templateId) || resumeTemplates[0];
}
