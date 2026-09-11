# AI Agent 證照地圖

整理 2026 年主要廠商（NVIDIA、AWS、Microsoft、Google Cloud、Salesforce、UiPath、Oracle、GSDC、ADaSci）推出的 AI Agent / Agentic AI 相關證照，依基礎、助理、專業、領導四個等級分類，並附價格、考試形式、台灣考試方式與參考來源。

線上瀏覽：<https://jayhuang861204.github.io/ai-agent-certifications/>

## 檔案結構

```
ai-agent-certifications/
├── index.html                    # 頁面介面（版面與邏輯，會讀取 data/certs.json）
├── data/certs.json                # 證照資料（共編主要更新的檔案）
├── scripts/validate.mjs           # 資料格式驗證工具
└── .github/workflows/validate.yml # PR 自動驗證
```

## 共編方式

資料與頁面邏輯分離，內容只改 `data/certs.json`，不要動 `index.html` 的渲染邏輯。歡迎直接開 Pull Request，每個 PR 會自動跑格式驗證，通過後 review、merge 即可，GitHub Pages 約 1 分鐘內自動更新。詳細步驟、欄位說明見 [CONTRIBUTING.md](CONTRIBUTING.md)。

價格、時長、通過門檻等細節可能隨廠商調整，正式報名前請以官方頁面為準。
