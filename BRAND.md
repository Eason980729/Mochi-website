# 品牌、素材與授權範圍

本 Repository 的網站原始碼採用 [MIT License](LICENSE)，著作權標示為 Copyright (c) 2026 Eason980729。第三方素材與品牌識別的範圍如下。

## Mochi 品牌

Mochi 名稱、Logo、頭像及相關品牌識別保留權利，不包含在網站程式碼的 MIT 授權中；使用這些品牌素材需另行取得授權。此保留不限制依 MIT 條款使用、修改或散布網站程式碼，也不代表使用者取得 Mochi 官方身分或合作關係。

## 素材來源紀錄

| 項目 | 已確認資訊 | 授權範圍與剩餘事項 |
| --- | --- | --- |
| `public/mochi-avatar.png` | 維護者已確認為自行設計的 Mochi 品牌頭像，目前也用作 Favicon | 保留品牌素材權利，不包含在網站程式碼的 MIT 授權內。 |
| `src/components/Icon.astro` 的全部 13 個通用圖示 | 統一取自 Lucide 官方 Commit `03f11e2d6adc319ea21e9a1d5820a99cd3767257`，保留完整 SVG 幾何元素；外層沿用本站尺寸與線條樣式 | 第三方圖示，適用上游 ISC 與所列 Feather 衍生 MIT 條款；名稱對照、固定來源及完整授權見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。 |

舊佔位素材 `public/favicon.svg` 已移除，原先來源未確認的通用圖示已全部替換。既有 Git 歷史保留不變；目前版本的來源紀錄不回溯證明歷史素材的來源或授權。

## 第三方素材與元件

Footer 的 GitHub 圖示使用 `@astrojs/starlight/components` 的內建 `Icon`。目前安裝的 Starlight 0.42.6 附有 MIT 授權，相關聲明保留於 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。GitHub 名稱與標誌用於識別原始碼託管入口，不表示 GitHub 為 Mochi 背書或合作。

其他第三方素材及依賴仍受各自授權條款約束；本專案的 MIT 授權不會取代它們。再散布時應保留適用的第三方著作權與授權聲明。
