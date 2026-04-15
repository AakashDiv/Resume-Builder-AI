function joinWithPipe(values) {
  return values.filter(Boolean).join(" | ");
}

export default function ResumeHeader({ header = {}, additional = {} }) {
  const meta = joinWithPipe([
    header.phone,
    header.email,
    header.location,
    additional.linkedin,
    additional.portfolio
  ]);

  return (
    <header className="resume-header">
      <h1 className="name">{header.fullName || "Your Name"}</h1>
      <p className="headline">{header.headline || "Professional Title"}</p>
      <p className="meta-line">{meta || "Phone | Email | Location | LinkedIn"}</p>
    </header>
  );
}
