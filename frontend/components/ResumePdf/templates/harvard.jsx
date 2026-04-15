import ResumePreview from "./ResumePreview.jsx";

export default function HarvardTemplate({ data, templateId }) {
  return <ResumePreview data={data} variant="harvard" templateId={templateId} />;
}
