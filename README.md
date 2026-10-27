# Mochi 官方網站

Mochi 的獨立官方網站，使用 Astro、Starlight、TypeScript 與 Tailwind CSS，採純靜態產生（SSG）架構。預設語言為繁體中文（`zh-TW`），支援手機、桌面及淺色／深色模式。

網站網址：[https://mochi.eason729.com/](https://mochi.eason729.com/)。本 Repository 不包含 Mochi Discord Bot 主程式。

原始碼：[Eason980729/Mochi-website](https://github.com/Eason980729/Mochi-website)。

網站包含產品首頁、功能介紹、支援中心與 Docs 使用手冊，另提供自訂 404 頁面。網站不依賴 Discord Bot 專案的程式碼或執行設定，沒有 Bot API、Dashboard、後端服務或資料庫。

Mochi 目前採人工邀請：首頁邀請按鈕開啟說明 Dialog，再引導至 `/support`；開發者的公開 Discord 聯絡入口只放在支援頁。不公開 Bot 邀請網址，也不提供申請表單。

## 本機開發與驗證

使用 Node.js 24；`.nvmrc` 設為 `24`，套件的最低版本條件記錄於 `package.json`。若使用 nvm，可先執行 `nvm use` 切換版本。

```bash
npm ci
npm run dev
```

`npm ci` 依 `package-lock.json` 安裝相依套件。開發網址以終端機輸出為準，預設為 `http://localhost:4321`。

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動本機 Astro 開發伺服器，可讀取完整 Docs。 |
| `npm run check` | 檢查 Astro、TypeScript 與內容型別。 |
| `npm run build` | 產生正式靜態輸出至 `dist/`，套用 Docs 發布控制並建立搜尋索引與 Sitemap。 |
| `npm run preview` | 本機預覽已建置的 `dist/`，不會重新建置。 |
| `npm run check:theme` | 驗證實際主題腳本、狀態同步、動畫退化行為及建置後的跨版型輸出；需先執行 build。 |
| `npm run check:publication` | 在暫存副本中驗證 Docs 發布、草稿隔離、搜尋、Sitemap、連結與 Dev／Build 並行。 |
| `npm run astro -- --help` | 查看專案安裝的 Astro CLI 說明。 |

提交前建議依序執行：

```bash
npm run check
npm run build
npm run check:theme
npm run check:publication
git diff --check
```

`check:theme` 使用隔離模擬驗證主題腳本，不會改寫使用者的瀏覽器偏好。`check:publication` 需要本機 loopback 連接埠與已安裝的相依套件；它會在系統暫存目錄複製網站及套件、加入唯一測試標記並執行開發與建置流程，結束時清除副本，不修改真實文件或發布名單，也不重新安裝套件。

自動檢查之外，仍需以瀏覽器確認響應式版面、鍵盤與焦點、邀請 Dialog、主題動畫，以及實際裝置的 Reduced Motion 行為。

## 主要專案結構

```text
.
├── astro.config.mjs             # 靜態輸出、網域、Starlight 導覽與整合設定
├── package.json / package-lock.json
├── .nvmrc / tsconfig.json
├── .gitignore
├── wrangler.jsonc               # Workers Static Assets 預留設定，與 Pages 設定不同
├── public/                      # 直接複製至正式輸出的靜態資產；正式頭像為 mochi-avatar.png
├── scripts/                     # check-theme.mjs、check-docs-publication.mjs
└── src/
    ├── pages/                   # 首頁、features、support 與自訂 404
    ├── layouts/                 # 官網 SiteLayout
    ├── components/              # 品牌、導航、Footer、邀請、聯絡及共用主題元件
    ├── data/                    # 品牌／聯絡設定、功能資料及 Docs 發布名單
    ├── scripts/                 # 主題初始化與切換、Hero 動畫、手機導航及邀請 Dialog
    ├── styles/                  # 設計 tokens、官網、Docs、指令參考與主題動畫樣式
    ├── content.config.ts        # Starlight 內容集合與發布 Loader 註冊
    ├── content/
    │   ├── docs/docs/           # /docs 導覽頁、功能指南、指令參考及法律草稿
    │   │   ├── guides/
    │   │   └── commands/
    │   └── i18n/                # 繁體中文補充介面字串
    ├── loaders/                 # publication-docs.ts：依開發／正式模式載入文件
    ├── integrations/            # 發布感知的 Sitemap 與內容模組匯入隔離
    └── middleware.ts            # SSG 時標記未公開頁面，排除整頁 Pagefind 索引
```

`src/data/site.ts` 集中管理 Mochi 品牌名稱、網站網址、正式頭像、Repository 與開發者聯絡 URL，以及 Footer 連結。Header、Footer、Favicon 及 Docs 使用相同品牌來源；Astro 的 `site` 與發布驗證腳本共用網站網址。

`src/data/features.ts` 集中管理功能展示資料。首頁的合併遊戲工具卡片與功能介紹頁的實際通用／選用分類分開處理；每日密碼屬通用功能，特勤處製造屬選用功能，兩者同屬《三角洲行動》工具。

## 頁面與文件分工

| 路由 | 用途 |
| --- | --- |
| `/` | Mochi 的產品特色、功能亮點與邀請入口。 |
| `/features` | 完整功能概覽、通用／選用分類、授權說明及客製化需求入口。 |
| `/support` | 常見問題、文件入口與開發者聯絡方式。 |
| `/docs` | 使用手冊首頁與文件導覽。 |
| `/docs/features` | 功能總覽，連接各功能指南與指令參考。 |
| `/docs/commands` | 指令導覽、參數填寫與權限說明。 |
| `/docs/guides/*` | 歡迎訊息、反應身分組、AI、音樂、客服單、每日密碼及特勤處製造的操作指南。 |
| `/docs/commands/*` | 對應功能的指令名稱、參數、選項、權限及限制。 |
| `/docs/terms`、`/docs/privacy` | 保留原網址；正式建置目前僅顯示準備中提示。 |

Docs 原始檔放在 `src/content/docs/docs/`，使 Starlight 產生 `/docs` 路由，不需將整站 `base` 設為 `/docs`。保留原生側邊欄、頁面目錄與 Pagefind 搜尋；官網仍使用獨立 Header，兩者共用品牌、Footer、字體與主題設定。

修改既有文件標題、路由或章節時，須保留有效的舊錨點與交叉連結，包括 `/docs/features#三角洲生產推薦`。新增文件時提供 `title`、`description` frontmatter，並視需要更新 `astro.config.mjs` 的側邊欄。

## Docs 逐頁發布

發布狀態集中於 `src/data/docs-publication.ts`，鍵值使用 Content Collection ID，不含開頭斜線或副檔名。例如：

| 原始檔（相對於 `src/content/docs/`） | 設定 ID |
| --- | --- |
| `docs/index.mdx` | `docs` |
| `docs/features.md` | `docs/features` |
| `docs/guides/music.md` | `docs/guides/music` |

| 狀態 | 開發模式：`npm run dev` | 正式建置及其預覽 |
| --- | --- | --- |
| `published` | 完整內容 | 公開完整內容，可進入 Pagefind 搜尋與 Sitemap。 |
| `review` | 完整內容 | 顯示「內容審核中」提示頁。 |
| `development` | 完整內容 | 顯示「文件準備中」提示頁。 |
| 未明確設定 | 完整內容 | 預設視為 `review`，不會自動公開。 |

目前已核准的功能文件與導覽頁為 `published`；服務條款與隱私權政策仍為 `development`，不是已生效的正式政策。完整發布名單以集中設定為準。

正式建置的 Loader 會在未發布文件註冊可渲染的 Markdown／MDX 模組及匯入資產前，以固定提示內容取代原文。只保留標題與必要導覽，不輸出原始正文、程式碼範例、自訂 metadata 或 MDX 匯入內容。未公開頁面保留網址與側邊欄，設定 `noindex`、排除整頁 Pagefind 索引，並從 Sitemap 移除。

Tailwind 同時排除 Docs 原始檔與建置快取的自動掃描，避免未公開文件中的任意文字 utility 進入公開 CSS。文件使用 Starlight 與共用 Docs 樣式，不依賴只存在於 Markdown／MDX 的 Tailwind utility 自動產生樣式。

維護發布名單時：

1. 先核對內容與權限，經人工核准後，才將對應 ID 設為 `published`。
2. 撤回公開時改回 `review`；開發中的頁面使用 `development`。
3. 重新建置並執行發布驗證，確認搜尋、Sitemap、正文、資產與連結符合設定。

不要用 `draft: true` 取代這套機制，因為 Starlight 會移除其網址；`draft: true` 與 `published` 同時設定會使建置失敗。

開發伺服器可閱讀全部原文，只供維護使用，不應對外作為正式網站。內容模組匯入會依 Dev／Build 程序隔離，避免並行時共用模組索引衝突；升級 Astro 或 Starlight 時，應重新執行發布驗證，不能只以 build 成功判斷相容。

## 主題系統與首頁動畫

官網與 Starlight Docs 使用同一組設計 tokens、繪製前初始化腳本與 `starlight-theme` localStorage 儲存鍵。單一按鈕依 `system → light → dark → system` 循環，以螢幕、太陽、月亮圖示及可存取名稱呈現狀態。無有效設定時預設 `system`，持續跟隨系統外觀變更，並支援跨分頁同步及歷史頁面還原。

手動切換且實際配色改變時，使用 View Transitions API，從按鈕中心播放約 400ms 的圓形揭露。API 不支援、Reduced Motion、首次載入、系統外觀自動變化及歷史還原時直接套用主題。儲存不可用時，仍可在目前頁面切換。

首頁 Hero 保留標題的隨機逐字輸入、標點停頓與游標結束效果，接續說明文字與 CTA 進場。桌面示意卡片與左側並行；手機則等待左側動畫完成且卡片進入視野後才播放。底部分類導覽屬於 Hero，後方 01／02／03 功能區塊全部靜態顯示。

Hero 以漸進增強方式處理：無 JavaScript 或使用 Reduced Motion 時直接顯示完整內容；動畫不改變預留版面空間，離頁時清理相關計時器及監聽。修改時須保留原有焦點、按鈕與邀請 Dialog 行為。

## Cloudflare Pages 部署

以下是此專案的 Pages 建置設定；本 Repository 的設定檔不代表已完成平台設定、網域綁定或部署。

| 設定 | 預計值 |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | `24` |
| 正式網域 | `mochi.eason729.com` |

`astro.config.mjs` 從 `src/data/site.ts` 取得 `https://mochi.eason729.com`，搭配 `output: 'static'` 與 `trailingSlash: 'never'`，沒有 SSR adapter。`site` 用於產生 Canonical、Open Graph 與 Sitemap 等網址，不會自動完成部署或網域綁定。

在 Cloudflare Pages 設定建置指令、輸出目錄與 Node.js 版本後，需另行設定自訂網域 `mochi.eason729.com`，並為舊網址設定 301 Redirect。Production 與 Preview 的環境變數及權限應分開檢查，Preview 不應取得不必要的正式憑證。本站靜態建置程式沒有要求 Bot Token 或資料庫憑證。

專案另保留既有 `wrangler.jsonc`，內容是 Workers Static Assets 的預留設定，並非上述 Pages 專案的已套用設定。部署前應另外確認託管平台的路由、404、Node.js 與網域設定。

## 授權與品牌

網站原始碼採用 [MIT License](LICENSE)，著作權標示為 Copyright (c) 2026 Eason980729。

Mochi 名稱、Logo、頭像及相關品牌識別保留權利，不包含在 MIT 授權內；正式頭像由維護者自行設計，詳見 [BRAND.md](BRAND.md)。目前全部 13 個通用 SVG 圖示統一取自固定版本的 Lucide 官方原始碼，Footer 的 GitHub 圖示由 Starlight 提供。第三方套件及素材依各自授權處理，來源版本與完整聲明見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 安全與版本管理

- 不提交 Token、密鑰、密碼、環境憑證或私人資料；README 與公開程式碼都不應包含實際憑證。
- `node_modules/`、`dist/`、`.astro/`、快取及本機部署產物不納入 Git。提交來源與 lockfile，讓其他環境可重複安裝及建置。
- `.gitignore` 的 `/.aws` 同時忽略專案根目錄的 `.aws` 檔案與目錄。不要強制加入；檢查忽略規則不需要開啟其內容。
- `.env`、`.env.*` 與常見憑證格式已忽略；若提供 `.env.example`，只能包含安全的設定名稱與示意值。
- Docs 發布控制只保護正式網站輸出，不會隱藏公開 Git Repository 中的原始文件，包括未發布的法律草稿。調整 Repository 可見性前，應另行審查原始檔。
- `public/` 內容會直接公開，不可存放未公開附件或敏感資料；文件專用匯入資產放在 `src/`，並由適當的已公開文件引用。
- 提交前以明確的檔案範圍暫存，檢查差異、忽略規則與驗證結果。
