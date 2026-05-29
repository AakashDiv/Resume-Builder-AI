import RichText from "./RichText.jsx";

export default function ResumeSummary({ section }) {
  return <RichText value={section.data.summary} />;
}
