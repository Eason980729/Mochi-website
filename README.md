# Discord Bot 官方網站

獨立的 Astro、Starlight、TypeScript 與 Tailwind CSS 靜態網站專案。
預定網域為 `https://bot.eason729.com`，預設語言為繁體中文（`zh-TW`）。

目前已完成第一版 UI Prototype，包含產品首頁、支援頁、404、功能概覽及少量公開指令範例。
公開內容限於三項通用功能與四項選用功能；客製化功能僅說明可用範圍，不公開具體功能或指令。
機器人名稱、Logo、邀請連結、支援管道與正式法律政策尚待確認。
本專案不讀取或依賴其他 Bot 專案，沒有 Bot API、Dashboard、後端服務或資料庫。

## 本機開發

建議使用 Node.js 24 LTS；Astro 所需最低版本記錄於 `package.json`。
若有使用 nvm，可先執行 `nvm install` 與 `nvm use`，套用 `.nvmrc`。

```bash
npm ci
npm run dev
```

開發網址以終端機輸出為準，預設為 `http://localhost:4321`。

```bash
npm run check    # Astro、TypeScript 與內容型別檢查
npm run build    # 產生 dist/ 靜態網站
npm run preview  # 預覽建置結果
```

Astro 7 的預覽若以背景程序執行，可使用 `npm run preview -- status` 查看狀態，
使用 `npm run preview -- stop` 停止。網址以終端機實際輸出為準。

`package-lock.json` 鎖定此次安裝的相依套件。後續安裝請優先使用 `npm ci`。

## 新增檔案與結構

```text
.
├── .gitignore
├── .nvmrc
├── README.md
├── astro.config.mjs           # 靜態輸出、網域、繁中、導覽與 Tailwind Vite 整合
├── package.json
├── package-lock.json
├── tsconfig.json              # Astro strict TypeScript 設定
├── wrangler.jsonc             # 未來 Workers Static Assets 的設定
├── public/favicon.svg         # 通用佔位圖示，待品牌素材確認後替換
└── src/
    ├── content.config.ts      # Starlight content collection
    ├── content/i18n/zh-TW.json # 補充繁中介面字串
    ├── components/
    │   ├── Brand.astro        # 暫用識別與名稱標示
    │   ├── Icon.astro         # 本機 SVG 線條圖示
    │   ├── InviteButton.astro # 邀請按鈕與開發中提示視窗
    │   ├── SiteHeader.astro   # 官網導覽
    │   ├── SiteFooter.astro   # 官網頁尾
    │   └── ThemeSelect.astro  # 深色／淺色／系統選擇
    ├── data/
    │   ├── site.ts            # 品牌佔位、邀請網址與頁尾連結
    │   └── features.ts        # 七項公開功能的型別與展示資料
    ├── content/docs/docs/
    │   ├── index.mdx          # /docs
    │   ├── commands.md        # /docs/commands
    │   ├── features.md        # /docs/features
    │   ├── terms.md           # /docs/terms
    │   └── privacy.md         # /docs/privacy
    ├── layouts/
    │   └── SiteLayout.astro   # 首頁、支援頁與 404 的獨立官網版型
    ├── pages/
    │   ├── 404.astro          # 自訂繁中 404 頁面
    │   ├── index.astro        # /
    │   └── support.astro      # /support
    ├── scripts/
    │   ├── theme.ts           # 官網主題偏好與系統主題事件
    │   ├── theme-bootstrap.ts # 兩種版型繪製前與返回頁面時的主題同步
    │   ├── navigation.ts      # 手機導覽展開、收合與焦點
    │   └── invite-dialog.ts   # 提示視窗關閉、捲動鎖定與焦點還原
    └── styles/
        ├── tokens.css        # 共用色彩與字體變數
        ├── site.css          # 官網 Tailwind v4、版面與響應式樣式
        └── global.css        # Starlight Tailwind 相容層與品牌變數
```

`node_modules/`、`.astro/` 與 `dist/` 是安裝或建置產物，已加入忽略清單。
Astro 會產生自訂 `404.html`，Starlight 會建立供靜態文件搜尋使用的 Pagefind 索引。

## 文件與介面

Starlight 依內容路徑產生路由，因此文件刻意放在 `src/content/docs/docs/`，
讓公開網址從 `/docs` 開始，不必把整站的 Astro `base` 設為 `/docs`。

新增文件時，在該目錄建立 `.md` 或 `.mdx`，並提供 `title` 與 `description` frontmatter。
需要顯示於側邊欄時，同步更新 `astro.config.mjs` 的 `sidebar`。

官網頁面使用獨立 `SiteLayout`；首頁依序為左對齊 Hero、通用功能列表、選用功能區塊、
可用範圍、文件入口及頁尾。支援與 404 共用導航、字體及配色。

