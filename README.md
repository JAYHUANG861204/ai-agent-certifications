# AI Agent 證照地圖

整理 2026 年主要廠商（NVIDIA、AWS、Microsoft、Google Cloud、Salesforce、UiPath、Oracle、GSDC、ADaSci）推出的 AI Agent / Agentic AI 相關證照，依等級（基礎／助理／專業／領導）與分類（雲端基礎、Agent 開發、企業平台代理…等）整理，並附價格、考試形式、台灣考試方式與參考來源。

線上瀏覽：
- https://ai-agent-certifications.web.app（Firebase Hosting，主要網址）
- https://jayhuang861204.github.io/ai-agent-certifications/（GitHub Pages，備用鏡像）

## 檔案結構

```
ai-agent-certifications/
├── index.html                    # 頁面介面：版面、篩選邏輯、Google 登入、Firestore 讀寫
├── data/certs.json               # 證照資料「原始檔」（共編走 PR 更新這個檔案）
├── data/categories.json          # 分類標籤定義（id、中文標籤、說明）
├── scripts/validate.mjs          # 資料格式驗證工具（同時檢查 certs.json 和 categories.json）
├── firestore.rules               # Firestore 安全規則（公開讀、登入才能寫）
├── firebase.json / .firebaserc   # Firebase Hosting + Firestore 部署設定
└── .github/workflows/validate.yml # PR 自動驗證
```

## 資料怎麼流動

`data/certs.json` 是**送審用的原始資料**：改資料一律走 Pull Request，CI 會自動驗證格式（見 [CONTRIBUTING.md](CONTRIBUTING.md)）。

網頁實際顯示的內容則是從 **Firestore 資料庫**讀取（`certifications` / `categories` collection）；PR 合併後，需要有人用 Google 帳號登入網站、按一次「同步資料到資料庫」，Firestore 才會更新成最新內容。如果 Firestore 是空的（例如第一次部署、還沒人同步過），網頁會自動退回讀取 `data/certs.json` 當備援，確保任何時候打開都看得到內容。

價格、時長、通過門檻等細節可能隨廠商調整，正式報名前請以官方頁面為準。
