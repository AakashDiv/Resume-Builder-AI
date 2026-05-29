export function AdditionalGrouped({ section }) {
  const { certifications = [], languages = [] } = section.data;

  return (
    <div className="resume-grouped-lines">
      {certifications.length ? (
        <p>
          <strong>Certifications:</strong> {certifications.join(", ")}
        </p>
      ) : null}
      {languages.length ? (
        <p>
          <strong>Languages:</strong> {languages.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

export function AdditionalList({ section }) {
  return (
    <ul className="resume-list">
      {section.data.items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}
