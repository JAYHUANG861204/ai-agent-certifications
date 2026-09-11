# 共編指南

## 核心原則

**不要直接改 `master`，一律走 Pull Request。**

## 方法一：網頁介面（新手、小幅修改）

1. 打開 [`data/certs.json`](data/certs.json)
2. 點右上角鉛筆圖示（✏️）編輯
3. 修改內容
4. 選 **"Create a new branch for this commit and start a pull request"**
5. 摘要寫清楚改了什麼，例如「更新 Salesforce Agentforce Specialist 報名費」
6. 點 **Propose changes** → **Create pull request**
7. 等 CI 檢查跑完（見下方燈號說明）
8. 找一個人 review、核對資料來源後 **Merge**
9. GitHub Pages 約 1 分鐘內自動更新

## 方法二：本機（大量修改、新增多筆）

```bash
git clone https://github.com/JAYHUANG861204/ai-agent-certifications.git
cd ai-agent-certifications
git checkout -b update/描述性分支名稱
# 編輯 data/certs.json
node scripts/validate.mjs   # 先在本機驗證格式
git add data/certs.json
git commit -m "說明改了什麼"
git push -u origin update/描述性分支名稱
```

本機預覽：`npx serve .` 或 `python -m http.server 8000`，開 http://localhost:8000

## 每筆證照的必填欄位

| 欄位 | 說明 | 範例 |
|---|---|---|
| `id` | 唯一代碼，只能小寫字母、數字、連字號 | `aws-aif-c01` |
| `provider` | 發證單位 | `AWS` |
| `name` | 證照全名 | `AWS Certified AI Practitioner` |
| `code` | 官方代碼，沒有就填 `"—"` | `AIF-C01` |
| `level` | 等級，只能是 `foundational` / `associate` / `professional` / `executive` | `professional` |
| `levelLabel` | 顯示用的等級文字 | `專業 Professional` |
| `price` | 費用（字串，允許填「查官網」） | `US$200` |
| `format` | 考試形式（時長、題數等） | `120 分鐘・60–70 題` |
| `focus` | 一兩句話說明考什麼，建議 200 字以內 | — |
| `taiwan` | 台灣考試方式（實體考場／線上監考） | `線上遠端監考，不限地點` |
| `url` | 參考來源，必須是 `http://` 或 `https://` 開頭的連結 | — |
| `verified` | 最後核實日期，格式 `YYYY-MM-DD` | `2026-09-11` |

新增一筆時記得同步更新 `meta.updated` 為當天日期。

**注意：** 很多證照名稱相似但等級或發證單位不同，新增前請先對照官方頁面確認 `level` 與 `price` 沒有寫錯，不確定就在 PR 說明或 Issue 裡註明，不要用猜的。

## CI 檢查燈號

- 🟡 黃燈：驗證處理中（約 30 秒）
- ✅ 綠燈：格式通過，可以請人 review
- ❌ 紅燈：有錯誤，點 **Details** 看中文錯誤訊息（會標出第幾筆、哪個欄位）

## Review 檢查重點

1. CI 是否為綠燈
2. 對照官方頁面確認價格、時長、等級是否正確
3. `id` 沒有重複、格式符合規則

## 不想直接編輯？

歡迎開 [Issue](https://github.com/JAYHUANG861204/ai-agent-certifications/issues)，附上證照名稱、發證單位與參考連結，我們會協助補齊資料並送出 PR。
