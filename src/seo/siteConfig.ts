export type PostalAddress = {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
};

export const SITE_NAME = 'Trussers';
export const DEFAULT_TITLE = `${SITE_NAME} | Sustainable Premium Goods`;
export const DEFAULT_DESCRIPTION =
  'Eco-friendly stationery & lifestyle products crafted from recycled bottles. Sustainable gifts, corporate gifting, and everyday essentials—made in Bengaluru, India.';

export const BUSINESS = {
  legalName: 'NAUTICREW ECO PRODUCTS PRIVATE LIMITED',
  phone: '+91 9008138404',
  email: 'info@trusser.in',
  address: {
    streetAddress: 'No 5, 12th Cross Road, Cubbonpet',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '560002',
    addressCountry: 'IN',
  } satisfies PostalAddress,
  instagram: 'https://instagram.com/trusser.in',
};

export const DEFAULT_OG_IMAGE_PATH = '/heroimage.webp';
export const DEFAULT_LOGO_PATH = '/trusser-logo.avif';

export function getSiteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && typeof window.location?.origin === 'string') {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://trusser.in';
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return getSiteUrl();
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${path}`;
}

export function toCanonicalUrl(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${path}`.replace(/\/+$/, pathname === '/' ? '/' : '');
}
