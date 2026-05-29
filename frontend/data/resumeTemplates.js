export const resumeTemplates = [
  {
    id: "professional-cv",
    name: "Professional CV",
    category: "Creative",
    accent: "#2d2d2d",
    thumbnailImage: ""
  }
];

export function getTemplateById(templateId) {
  return resumeTemplates.find((item) => item.id === templateId) || resumeTemplates[0];
}
