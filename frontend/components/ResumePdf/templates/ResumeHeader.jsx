function cleanLinkedIn(url) {
  if (!url) return "";
  const match = String(url).match(/linkedin\.com\/in\/([^/?#\s]+)/i);
  return match ? `linkedin.com/in/${match[1]}` : url;
}

export default function ResumeHeader({ header = {}, additional = {} }) {
  const contacts = [
    header.phone,
    header.email,
    header.location,
    additional.linkedin ? cleanLinkedIn(additional.linkedin) : null,
    additional.portfolio || null,
  ].filter(Boolean);

  return (
    <header className="resume-header">
      <h1 className="name">{header.fullName || "Your Name"}</h1>
      {String(header.headline || "").trim() ? (
        <p className="headline">{header.headline}</p>
      ) : null}
      {contacts.length ? (
        <div className="contact-bar">
          {contacts.map((item, i) => (
            <span key={i} className="contact-item">{item}</span>
          ))}
        </div>
      ) : null}
    </header>
  );
}
