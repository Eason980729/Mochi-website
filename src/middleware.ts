import { defineMiddleware } from 'astro:middleware';
import { isUnpublishedHtml } from './data/docs-publication';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;

  // Pagefind otherwise falls back to indexing whole pages when no published body exists.
  // This runs during SSG; unpublished source content has already been removed by the loader.
  const html = await response.clone().text();
  if (!isUnpublishedHtml(html)) return response;
  if (!/<html\b/.test(html)) throw new Error('Unpublished Docs must render an HTML document.');
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html.replace(/<html\b/, '<html data-pagefind-ignore="all"'), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
