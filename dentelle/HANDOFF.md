# Dentelle 交接文件

> 這份給接手的 Claude / 工程師看。目前 branch：`claude/dental-ceremony-presentation-r01ur`

## 專案是什麼

成功大學牙醫系 117 級 第四屆授袍典禮 網頁簡報，主題 **Dentelle**（法文「蕾絲」）。
Vite + Three.js + GSAP 專案，位於 `dentelle/` 資料夾。

最終產出：`dentelle-standalone.html`（單檔、可雙擊開啟、約 600 KB，AI 素材到位後會到 ~4 MB）。

---

## 怎麼跑

```bash
cd dentelle
npm install
npm run dev                # 開發模式：http://localhost:5173
npm run build              # 一般 build → dist/
npm run build:standalone   # 單檔 build → dist-standalone/index.html
```

Build 完後會把 `dist-standalone/index.html` 複製成 repo 根目錄的 `dentelle-standalone.html`（這樣 GitHub 可以直接下載）。

---

## 流程（11 個場景）

| # | 檔案 | 說明 |
|---|---|---|
| 0 | `00-login.js` | 封面：DENTELLE 大字 + 成大 117 + Press Any Button（3D 牙齒背景） |
| 1 | `01-hall.js` | 典禮前注意事項（蕾絲框 + 中法對照清單） |
| 2 | `02-dentelle-intro.js` | Dentelle 詞義 |
| 3 | `03-vice-president.js` | 醫學院副院長 **張育誌** 致詞（影片 placeholder） |
| 4 | `04-dignitary-speech.js` | 3 位系主任級來賓致詞（黃則達 / 陳永崇 / 陳畊仲） |
| 5 | `05-guest-intro.js` | 10 位與會來賓介紹 |
| 6 | `06-blessing-video.js` | 師長祝福影片串（多段 MP4 placeholder） |
| 7 | `07-room.js` | **受袍廳**（6 間，參數化） |
| 8 | `08-student-speech.js` | 118 級在校生代表致辭 |
| 9 | `09-oath.js` | 日內瓦宣言（領誓：鍾英弘） |
| 10 | `10-group-photo.js` | 大合照 |
| 11 | `11-reveal.js` | 鏡頭拉遠揭曉「這裡是一顆牙」 |

---

## 視覺設計

- **色盤**：玫瑰金單色系（2026-04 換自原本的香檳金）
  - `--gold: #b76e79`, `--gold-bright: #e8b5b8`, `--gold-pale: #f0c9cc`
  - `--ivory: #f4dce0`, `--ivory-dim: #d8b8bc`
  - 原始 rose-gold 3-stop：`#e8b5b8` / `#b76e79` / `#8c4a52`
- **背景**：暗黑 `#0a0604` + 青綠霧氣（`.teal-mist`）
- **字體**：Cinzel Decorative（拉丁）+ Noto Serif TC（中文）
- **飾件風格**：**pano dental X-ray 牙弓曲線** + **Elden Ring / soulslike HUD 邊框**，全單色玫瑰金
- **標題 DENTELLE**：CSS 9-stop 漸層 + 六層 text-shadow 模擬浮雕金屬

---

## 目前狀態（2026-04-17）

### ✅ 完成
- 11 個場景骨架全部可跑、可用空白鍵/→/←切換
- 資料全部填入 `src/data/ceremony.js`（21 位受袍學生姓名、授袍老師、來賓、誓詞）
- SVG 動畫 placeholder 飾件（pano X-ray 風玫瑰金）- `src/components/SvgOrnaments.js`
- 全站色盤換成玫瑰金
- 受袍廳不顯示老師畫框、Chambre I 順序已修正
- 副院長姓名填入 張育誌

### 🚧 等使用者提供（AI 素材）
全部要黑底 PNG 或 MP4：

| 素材 | 規格 | 用途 |
|---|---|---|
| `corner.png` | 1024×1024 | 蕾絲框四角（目前 SVG placeholder） |
| `ribbon.png` | 2048×256 | 蕾絲框上下緞帶（目前 SVG placeholder） |
| `frame-portrait.png` | 1024×1366 | 肖像畫框（目前 SVG placeholder） |
| `dentelle-title.png` | 2400×750 | 首頁 DENTELLE 玫瑰金浮雕字（目前 CSS 漸層） |
| Dandelion 過場 | MP4 4-6s 1920×1080 | 場景切換特效（目前 SVG 粒子） |
| 開場大門 frame seq | 60 張 JPG 1280×720 | Apple 風捲動動畫（未實作） |
| 結尾 panorama frame seq | 90 張 JPG 1280×720 | 鏡頭拉遠揭曉（目前 Three.js 3D） |
| 老師肖像油畫 | 6 張 | 目前隨機 SVG silhouette |
| 來賓肖像 | 10 張 | 同上 |
| 學生肖像 | 21 張 | 同上 |
| 副院長致詞 MP4 | - | 場景 3 |
| 師長祝福 MP4 | 多段 | 場景 6 |

**Prompt 範本**：最近一版 pano-X-ray + soulslike 風的 prompt 在對話紀錄裡，重點關鍵字：
- `engraved jewelry etching / antique medallion relief`
- `panoramic dental arch sweep`
- `Elden Ring / Dark Souls HUD frame`
- `rose-gold monochromatic (#e8b5b8 / #b76e79 / #8c4a52)`
- `pitch-black background (#000000)`
- 負面詞：`NOT cartoony, NOT cute, NOT art-deco enamel`