Docs 保留原生 Starlight 側邊欄、文章目錄、Pagefind 搜尋及主題切換，沒有覆寫內部元件。
`global.css` 調整品牌變數、提示框配色及內容寬度；Docs 的 Tailwind 相容層與官網的 CSS 分開載入。
品牌名稱與 Logo 來源共用 `src/data/site.ts`，Docs 透過官方 Logo 設定顯示同一圖示。

兩種版型共用 `tokens.css` 與 Starlight 的 `starlight-theme` 偏好值。
官網在頁面繪製前套用主題，支援跟隨系統、跨分頁同步，以及儲存空間遭封鎖時的當頁切換。
主題選擇會使用瀏覽器 localStorage；目前沒有追蹤程式、外部字體、聯絡表單或 Bot 連線。

官網在 1000px、780px、520px 設有版面調整。780px 以下 Header 使用單排品牌、主題圖示及漢堡按鈕，
選單在正常文件流中展開，支援 Esc 收合及鍵盤焦點。主題圖示保留原有原生選擇器的三種選項。
提供跳到主要內容、鍵盤焦點樣式及觸控操作尺寸。
只使用輕量 hover transition 與錨點平滑捲動，`prefers-reduced-motion` 下停用。

邀請網址集中於 `src/data/site.ts`，未確認前保持 `null`，按鈕開啟原生 Dialog 的開發中提示。
視窗支援確認、關閉圖示、遮罩及 Esc 關閉，關閉後還原觸發按鈕焦點與頁面捲動位置。
正式開放時設定已確認的 `inviteUrl`，元件會改為邀請連結；不要填入假網址。
正式品牌名稱只需更新 `site.ts`，Logo 更新其指向的本機素材；兩種 Header 保留各自結構。
功能展示集中於 `src/data/features.ts`；若修改文件標題，須同步核對 `docsAnchor` 與實際產生的錨點。
法律文件以可見的草稿告示標記，沒有設定會使頁面退出正式建置的 `draft: true`。

## 驗證範圍

- 執行 `npm run check` 及 `npm run build`。
- 檢查八份靜態 HTML 的路由、連結、文件錨點與本機資產。
- 檢查 Docs 保有原生側邊欄、文章目錄、搜尋及三種主題選項。
- 官網主題邏輯已以隔離模擬驗證系統變更、儲存偏好、跨分頁及儲存受限情境。
- 主要文字、輔助文字、連結與主要按鈕的指定配色組合已通過 4.5:1 對比檢查。
- 本機靜態預覽曾確認首頁、文件與 Pagefind 資產回應 HTTP 200。

目前環境沒有可用的瀏覽器，尚未完成實際畫面、觸控、鍵盤導覽與搜尋互動驗收。
後續請在桌面及手機尺寸下檢查三種主題，並於建置預覽中確認 Pagefind 搜尋結果。

## 靜態輸出與未來 Cloudflare 設定

`astro.config.mjs` 明確使用 `output: 'static'`，沒有 SSR adapter。
所有頁面在建置時產生，部署時只需要 `dist/`。

`wrangler.jsonc` 僅預先記錄 Workers Static Assets 所需的目錄與路由設定：

- `assets.directory` 指向 `./dist`。
- `html_handling: 'drop-trailing-slash'` 與 Astro `trailingSlash: 'never'` 一致。
- `not_found_handling: '404-page'` 使用 Astro 建置出的 `404.html`。
- 沒有 Worker 程式入口、資料庫或其他服務綁定。

尚未安裝 Wrangler、登入 Cloudflare、建立 Worker、設定自訂網域或執行部署。
`site` 設定僅用來產生正確的 canonical 網址，不會自動綁定網域。
已建立本機 Git 版本管理，`main` 保存初始版本，本輪 UI 優化位於 `ui/first-polish`。
未連接 GitHub、設定遠端、推送或將 UI 分支合併至 `main`。

## 後續開發

1. 確認機器人名稱、介紹、邀請網址與支援聯絡方式。
2. 確認各伺服器正式啟用的功能，逐步補齊公開指令、權限與操作文件。
3. 依實際營運與資料處理方式提供正式條款、隱私權政策與生效資訊。
4. 確認品牌素材後再擴充視覺設計，並檢查行動版與各主題的可讀性。
5. 準備正式上線時，再安裝相容的 Wrangler、確認名稱與網域設定，另行執行部署。

## 官方參考

- [Starlight 手動設定與子路徑](https://starlight.astro.build/manual-setup/)
- [Starlight Tailwind CSS 設定](https://starlight.astro.build/guides/css-and-tailwind/)
- [Starlight 自訂頁面](https://starlight.astro.build/guides/pages/)
- [Cloudflare Workers SSG 與 404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
