import { getHeaderContacts } from "../utils/resumeContent.js";

export default function ResumeHeader({ data, template, repeated = false }) {
  const contacts = getHeaderContacts(data);
  const fullName = data?.header?.fullName || "Your Name";
  const headline = data?.header?.headline || "";
  const style = template.headerStyle || "line";
  const useBand = ["band", "split", "editorial"].includes(style) && template.colors.headerBg !== "#ffffff";

  return (
    <header className={`resume-header resume-header--${style} ${useBand ? "resume-header--band" : "resume-header--line"}`}>
      <h1 className="resume-name">{fullName}</h1>
      {headline ? <p className="resume-headline">{headline}</p> : null}
      {!repeated && contacts.length ? (
        <div className="resume-contact-bar">
          {contacts.map((contact, index) => (
            <span className="resume-contact-item" key={`${contact}-${index}`}>
              {contact}
            </span>
          ))}
        </div>
      ) : null}
    </header>
  );
}
