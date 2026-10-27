import { glob, type Loader } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { getPublicationStatus, type PublicationStatus } from '../data/docs-publication';
import { isolatePublicationImports } from '../integrations/publication-module-imports';

/** Replace unpublished entries before they can register Markdown/MDX modules or assets. */
export function publicationDocsLoader(): Loader {
  return isolatePublicationImports({
    name: 'mochi-publication-docs',
    async load(context) {
      // Rebuild after mode/status changes; a previous dev or published cache must not bypass policy.
      context.store.clear();
      // Astro only supplies a watcher in dev. Build must stay private even if NODE_ENV is overridden.
      if (context.watcher) return docsLoader().load(context);
      const loader = glob({
        base: './src/content/docs',
        pattern: '**/[^_]*.{md,mdx,markdown,mdown,mkdn,mkd,mdwn}',
        deferRender: true,
        retainBody: false,
      });

      const placeholderData = new Map<PublicationStatus, Record<string, unknown>>();
      for (const status of ['review', 'development'] as const) {
        const label = status === 'development' ? '文件準備中' : '內容審核中';
        placeholderData.set(status, await context.parseData({
          id: `publication-${status}`,
          data: {
            title: label,
            description: label,
            draft: false,
            pagefind: false,
            tableOfContents: false,
            editUrl: false,
            lastUpdated: false,
            head: [
              { tag: 'meta', attrs: { name: 'robots', content: 'noindex, follow' } },
              { tag: 'meta', attrs: { name: 'mochi-docs-status', content: status } },
            ],
          },
        }));
      }

      await loader.load({
        ...context,
        store: {
          ...context.store,
          set(entry) {
            const status = getPublicationStatus(entry.id);
            if (status === 'published') {
              if (entry.data.draft === true) throw new Error(`Published Docs cannot also be draft: ${entry.id}`);
              return context.store.set(entry);
            }
            const label = status === 'development' ? '文件準備中' : '內容審核中';
            const description = status === 'development'
              ? '這份文件正在準備中，完成後將開放閱讀。'
              : '這份文件尚未公開，請稍後再回來查看。';
            // No original body, filePath, deferredRender, metadata, or asset imports survive.
            return context.store.set({
              id: entry.id,
              data: { ...placeholderData.get(status), title: entry.data.title },
              digest: entry.digest,
              rendered: {
                html: `<section data-docs-publication="${status}"><h2>${label}</h2><p>${description}</p><p class="docs-publication-links"><a href="/features">查看功能介紹</a><a href="/support">取得支援</a></p></section>`,
                metadata: { headings: [] },
              },
            });
          },
        },
      });
    },
  });
}
