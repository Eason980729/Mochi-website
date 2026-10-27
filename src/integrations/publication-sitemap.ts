import { readFile } from 'node:fs/promises';
import type { AstroIntegration } from 'astro';
import sitemap from '@astrojs/sitemap';
import { isUnpublishedHtml } from '../data/docs-publication';

/** Use the official serializer, filtering actual output rather than guessing route prefixes. */
export function publicationSitemap(): AstroIntegration {
  let outputDirectory: URL;
  let format = 'directory';
  let base = '/';
  const integration = sitemap({
    async serialize(item) {
      let path = new URL(item.url).pathname;
      if (base !== '/' && path.startsWith(base)) path = path.slice(base.length);
      path = path.replace(/^\/+|\/+$/g, '');
      const file = path.endsWith('.html') ? path : format === 'file' && path ? `${path}.html` : `${path ? `${path}/` : ''}index.html`;
      const html = await readFile(new URL(file, outputDirectory), 'utf8');
      return isUnpublishedHtml(html) ? undefined : item;
    },
  });
  return {
    ...integration,
    hooks: {
      ...integration.hooks,
      async 'astro:config:done'(options) {
        outputDirectory = options.config.outDir;
        format = options.config.build.format;
        base = options.config.base;
        await integration.hooks['astro:config:done']?.(options);
      },
    },
  };
}
