/**
 * JSON-LD structured data components for SEO and AI crawler readability.
 * Place these in server components to ensure they're in the initial HTML.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://zk-surfer-app-git-main-zkagi-team.vercel.app";

const ORGANIZATION = {
  "@type": "Organization",
  name: "ZkAGI",
  url: SITE_URL,
  logo: `${SITE_URL}/images/512x512.png`,
};

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", ...data }),
      }}
    />
  );
}

export function SoftwareApplicationJsonLd({
  name,
  description,
  category = "DeveloperApplication",
  price,
  priceCurrency = "USD",
}: {
  name: string;
  description: string;
  category?: string;
  price?: string;
  priceCurrency?: string;
}) {
  const data: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: category,
    operatingSystem: "Web",
    url: SITE_URL,
    provider: ORGANIZATION,
  };
  if (price !== undefined) {
    data.offers = {
      "@type": "Offer",
      price,
      priceCurrency,
    };
  }
  return <JsonLd data={data} />;
}

export function WebPageJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url?: string;
}) {
  return (
    <JsonLd
      data={{
        "@type": "WebPage",
        name,
        description,
        url: url || SITE_URL,
        provider: ORGANIZATION,
      }}
    />
  );
}

export function TechArticleJsonLd({
  name,
  description,
  proficiencyLevel = "Beginner",
}: {
  name: string;
  description: string;
  proficiencyLevel?: string;
}) {
  return (
    <JsonLd
      data={{
        "@type": "TechArticle",
        headline: name,
        description,
        proficiencyLevel,
        author: ORGANIZATION,
        publisher: ORGANIZATION,
      }}
    />
  );
}
