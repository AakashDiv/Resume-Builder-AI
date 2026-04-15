import { useMemo, useState } from "react";

export default function TemplateThumbnail({ template, className = "h-full w-full" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const category = (template?.category || "Simple").toLowerCase();
  const templateId = String(template?.id || "template");
  const thumbnailFile = String(template?.thumbnailImage || `${templateId}.png`);
  const thumbnailSrc = useMemo(() => `/resume-thumbnails/${thumbnailFile}`, [thumbnailFile]);

  return (
    <div className={`overflow-hidden rounded-sm border border-slate-300 bg-white shadow-lg ${className}`}>
      {!imageFailed ? (
        <img
          src={thumbnailSrc}
          alt={`${template?.name || "Template"} thumbnail`}
          className=" object-cover"
          onError={() => setImageFailed(true)}
          loading="lazy"
        />
      ) : (
        <FallbackThumb category={category} />
      )}
    </div>
  );
}

function FallbackThumb({ category }) {
  if (category === "creative") {
    return <div className="h-full w-full bg-gradient-to-br from-amber-200 to-rose-100" />;
  }
  if (category === "modern") {
    return <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-200" />;
  }
  return <div className="h-full w-full bg-gradient-to-br from-slate-200 to-white" />;
}
