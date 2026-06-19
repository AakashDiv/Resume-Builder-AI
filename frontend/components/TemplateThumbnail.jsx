import { useEffect, useRef, useState } from "react";
import DesignableResumePreview from "./ResumePdf/common/DesignableResumePreview.jsx";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  getTemplatePreviewDesignSettings,
  templatePreviewSampleData
} from "../utils/templatePreviewDefaults.js";

export default function TemplateThumbnail({
  template,
  className = "h-full w-full",
  fit = "contain",
  renderSource = "auto",
  previewMode = "thumbnail"
}) {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(0.202);
  const thumbnailImage = template?.thumbnailImage;

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const update = () => {
      const w = node.clientWidth;
      const h = node.clientHeight;
      if (w > 0 && h > 0) {
        const nextScale =
          fit === "cover"
            ? Math.max(w / A4_WIDTH_PX, h / A4_HEIGHT_PX)
            : fit === "width"
              ? w / A4_WIDTH_PX
              : Math.min(w / A4_WIDTH_PX, h / A4_HEIGHT_PX);
        setScale(Math.max(0.05, nextScale));
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [fit]);

  const designSettings = getTemplatePreviewDesignSettings(template);
  const shouldUseThumbnailImage = renderSource !== "live" && thumbnailImage;

  return (
    <div
      ref={wrapperRef}
      className={`grid place-items-center overflow-hidden rounded-sm border border-slate-200 bg-white shadow-md ${className}`}
    >
      {shouldUseThumbnailImage ? (
        <img
          src={thumbnailImage}
          alt={`${template.name} preview`}
          className={`h-full w-full ${fit === "cover" ? "object-cover object-top" : "object-contain"}`}
          draggable="false"
        />
      ) : (
        <div
          style={{
            width: `${A4_WIDTH_PX * scale}px`,
            height: `${A4_HEIGHT_PX * scale}px`,
            alignSelf: fit === "cover" || fit === "width" ? "start" : "center",
            overflow: "hidden",
            background: "#ffffff"
          }}
        >
          <div
            style={{
              transformOrigin: "top left",
              transform: `scale(${scale})`,
              width: `${A4_WIDTH_PX}px`,
              minHeight: `${A4_HEIGHT_PX}px`,
              background: "#ffffff",
              pointerEvents: "none",
              userSelect: "none"
            }}
          >
            <DesignableResumePreview
              selectedTemplate={template}
              resumeData={templatePreviewSampleData}
              designSettings={designSettings}
              mode={previewMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}
