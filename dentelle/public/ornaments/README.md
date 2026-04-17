# 把 AI 生的 PNG 放這裡

需要兩張：

- `corner.png`  — 1024×1024，左上角牙齒藤蔓（黑底）
- `ribbon.png`  — 2048×256 左右，橫向牙齒飾帶（黑底）

**黑底 OK**：程式會用 CSS `mix-blend-mode: screen` 把黑背景自動去掉，只留金色/象牙色裝飾。

檔名必須一模一樣（小寫、副檔名 `.png`）。
放好後在 `dentelle/` 目錄跑 `npm run build:standalone` 就會重新打包。
