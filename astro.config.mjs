// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/data/site.ts';
import { publicationSitemap } from './src/integrations/publication-sitemap.ts';
import { publicationModuleImports } from './src/integrations/publication-module-imports.ts';

export default defineConfig({
  site: 'https://bot.eason729.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    publicationModuleImports(),
    publicationSitemap(),
    starlight({
      title: site.name,
      favicon: site.logo,
      logo: { src: `./public${site.logo}`, alt: '' },
      description: 'Mochi 功能指南、指令參考與伺服器設定說明。',
      defaultLocale: 'root',
      locales: {
        root: { label: '繁體中文', lang: 'zh-TW' },
      },
      customCss: ['./src/styles/global.css'],
      components: {
        Footer: './src/components/SiteFooter.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      disable404Route: true,
      sidebar: [
        { label: '官方首頁', link: '/' },
        {
          label: '開始使用',
          collapsed: true,
          items: [
            { label: '快速入門', slug: 'docs' },
            { label: '功能總覽', slug: 'docs/features' },
          ],
        },
        {
          label: '功能指南',
          collapsed: true,
          items: [
            { label: '歡迎訊息', slug: 'docs/guides/welcome' },
            { label: '反應身分組', slug: 'docs/guides/reaction-roles' },
            { label: 'AI 聊天與記憶管理', slug: 'docs/guides/ai' },
            { label: '音樂播放器', slug: 'docs/guides/music' },
            { label: '客服單系統', slug: 'docs/guides/tickets' },
            {
              label: '三角洲行動',
              collapsed: true,
              items: [
                { label: '每日密碼', slug: 'docs/guides/delta-password' },
                { label: '特勤處製造', slug: 'docs/guides/manufacture' },
              ],
            },
          ],
        },
        {
          label: '指令參考',
          collapsed: true,
          items: [
            { label: '指令導覽與權限', slug: 'docs/commands' },
            { label: '歡迎訊息', slug: 'docs/commands/welcome' },
            { label: '反應身分組', slug: 'docs/commands/reaction-roles' },
            { label: 'AI 聊天', slug: 'docs/commands/ai' },
            { label: '音樂播放器', slug: 'docs/commands/music' },
            { label: '客服單系統', slug: 'docs/commands/tickets' },
            {
              label: '三角洲行動',
              collapsed: true,
              items: [
                { label: '每日密碼', slug: 'docs/commands/delta-password' },
                { label: '特勤處製造', slug: 'docs/commands/manufacture' },
              ],
            },
          ],
        },
        {
          label: '政策與條款',
          collapsed: true,
          items: [
            { label: '服務條款', slug: 'docs/terms' },
            { label: '隱私權政策', slug: 'docs/privacy' },
          ],
        },
        { label: '取得支援', link: '/support' },
      ],
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
