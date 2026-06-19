import { Helmet } from "react-helmet-async";

const SITE_NAME = "NightHire.ai";
const DEFAULT_DESCRIPTION = "Build ATS-friendly resumes, improve job applications, and search smarter with NightHire.ai.";

export default function Seo({
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image,
  type = "website",
  jsonLd
}) {
  const pageTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      {jsonLd ? (
        Array.isArray(jsonLd) ? (
          jsonLd.map((schema, i) => (
            <script key={i} type="application/ld+json">
              {JSON.stringify(schema)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        )
      ) : null}
    </Helmet>
  );
}
