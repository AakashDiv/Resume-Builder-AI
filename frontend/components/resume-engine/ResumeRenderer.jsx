import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { A4, FONT_STACKS, PAGE_MARGIN_MM, TYPOGRAPHY_PRESETS } from "./constants.js";
import PageRenderer from "./PageRenderer.jsx";
import SectionRenderer from "./SectionRenderer.jsx";
import ResumeHeader from "./sections/ResumeHeader.jsx";
import { buildResumeSections, getResumeDensity } from "./utils/resumeContent.js";
import { resolveTemplate } from "./templates/templateRegistry.js";
import "./styles/resume-engine.css";

function toPx(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function chunkSections({ sections, sectionHeights, firstHeaderHeight, continuationHeaderHeight, contentHeight, gap }) {
  if (!sections.length) return [[]];

  const pages = [];
  let current = [];
  let used = firstHeaderHeight + gap;

  sections.forEach((section, index) => {
    const sectionHeight = Math.ceil(sectionHeights.get(section.id) || 0);
    const nextUsed = used + (current.length ? gap : 0) + sectionHeight;
    const pageHeaderHeight = pages.length ? continuationHeaderHeight + gap : firstHeaderHeight + gap;
    const canFit = nextUsed <= contentHeight || current.length === 0;

    if (!canFit) {
      pages.push(current);
      current = [section];
      used = continuationHeaderHeight + gap + sectionHeight;
      return;
    }

    current.push(section);
    used = nextUsed;

    if (index === sections.length - 1) {
      return;
    }

    if (used < pageHeaderHeight) {
      used = pageHeaderHeight;
    }
  });

  if (current.length) pages.push(current);
  return pages.length ? pages : [[]];
}

function splitSectionsForPagination(sections) {
  return sections.flatMap((section) => {
    if (section.type === "experience") {
      return section.data.experience.map((item, index) => ({
        ...section,
        id: `${section.id}-${index}`,
        groupId: section.id,
        canMergeTitle: true,
        title: index === 0 ? section.title : `${section.title} Continued`,
        data: { experience: [item] }
      }));
    }

    if (section.type === "education") {
      return section.data.education.map((item, index) => ({
        ...section,
        id: `${section.id}-${index}`,
        groupId: section.id,
        canMergeTitle: true,
        title: index === 0 ? section.title : `${section.title} Continued`,
        data: { education: [item] }
      }));
    }

    if (section.type === "projects") {
      return section.data.projects.map((item, index) => ({
        ...section,
        id: `${section.id}-${index}`,
        groupId: section.id,
        canMergeTitle: true,
        title: index === 0 ? section.title : `${section.title} Continued`,
        data: { projects: [item] }
      }));
    }

    return {
      ...section,
      groupId: section.id
    };
  });
}

function buildStyleVars({ template, designSettings, density }) {
  const typography = TYPOGRAPHY_PRESETS[density] || TYPOGRAPHY_PRESETS.balanced;
  const margins = PAGE_MARGIN_MM[density] || PAGE_MARGIN_MM.balanced;
  const fontScale = Math.max(0.92, Math.min(1.08, Number(designSettings?.fontSize || 11) / 11));
  const sectionSpacing = Number(designSettings?.sectionSpacing);
  const lineSpacing = Number(designSettings?.lineSpacing);
  const sideMargin = Number(designSettings?.sideMargin);

  return {
    "--resume-page-width": `${A4.widthMm}mm`,
    "--resume-page-height": `${A4.heightMm}mm`,
    "--resume-page-padding-top": `${margins.top}mm`,
    "--resume-page-padding-right": `${Number.isFinite(sideMargin) ? Math.max(12, Math.min(24, sideMargin * 0.72)) : margins.right}mm`,
    "--resume-page-padding-bottom": `${margins.bottom}mm`,
    "--resume-page-padding-left": `${Number.isFinite(sideMargin) ? Math.max(12, Math.min(24, sideMargin * 0.72)) : margins.left}mm`,
    "--resume-font-family": FONT_STACKS[designSettings?.fontStyle] || FONT_STACKS.inter,
    "--resume-name-size": `${Math.max(24, Math.min(34, Number(designSettings?.headingSize || typography.name)))}px`,
    "--resume-body-size": `${typography.body * fontScale}px`,
    "--resume-title-size": `${typography.title * fontScale}px`,
    "--resume-meta-size": `${typography.meta * fontScale}px`,
    "--resume-small-size": `${typography.small * fontScale}px`,
    "--resume-section-size": `${typography.section * fontScale}px`,
    "--resume-line-height": Number.isFinite(lineSpacing) ? Math.max(1.25, Math.min(1.65, lineSpacing)) : typography.lineHeight,
    "--resume-paragraph-line-height": typography.paragraphLineHeight,
    "--resume-section-gap": `${Number.isFinite(sectionSpacing) ? Math.max(7, Math.min(18, sectionSpacing * 0.62)) : typography.sectionGap}px`,
    "--resume-item-gap": `${typography.itemGap}px`,
    "--resume-bullet-gap": `${typography.bulletGap}px`,
    "--resume-accent": template.colors.accent,
    "--resume-header-bg": template.colors.headerBg,
    "--resume-surface": template.colors.surface,
    "--resume-text": template.colors.text,
    "--resume-muted": template.colors.muted,
    "--resume-subtle": template.colors.subtle,
    "--resume-border": template.colors.border,
    "--resume-inverse": template.colors.inverse
  };
}

export default function ResumeRenderer({
  selectedTemplate,
  resumeData,
  designSettings = {},
  mode = "preview",
  onPageCountChange
}) {
  const template = useMemo(() => resolveTemplate(selectedTemplate, designSettings), [selectedTemplate, designSettings]);
  const density = useMemo(() => getResumeDensity(resumeData), [resumeData]);
  const sections = useMemo(() => buildResumeSections(resumeData), [resumeData]);
  const paginationSections = useMemo(() => splitSectionsForPagination(sections), [sections]);
  const styleVars = useMemo(
    () => buildStyleVars({ template, designSettings, density }),
    [template, designSettings, density]
  );

  const measurePageRef = useRef(null);
  const measureFirstHeaderRef = useRef(null);
  const measureContinuationRef = useRef(null);
  const measureSectionRefs = useRef(new Map());
  const [pages, setPages] = useState(() => [paginationSections]);

  useLayoutEffect(() => {
    const measurePage = measurePageRef.current;
    if (!measurePage) {
      setPages([paginationSections]);
      return;
    }

    const inner = measurePage.querySelector(".resume-engine-page-inner");
    const flow = measurePage.querySelector(".resume-engine-flow");
    if (!inner || !flow) {
      setPages([paginationSections]);
      return;
    }

    const flowStyle = window.getComputedStyle(flow);
    const pageStyle = window.getComputedStyle(inner);
    const contentHeight =
      measurePage.getBoundingClientRect().height -
      toPx(pageStyle.paddingTop) -
      toPx(pageStyle.paddingBottom);
    const gap = toPx(flowStyle.gap || flowStyle.rowGap) || 0;
    const firstHeaderHeight = measureFirstHeaderRef.current?.getBoundingClientRect().height || 0;
    const continuationHeaderHeight = measureContinuationRef.current?.getBoundingClientRect().height || 0;
    const sectionHeights = new Map();

    paginationSections.forEach((section) => {
      const node = measureSectionRefs.current.get(section.id);
      if (node) {
        sectionHeights.set(section.id, node.getBoundingClientRect().height);
      }
    });

    const nextPages = chunkSections({
      sections: paginationSections,
      sectionHeights,
      firstHeaderHeight,
      continuationHeaderHeight,
      contentHeight,
      gap
    });

    setPages((previous) => {
      const prevKey = previous.map((page) => page.map((section) => section.id).join(",")).join("|");
      const nextKey = nextPages.map((page) => page.map((section) => section.id).join(",")).join("|");
      return prevKey === nextKey ? previous : nextPages;
    });
    onPageCountChange?.(nextPages.length);
  }, [paginationSections, styleVars, resumeData, onPageCountChange]);

  const visiblePages = pages.length ? pages : [paginationSections];

  return (
    <div
      className={`resume-engine-root resume-template-${template.id} resume-tone-${template.tone} resume-layout-${template.layout}`}
      style={styleVars}
      data-mode={mode}
      data-template-id={template.id}
      data-header-style={template.headerStyle}
      data-section-style={template.sectionStyle}
      data-skill-style={template.skillStyle}
    >
      <div className="resume-engine-pages">
        {visiblePages.map((pageSections, index) => (
          <PageRenderer
            key={`page-${index}-${pageSections.map((section) => section.id).join("-")}`}
            data={resumeData}
            template={template}
            sections={pageSections}
            pageIndex={index}
            totalPages={visiblePages.length}
          />
        ))}
      </div>

      <div className="resume-engine-measure" aria-hidden>
        <div className="resume-engine-page" ref={measurePageRef}>
          <div className="resume-engine-page-inner">
            <div ref={measureFirstHeaderRef}>
              <ResumeHeader data={resumeData} template={template} />
            </div>
            <div ref={measureContinuationRef} className="resume-continuation">
              <span>{resumeData?.header?.fullName || "Resume"}</span>
              <span>Page 2</span>
            </div>
            <main className="resume-engine-flow">
              {paginationSections.map((section, index) => {
                const previous = paginationSections[index - 1];
                const hideTitle = Boolean(previous && previous.groupId === section.groupId && section.canMergeTitle);
                return (
                <SectionRenderer
                  key={`measure-${section.id}`}
                  section={section}
                  hideTitle={hideTitle}
                  measureRef={(node) => {
                    if (node) measureSectionRefs.current.set(section.id, node);
                    else measureSectionRefs.current.delete(section.id);
                  }}
                />
                );
              })}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
