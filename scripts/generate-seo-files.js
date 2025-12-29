import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const DEFAULT_SITE_URL = 'https://trusser.in';

const siteUrl = String(process.env.SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_URL)
  .trim()
  .replace(/\/+$/, '');

const today = new Date().toISOString().slice(0, 10);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toLoc(routePath) {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;
  return `${siteUrl}${normalized}`;
}

async function loadProducts() {
  try {
    const raw = await fs.readFile(path.join(projectRoot, 'src', 'data', 'products.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildSitemapXml(urls) {
  const body = urls
    .map(({ loc, lastmod, changefreq, priority }) => {
      const parts = [
        `  <url>`,
        `    <loc>${escapeXml(loc)}</loc>`,
        lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : null,
        changefreq ? `    <changefreq>${escapeXml(changefreq)}</changefreq>` : null,
        typeof priority === 'number' ? `    <priority>${priority.toFixed(1)}</priority>` : null,
        `  </url>`,
      ].filter(Boolean);
      return parts.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`;
}

async function main() {
  const publicDir = path.join(projectRoot, 'public');

  const staticRoutes = [
    { path: '/', changefreq: 'weekly', priority: 1.0 },
    { path: '/shop', changefreq: 'weekly', priority: 0.9 },
    { path: '/corporate-gifting', changefreq: 'monthly', priority: 0.8 },
    { path: '/journal', changefreq: 'weekly', priority: 0.7 },
    { path: '/about', changefreq: 'monthly', priority: 0.6 },
    { path: '/sustainability', changefreq: 'monthly', priority: 0.6 },
    { path: '/contact', changefreq: 'monthly', priority: 0.6 },
    { path: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
    { path: '/terms-of-service', changefreq: 'yearly', priority: 0.3 },
    { path: '/eco-friendly-products-bangalore', changefreq: 'weekly', priority: 0.8 },
    { path: '/eco-friendly-products-chickpet-bangalore', changefreq: 'weekly', priority: 0.8 },
  ];

  const products = await loadProducts();
  const productRoutes = products
    .map((product) => Number(product?.id))
    .filter((id) => Number.isFinite(id))
    .sort((a, b) => a - b)
    .map((id) => ({
      path: `/product/${id}`,
      changefreq: 'weekly',
      priority: 0.6,
    }));

  const urls = [...staticRoutes, ...productRoutes].map((route) => ({
    loc: toLoc(route.path),
    lastmod: today,
    changefreq: route.changefreq,
    priority: route.priority,
  }));

  const sitemapXml = buildSitemapXml(urls);
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');

  const robotsTxt = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /account/',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /checkout/',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
  await fs.writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

  console.log(`Generated public/sitemap.xml and public/robots.txt for ${siteUrl}`);
}

main().catch((error) => {
  console.error('Failed to generate SEO files:', error);
  process.exitCode = 1;
});