### ❓ 待確認 / 待補資訊
- 118 級代表姓名（目前場景 8 寫「118 級代表」）
- 副院長致詞影片 MP4 檔案
- 背景音樂 / SFX（完全未加）
- 滑鼠特效 cursor（牙仙子風格，暫時擱置）
- 替換 SVG placeholder 的開關：在 `src/components/LaceFrame.js` 頂端有註解掉的 PNG import，解開即可切回 PNG

---

## 關鍵設計決定（避免走回頭路）

1. **單檔輸出優先**：使用者沒有本機 Node，最終只下載一個 `dentelle-standalone.html` 雙擊開。用 `vite-plugin-singlefile` + `assetsInlineLimit: 100 MB` 把所有資源（含 PNG/MP4）變 base64 內嵌。PNG 要先壓到合理大小（corner 1.4MB、ribbon 775KB）避免 HTML 破 4MB。
2. **飾件路徑抽象化**：所有場景從 `LaceFrame.js` 取 `createBaroqueFrame()` / `createLaceFrame()`，飾件本體換 SVG ↔ PNG 只改 `LaceFrame.js` 裡 `cornerImg` 和 `ribbonDiv` 兩個函式，其他場景不用動。
3. **玫瑰金單色**：使用者明確要「連牙齒都是玫瑰金，不要象牙色」。SVG 飾件用 `url(#rg-vert)` 漸層 fill，Three.js 場景材質用 `#b76e79`。
4. **受袍廳不顯示老師**：老師姓名只在引導畫面（進房前）出現，受袍過程聚光燈只打在學生。
5. **Chambre II 只有林柏毅一人**：陳畊仲老師那間只有這位學弟，非錯誤。
6. **`guests[]` 裡的張育誌**：同時保留在 10 位來賓介紹裡，沒有雙重列出問題（需討論是否移除）。

---

## 檔案地圖

```
dentelle/
├── dentelle-standalone.html    # 最終單檔輸出
├── HANDOFF.md                  # 就是你現在看的這份
├── package.json
├── vite.config.js              # 雙 build：normal + standalone
├── index.html
└── src/
    ├── main.js                 # 場景路由、鍵盤/點擊 advance
    ├── style.css               # 全局樣式、.foil-title 浮雕金屬字、色盤
    ├── data/
    │   └── ceremony.js         # 所有可替換內容（姓名、文字、影片路徑）
    ├── scenes/
    │   ├── 00-login.js
    │   ├── 01-hall.js
    │   ├── 02-dentelle-intro.js
    │   ├── 03-vice-president.js
    │   ├── 04-dignitary-speech.js
    │   ├── 05-guest-intro.js
    │   ├── 06-blessing-video.js
    │   ├── 07-room.js          # 參數化 6 次
    │   ├── 08-student-speech.js
    │   ├── 09-oath.js
    │   ├── 10-group-photo.js
    │   └── 11-reveal.js
    ├── components/
    │   ├── ToothMesh.js        # Three.js 牙齒（登入 + 揭曉共用）
    │   ├── LaceFrame.js        # 飾件總入口（切 SVG/PNG 只改這裡）
    │   ├── SvgOrnaments.js     # SVG placeholder（pano-X-ray、CSS 動畫）
    │   ├── DandelionTransition.js  # 蒲公英過場（SVG 粒子）
    │   └── PortraitWall.js     # 肖像牆（hash → 程序化 SVG silhouette）
    └── assets/
        └── ornaments/
            ├── corner.png      # 舊版香檳金（已過時，SVG 取代）
            └── ribbon.png      # 同上
```

---

## Scene 規格（給接手的 Claude）

每個場景 export `function <name>Scene()` 回傳物件：

```js
return {
  mount(container, { advance, setHUD, goToScene }) { /* 建 DOM、開動畫 */ },
  unmount() { /* 清掉 RAF、事件、Three.js 資源 */ },
  onAdvance() {  /* 回 true 表示內部吃掉這次 → */  },
  onBack() {     /* 回 true 表示內部吃掉這次 ← */  }
};
```

- `advance()` → 進下一個場景
- `setHUD(chapter, hint)` → 更新右下 HUD 文字
- 鍵盤：`→` / `Space` / 點擊 = advance；`←` = back

---

## 開發工作流

```bash
# 一般開發（修 UI、加功能、test）
cd dentelle && npm run dev

# 驗證單檔可用
npm run build:standalone && open dentelle-standalone.html

# 推到 branch（使用者 review）
git add dentelle/ && git commit -m "..." && git push
```

推完後使用者去 GitHub 下載 `dentelle/dentelle-standalone.html` 雙擊看效果。

---

## 還沒處理的 TODO

1. 把 SVG placeholder 換成 AI PNG（等素材）
2. `FrameSequence` 播放器（Apple 風捲動）— 開場大門 + 結尾 panorama 會用
3. 真實 MP4 嵌入（副院長致詞 + 師長祝福）
4. 蒲公英換成 AI 生成影片
5. 118 級代表姓名
6. 背景音樂
7. 牙仙子 cursor
8. 錯字 / 排版 polish 最後一輪
