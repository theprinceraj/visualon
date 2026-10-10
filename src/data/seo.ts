// Structured data (schema.org JSON-LD). Base.astro always emits the organization + website; pages add their own nodes.
import { site, packages, media, type Film, type Project } from "./site";

type Node = Record<string, unknown>;

export const abs = (path: string, base: URL | string) => new URL(path, base).href;

export const orgId = (base: URL) => abs("/#org", base);

export function siteGraph(base: URL): Node[] {
  return [
    {
      "@type": "Organization",
      "@id": orgId(base),
      name: site.name,
      alternateName: site.alternateNames,
      url: abs("/", base),
      logo: abs("/logo.png", base),
      image: abs("/og.jpg", base),
      email: site.email,
      description: site.description,
      foundingDate: String(site.since),
      founder: { "@type": "Person", name: site.founder },
      ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
    },
    {
      "@type": "WebSite",
      "@id": abs("/#website", base),
      url: abs("/", base),
      name: site.name,
      alternateName: site.alternateNames,
      inLanguage: "en",
      publisher: { "@id": orgId(base) },
    },
  ];
}

export function breadcrumbs(base: URL, items: [name: string, path: string][]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"] as const, ...items].map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: abs(path, base),
    })),
  };
}

/** The fixed-price packages as a service with offers in both currencies. */
export function productionService(base: URL, name: string, description: string, path = "/"): Node {
  return {
    "@type": "Service",
    "@id": abs(`${path}#service`, base),
    name,
    description,
    serviceType: "Product video production",
    provider: { "@id": orgId(base) },
    areaServed: "Worldwide",
    url: abs(path, base),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${site.name} packages`,
      itemListElement: packages.flatMap((p) =>
        (["USD", "INR"] as const).map((c) => ({
          "@type": "Offer",
          name: `${p.name}: ${p.sub}`,
          description: `${p.includes.join(", ")}. Delivered in ${p.delivery}.`,
          price: p.price[c],
          priceCurrency: c,
          url: abs("/#packages", base),
          availability: "https://schema.org/InStock",
        })),
      ),
    },
  };
}

/** The project's main film, or with `f` one of its further films (same page, seeked with ?film=<id>&t=). */
export function video(base: URL, p: Project, f?: Film): Node {
  const v = f ?? p;
  const m = v.media[0];
  const dir = f ? `${p.slug}/${f.id}` : p.slug;
  const at = (t: number) => `/work/${p.slug}?${f ? `film=${f.id}&` : ""}t=${Math.floor(t)}`;
  return {
    "@type": "VideoObject",
    name: f ? `${p.title}, ${f.title}: ${f.logline}` : `${p.title}: ${p.logline}`,
    description: v.brief,
    thumbnailUrl: [abs(media(dir, m.ratio, "poster.jpg"), base)],
    contentUrl: abs(media(dir, m.ratio, "full.mp4"), base),
    uploadDate: `${v.date}T00:00:00+05:30`,
    duration: `PT${m.duration}S`,
    genre: p.tags.join(", "),
    inLanguage: "en",
    publisher: { "@id": orgId(base) },
    // Scenes become "key moments" in search. The work page seeks to ?t= on load.
    ...(v.story && {
      hasPart: v.story.scenes.map((s, i, all) => ({
        "@type": "Clip",
        name: s.title,
        startOffset: Math.floor(s.t),
        endOffset: Math.floor(all[i + 1]?.t ?? m.duration),
        url: abs(at(s.t), base),
      })),
    }),
  };
}

export type Faq = { q: string; a: string };

/** Answers may hold inline links; the schema gets the plain text. */
export const faqPage = (items: Faq[]): Node => ({
  "@type": "FAQPage",
  mainEntity: items.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") },
  })),
});

export const jsonLd = (graph: Node[]) =>
  JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
