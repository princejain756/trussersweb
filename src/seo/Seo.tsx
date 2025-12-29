import { useEffect } from 'react';
import {
  BUSINESS,
  DEFAULT_DESCRIPTION,
  DEFAULT_LOGO_PATH,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_TITLE,
  SITE_NAME,
  getSiteUrl,
  toAbsoluteUrl,
  toCanonicalUrl,
} from './siteConfig';

type OgType = 'website' | 'article' | 'product';

type SeoProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: OgType;
  ogImage?: string;
  keywords?: string[] | string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

const MANAGED_ATTR = 'data-trusser-seo';

function removeManagedJsonLd() {
  document.head
    .querySelectorAll(`script[type="application/ld+json"][${MANAGED_ATTR}]`)
    .forEach((node) => node.remove());
}

function upsertMeta(selector: { name?: string; property?: string }, content: string) {
  const attrName = selector.name ? 'name' : 'property';
  const attrValue = selector.name ?? selector.property;
  if (!attrValue) return;

  const existing = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (existing) {
    existing.setAttribute('content', content);
    existing.setAttribute(MANAGED_ATTR, 'true');
    return;
  }

  const meta = document.createElement('meta');
  meta.setAttribute(attrName, attrValue);
  meta.setAttribute('content', content);
  meta.setAttribute(MANAGED_ATTR, 'true');
  document.head.appendChild(meta);
}

function upsertLink(selector: { rel: string }, attrs: Record<string, string>) {
  const rel = selector.rel;
  const existing = document.head.querySelector(`link[rel="${rel}"]`);
  const link = existing instanceof HTMLLinkElement ? existing : document.createElement('link');
  link.setAttribute('rel', rel);
  Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
  link.setAttribute(MANAGED_ATTR, 'true');
  if (!existing) {
    document.head.appendChild(link);
  }
}

function appendJsonLd(payload: unknown) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(payload);
  script.setAttribute(MANAGED_ATTR, 'true');
  document.head.appendChild(script);
}

function getDefaultJsonLd(pathname: string) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}${pathname}#webpage`,
        url: `${siteUrl}${pathname}`,
        name: DEFAULT_TITLE,
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Trussers',
        url: `${siteUrl}/`,
        logo: toAbsoluteUrl(DEFAULT_LOGO_PATH),
        sameAs: [BUSINESS.instagram],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: 'Trussers',
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/shop?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteUrl}/#localbusiness`,
        name: 'Trussers',
        url: `${siteUrl}/`,
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        address: {
          '@type': 'PostalAddress',
          ...BUSINESS.address,
        },
        areaServed: ['Bengaluru', 'Chickpet'],
      },
    ],
  } as const;
}

export function Seo({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage,
  keywords,
  noindex,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const resolvedTitle = title?.trim() ? title.trim() : DEFAULT_TITLE;
    const resolvedDescription = description?.trim() ? description.trim() : DEFAULT_DESCRIPTION;
    const resolvedPathname =
      canonicalPath?.trim() ? canonicalPath.trim() : window.location.pathname || '/';
    const resolvedCanonical = toCanonicalUrl(resolvedPathname);
    const resolvedOgImage = toAbsoluteUrl(ogImage?.trim() ? ogImage.trim() : DEFAULT_OG_IMAGE_PATH);
    const resolvedSiteUrl = getSiteUrl();

    document.title = resolvedTitle;

    upsertLink({ rel: 'canonical' }, { href: resolvedCanonical });

    upsertMeta({ name: 'description' }, resolvedDescription);
    upsertMeta(
      { name: 'robots' },
      noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'
    );

    if (keywords) {
      const keywordValue = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      if (keywordValue.trim()) {
        upsertMeta({ name: 'keywords' }, keywordValue);
      }
    }

    upsertMeta({ property: 'og:site_name' }, SITE_NAME);
    upsertMeta({ property: 'og:title' }, resolvedTitle);
    upsertMeta({ property: 'og:description' }, resolvedDescription);
    upsertMeta({ property: 'og:url' }, resolvedCanonical);
    upsertMeta({ property: 'og:type' }, ogType);
    upsertMeta({ property: 'og:image' }, resolvedOgImage);
    upsertMeta({ property: 'og:image:alt' }, resolvedTitle);

    upsertMeta({ name: 'twitter:card' }, 'summary_large_image');
    upsertMeta({ name: 'twitter:title' }, resolvedTitle);
    upsertMeta({ name: 'twitter:description' }, resolvedDescription);
    upsertMeta({ name: 'twitter:image' }, resolvedOgImage);

    const jsonLdList = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
    const defaultJsonLd = getDefaultJsonLd(resolvedPathname);
    removeManagedJsonLd();
    appendJsonLd(defaultJsonLd);
    jsonLdList.forEach((item) => appendJsonLd(item));

    upsertMeta({ name: 'application-name' }, SITE_NAME);
    upsertMeta({ name: 'author' }, 'Trussers');
    upsertMeta({ name: 'publisher' }, 'Trussers');
    upsertMeta({ name: 'theme-color' }, '#1A3C27');

    if (resolvedSiteUrl.includes('trusser.in')) {
      upsertMeta({ name: 'geo.region' }, 'IN-KA');
      upsertMeta({ name: 'geo.placename' }, 'Bengaluru');
    }
  }, [canonicalPath, description, jsonLd, keywords, noindex, ogImage, ogType, title]);

  return null;
}
