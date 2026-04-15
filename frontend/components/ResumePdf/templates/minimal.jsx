import ResumePreview from "./ResumePreview.jsx";

export default function MinimalTemplate({ data, templateId }) {
  return <ResumePreview data={data} variant="minimal" templateId={templateId} />;
}
