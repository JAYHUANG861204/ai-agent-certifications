#!/usr/bin/env node
/**
 * 證照資料檢查器 — CI 在每個 Pull Request 上都會跑這支。
 *
 * 它的工作是在資料進到 master 之前，把「一眼看不出來但會讓網頁壞掉」的錯誤攔下來：
 * 日期打錯、必填欄位漏掉、等級標籤拼錯、id 撞號。
 *
 * 本地自己先跑一次：  node scripts/validate.mjs
 * 沒有任何外部套件，不需要 npm install。
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "certs.json");
const CATEGORIES_PATH = join(ROOT, "data", "categories.json");

// ---- 允許的值。要新增等級請一併改這裡和 index.html 的篩選按鈕 ----
const LEVELS = ["foundational", "associate", "professional", "executive"];
const REQUIRED = ["id", "provider", "name", "code", "level", "levelLabel", "price", "format", "focus", "categories", "taiwan", "url", "verified"];

let categoriesPayload;
try {
  categoriesPayload = JSON.parse(readFileSync(CATEGORIES_PATH, "utf8"));
} catch (err) {
  console.error(`\n✗ data/categories.json 讀不到或不是合法的 JSON：\n  ${err.message}\n`);
  process.exit(1);
}
const CATEGORIES = (categoriesPayload.categories || []).map(c => c.id);

const errors = [];
const warnings = [];

const fail = (where, msg, fix) => errors.push({ where, msg, fix });
const warn = (where, msg) => warnings.push({ where, msg });

// ---- 1. 檔案讀得到、而且是合法 JSON ----
let payload;
try {
  payload = JSON.parse(readFileSync(DATA_PATH, "utf8"));
} catch (err) {
  console.error(`\n✗ data/certs.json 不是合法的 JSON：\n  ${err.message}\n`);
  console.error("  最常見的原因：多了或少了一個逗號、用了中文的引號「」而不是英文的 \"。");
  console.error("  貼到 https://jsonlint.com 可以指出是第幾行。\n");
  process.exit(1);
}

if (!payload || typeof payload !== "object" || !Array.isArray(payload.certs)) {
  console.error('\n✗ data/certs.json 的最外層必須是 { "meta": {...}, "certs": [...] }\n');
  process.exit(1);
}

// ---- 2. 逐筆檢查 ----
const isDate = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const asDate = s => {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  // 攔掉 2026-02-30 這種格式對但不存在的日期（Date.parse 會悄悄幫你進位到 3 月，不會報錯）
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? dt : null;
};

const seenIds = new Map();

payload.certs.forEach((c, i) => {
  const where = c.id ? `certs[${i}] (id: ${c.id})` : `certs[${i}]`;

  for (const field of REQUIRED) {
    if (c[field] === undefined || c[field] === null || c[field] === "") {
      fail(where, `缺少必填欄位 "${field}"`, `補上 "${field}"。可以複製上一筆證照的格式來改。`);
    }
  }

  if (c.id !== undefined) {
    if (!/^[a-z0-9-]+$/.test(c.id)) {
      fail(where, `id "${c.id}" 只能用小寫英文、數字和連字號`, "例如 aws-aif-c01（發證單位-代碼）。");
    }
    if (seenIds.has(c.id)) {
      fail(where, `id "${c.id}" 和 certs[${seenIds.get(c.id)}] 重複`, "每筆證照的 id 必須唯一，通常是 發證單位-證照代碼。");
    } else {
      seenIds.set(c.id, i);
    }
  }

  // 等級
  if (c.level !== undefined && !LEVELS.includes(c.level)) {
    fail(where, `"level" 是 ${JSON.stringify(c.level)}，不在允許值內`, `只能填：${LEVELS.join(" / ")}`);
  }

  // 分類
  if (c.categories !== undefined) {
    if (!Array.isArray(c.categories) || c.categories.length === 0) {
      fail(where, `"categories" 必須是非空陣列`, `例如 ["agent-development"]，可用值：${CATEGORIES.join(" / ")}`);
    } else {
      c.categories.forEach(cat => {
        if (!CATEGORIES.includes(cat)) {
          fail(where, `分類 "${cat}" 不在 data/categories.json 裡`, `只能填：${CATEGORIES.join(" / ")}，或先在 categories.json 新增這個分類。`);
        }
      });
    }
  }

  // 網址
  if (c.url !== undefined) {
    if (typeof c.url !== "string" || !/^https?:\/\//.test(c.url)) {
      fail(where, `"url" 必須是 http(s) 開頭的網址`, "填官方頁面或整理來源的參考連結，不能留空。");
    }
  }

  // 核實日期
  if (c.verified !== undefined) {
    if (!isDate(c.verified)) {
      fail(where, `"verified" 的格式必須是 YYYY-MM-DD，現在是 ${JSON.stringify(c.verified)}`, '例如 "2026-09-11"。月和日不足兩位要補 0。');
    } else if (!asDate(c.verified)) {
      fail(where, `"verified" 是 ${c.verified}，但這個日期不存在`, "檢查一下月份的天數。");
    }
  }

  // 提醒（不會擋 CI，但值得看一眼）
  if (c.focus && c.focus.length > 200) {
    warn(where, `"focus" 有 ${c.focus.length} 個字，版面上會很擠 — 建議壓在 120 字以內。`);
  }
  if (c.code === undefined) {
    warn(where, '沒有 "code" 欄位 — 沒有官方代碼的話請填 "—" 而不是整個省略。');
  }
});

// ---- 3. meta ----
if (!payload.meta || !isDate(payload.meta.updated) || !asDate(payload.meta.updated)) {
  fail("meta", '缺少 "meta.updated" 或格式不是 YYYY-MM-DD', "改動資料時請一併把 meta.updated 換成今天的日期。");
}

// ---- 4. 報告 ----
const n = Array.isArray(payload.certs) ? payload.certs.length : 0;

if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length} 個提醒（不會擋住合併）：\n`);
  warnings.forEach(w => console.log(`  · ${w.where}\n    ${w.msg}\n`));
}

if (errors.length) {
  console.error(`\n✗ 檢查沒過：${n} 筆證照裡有 ${errors.length} 個問題\n`);
  errors.forEach((e, i) => {
    console.error(`  ${i + 1}. ${e.where}`);
    console.error(`     問題：${e.msg}`);
    console.error(`     怎麼修：${e.fix}\n`);
  });
  console.error("  修好之後在本機跑 `node scripts/validate.mjs` 確認，再 push 上來。\n");
  process.exit(1);
}

console.log(`\n✓ 檢查通過：${n} 筆證照，格式全部正確。\n`);
