const siteUrl = "https://saliahfoods.com";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Saliah Foods",
  url: siteUrl,
  logo: `${siteUrl}/assets/application-logo.png`,
  description:
    "Premium dates, date syrup, traditional wellness foods, honey blends, and natural preserves from Saliah Foods.",
  sameAs: [],
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Saliah Foods",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
