// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bot.eason729.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    starlight({
      title: 'Discord Bot 文件',
      description: 'Discord Bot 使用文件與功能說明。正式名稱與邀請資訊待確認。',
      defaultLocale: 'root',
      locales: {
        root: { label: '繁體中文', lang: 'zh-TW' },
      },
      customCss: ['./src/styles/global.css'],
      disable404Route: true,
      sidebar: [
        { label: '官方首頁', link: '/' },
        { label: '文件中心', slug: 'docs' },
        {
          label: '使用文件',
          items: [
            { label: '功能介紹', slug: 'docs/features' },
            { label: '指令說明', slug: 'docs/commands' },
          ],
        },
        {
          label: '條款與隱私',
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
