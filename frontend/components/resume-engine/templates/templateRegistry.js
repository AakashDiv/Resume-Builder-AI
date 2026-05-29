const base = {
  id: "sharp-classic",
  name: "Sharp Classic",
  layout: "single",
  tone: "classic",
  headerStyle: "band",
  sectionStyle: "rule",
  skillStyle: "boxed",
  colors: {
    accent: "#1a2742",
    headerBg: "#1a2742",
    surface: "#ffffff",
    text: "#111827",
    muted: "#4b5563",
    subtle: "#f3f5f8",
    border: "#d8dee8",
    inverse: "#ffffff"
  }
};

export const resumeEngineTemplates = {
  "sharp-classic": base,
  "classic-pro": {
    ...base,
    id: "classic-pro",
    name: "Classic Pro",
    tone: "classic",
    headerStyle: "line",
    sectionStyle: "blue-rule",
    skillStyle: "boxed",
    colors: { ...base.colors, accent: "#177ddc", headerBg: "#ffffff", text: "#0f172a", border: "#177ddc" }
  },
  "executive-lite": {
    ...base,
    id: "executive-lite",
    name: "Executive Lite",
    tone: "executive",
    headerStyle: "line-centered",
    sectionStyle: "underline",
    skillStyle: "plain",
    colors: { ...base.colors, accent: "#334155", headerBg: "#ffffff", text: "#111827", muted: "#475569", border: "#94a3b8" }
  },
  "minimal-clean": {
    ...base,
    id: "minimal-clean",
    name: "Minimal Clean",
    tone: "minimal",
    headerStyle: "minimal",
    sectionStyle: "plain",
    skillStyle: "inline",
    colors: { ...base.colors, accent: "#111111", headerBg: "#ffffff", text: "#111111", muted: "#555555", subtle: "#ffffff", border: "#c8c8c8" }
  },
  "creative-grid": {
    ...base,
    id: "creative-grid",
    name: "Creative Grid",
    layout: "accent-rail",
    tone: "modern",
    headerStyle: "split",
    sectionStyle: "pill",
    skillStyle: "pill",
    colors: { ...base.colors, accent: "#7c3aed", headerBg: "#3f2a78", subtle: "#f5f3ff", border: "#d8b4fe" }
  },
  "simple-professional": {
    ...base,
    id: "simple-professional",
    name: "Simple Professional",
    tone: "professional",
    headerStyle: "line",
    sectionStyle: "accent-left",
    skillStyle: "boxed",
    colors: { ...base.colors, accent: "#2563a8", headerBg: "#ffffff", text: "#1a1a1a", muted: "#6b6b6b", border: "#2563a8" }
  },
  "modern-edge": {
    ...base,
    id: "modern-edge",
    name: "Modern Edge",
    tone: "modern",
    headerStyle: "band",
    sectionStyle: "accent-rule",
    skillStyle: "pill",
    colors: { ...base.colors, accent: "#0f766e", headerBg: "#1e2d3d", subtle: "#eef6f5", border: "#99d5ce" }
  },
  "tech-focus": {
    ...base,
    id: "tech-focus",
    name: "Tech Focus",
    layout: "soft-panel",
    tone: "technical",
    headerStyle: "band",
    sectionStyle: "tech",
    skillStyle: "boxed",
    colors: { ...base.colors, accent: "#1e40af", headerBg: "#1e2a38", subtle: "#f5f1eb", border: "#c9a96e" }
  },
  "modern-isabel": {
    ...base,
    id: "modern-isabel",
    name: "Modern Isabel",
    tone: "editorial",
    headerStyle: "editorial",
    sectionStyle: "gold-rule",
    skillStyle: "pill",
    colors: { ...base.colors, accent: "#e8a820", headerBg: "#2e2e2e", subtle: "#f7f7f5", border: "#e8a820" }
  },
  "professional-cv": {
    ...base,
    id: "professional-cv",
    name: "Professional CV",
    layout: "sidebar",
    tone: "classic",
    headerStyle: "sidebar",
    sectionStyle: "rule",
    skillStyle: "plain",
    colors: {
      ...base.colors,
      accent: "#2d2d2d",
      headerBg: "#2d2d2d",
      surface: "#ffffff",
      text: "#111827",
      muted: "#4b5563",
      subtle: "#2d2d2d",
      border: "#e2e8f0",
      inverse: "#ffffff"
    }
  }
};

export function resolveTemplate(selectedTemplate, designSettings = {}) {
  const id = String(selectedTemplate?.id || "sharp-classic");
  const template = resumeEngineTemplates[id] || resumeEngineTemplates["sharp-classic"];
  const isTemplateDefaultHeader =
    !designSettings.headerBgColor ||
    designSettings.headerBgColor === "#1e2d3d" ||
    designSettings.headerBgColor === "#1a1a1a";
  const isTemplateDefaultText =
    !designSettings.primaryTextColor ||
    designSettings.primaryTextColor === "#0f172a" ||
    designSettings.primaryTextColor === "#1a1a1a" ||
    designSettings.primaryTextColor === "#1e2d3d";
  const isTemplateDefaultMuted =
    !designSettings.mutedTextColor ||
    designSettings.mutedTextColor === "#64748b" ||
    designSettings.mutedTextColor === "#6b6b6b" ||
    designSettings.mutedTextColor === "#6b7a8d";
  const colors = {
    ...template.colors,
    accent: designSettings.accentColor || selectedTemplate?.accent || template.colors.accent,
    headerBg: isTemplateDefaultHeader ? template.colors.headerBg : designSettings.headerBgColor,
    surface: designSettings.mainBgColor || template.colors.surface,
    text: isTemplateDefaultText ? template.colors.text : designSettings.primaryTextColor,
    muted: isTemplateDefaultMuted ? template.colors.muted : designSettings.mutedTextColor,
    inverse: designSettings.inverseTextColor || template.colors.inverse
  };

  return { ...template, colors };
}
