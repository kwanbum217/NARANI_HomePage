import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  if (!site) {
    throw new Error('astro.config.mjs 의 site 값이 있어야 robots.txt 를 생성할 수 있습니다.');
  }

  const body = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', site).href}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
