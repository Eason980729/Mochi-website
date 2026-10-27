# 第三方授權聲明

## Starlight

Footer 的 GitHub 圖示由 `@astrojs/starlight/components` 的 `Icon` 提供，使用目前安裝的 `@astrojs/starlight` 0.42.6。

專案來源：https://github.com/withastro/starlight

以下保留該套件 `LICENSE` 全文。本清單不取代其他依賴隨附的授權聲明，也不授予第三方品牌權利。

```text
MIT License

Copyright (c) 2023 [Astro contributors](https://github.com/withastro/starlight/graphs/contributors)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Lucide：全部 13 個通用圖示

`src/components/Icon.astro` 的圖示均直接取自 Lucide 官方原始碼，固定於 Commit `03f11e2d6adc319ea21e9a1d5820a99cd3767257`，不依賴會變動的 `main` 分支。內嵌時保留 SVG 的全部幾何元素，外層沿用網站的 `currentColor`、尺寸與 1.5px 線寬。

| 本站名稱 | 上游圖示與固定來源 |
| --- | --- |
| `welcome` | [`house`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/house.svg) |
| `roles` | [`users`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/users.svg) |
| `key` | [`key-round`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/key-round.svg) |
| `chat` | [`message-circle`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/message-circle.svg) |
| `music` | [`sixteenth-notes`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/sixteenth-notes.svg) |
| `ticket` | [`ticket`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/ticket.svg) |
| `chart` | [`chart-no-axes-column`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/chart-no-axes-column.svg) |
| `arrow` | [`arrow-right`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/arrow-right.svg) |
| `external` | [`arrow-up-right`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/arrow-up-right.svg) |
| `monitor` | [`monitor`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/monitor.svg) |
| `sun` | [`sun`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/sun.svg) |
| `moon` | [`moon`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/moon.svg) |
| `book` | [`book-open`](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/icons/book-open.svg) |

此版本已將 `music.svg` 更名為 `sixteenth-notes.svg`，本站的 `music` 名稱保持不變。

- 授權：[Lucide LICENSE](https://github.com/lucide-icons/lucide/blob/03f11e2d6adc319ea21e9a1d5820a99cd3767257/LICENSE)

以下逐字保留該版本的完整授權，包含 ISC 與其中列出的 Feather 衍生圖示 MIT 聲明。

```text
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The following Lucide icons are derived from the Feather project:

airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
