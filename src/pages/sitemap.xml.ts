import type { APIRoute } from 'astro';

export const prerender = true;

const paths = [
  '/',
  '/company/',
  '/bidbox/',
  '/bidbox/service/',
  '/bidbox/pricing/',
  '/bidbox/demo/',
  '/bidbox/contact/',
];

export const GET: APIRoute = ({ site }) => {
  if (!site) {
    throw new Error('astro.config.mjs 의 site 값이 있어야 sitemap 을 생성할 수 있습니다.');
  }

  const entries = paths
    .map((path) => `  <url>\n    <loc>${new URL(path, site).href}</loc>\n  </url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
