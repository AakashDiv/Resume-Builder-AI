import { useState } from "react";
import ResumeUploadModal from "./ResumeUploadModal.jsx";

/**
 * Reusable trigger button/card for the Resume Upload flow.
 * Renders children as a clickable wrapper that opens the upload modal.
 *
 * Props:
 *  - templateId?: string  — pre-select a template in builder after import
 *  - children: ReactNode  — custom button/label content
 *  - className?: string
 *  - style?: object
 *  - as?: "button"|"div"  — element type for the wrapper
 */
export default function ResumeUploadCard({ templateId, children, className, style, as: Tag = "button", ...rest }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tag
        type={Tag === "button" ? "button" : undefined}
        className={className}
        style={style}
        onClick={() => setOpen(true)}
        {...rest}
      >
        {children}
      </Tag>
      <ResumeUploadModal
        open={open}
        onClose={() => setOpen(false)}
        templateId={templateId}
      />
    </>
  );
}
