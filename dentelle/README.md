# Dentelle — 牙醫白袍典禮 Presentation

以「蕾絲（Dentelle）」為主題的白袍典禮互動簡報。暗色珠寶打光、蒲公英過場、哈利波特風肖像牆，最終鏡頭拉遠揭曉整棟建築是一顆巨大的牙齒。

## 啟動

```bash
cd dentelle
npm install
npm run dev    # http://localhost:5173
```

Build 靜態版本：

```bash
npm run build
npm run preview
```

## 操作

- `Space` / `→` / 點擊：進入下一步或下一位受袍者
- `←`：回上一步
- 拖曳登入畫面的牙齒可以旋轉

## 場景順序

0. **登入**：3D 牙齒在牙齦上（可拖曳），黑底 spotlight
1. **大廳**：典禮注意事項，蕾絲齒形邊框
2. **老師祝福**：四位老師輪播，法文格言 + 中文祝福
3–6. **四個受袍廳**：每廳老師 + 4-5 位學生的油畫肖像，逐位亮起
7. **牙醫師誓詞**：燭光字框
8. **大合照**：投影片結尾
9. **揭曉**：鏡頭拉遠，整棟建築原來是一顆巨大的牙齒

## 替換內容

編輯 `src/data/ceremony.js`：老師名字、祝福、每間房的學生名單、誓詞、日期都在那裡。人像是用名字 hash 程序式產生的 SVG 剪影，之後可以把 `PortraitWall.js` 的 `personSVG` 換成 `<img src={student.photo}>`。

## 技術

Vite · Three.js · GSAP · 純 SVG / CSS 蕾絲。
