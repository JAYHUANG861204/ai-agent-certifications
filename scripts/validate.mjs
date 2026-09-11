import { readFileSync } from 'node:fs';

const FILE = 'data/certs.json';
const REQUIRED_FIELDS = ['id', 'provider', 'name', 'code', 'level', 'levelLabel', 'price', 'format', 'focus', 'url', 'taiwan', 'verified'];
const VALID_LEVELS = ['foundational', 'associate', 'professional', 'executive'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z0-9-]+$/;

function fail(errors) {
  console.error(`\n✗ 驗證失敗，共 ${errors.length} 個錯誤：\n`);
  errors.forEach(e => console.error('  - ' + e));
  console.error('');
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(FILE, 'utf8');
} catch (err) {
  fail([`找不到或無法讀取 ${FILE}：${err.message}`]);
}

let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  fail([`${FILE} 不是合法的 JSON：${err.message}`]);
}

if (!data.meta || !DATE_RE.test(data.meta.updated || '') || isNaN(Date.parse(data.meta.updated))) {
  fail(['meta.updated 缺少或格式錯誤，應為 YYYY-MM-DD']);
}

if (!Array.isArray(data.certs) || data.certs.length === 0) {
  fail(['certs 必須是非空陣列']);
}

const errors = [];
const seenIds = new Set();

data.certs.forEach((cert, i) => {
  const where = `certs[${i}]${cert.id ? ` (${cert.id})` : ''}`;

  for (const field of REQUIRED_FIELDS) {
    if (cert[field] === undefined || cert[field] === null || cert[field] === '') {
      errors.push(`${where}: 缺少必填欄位 "${field}"`);
    }
  }

  if (cert.id) {
    if (!ID_RE.test(cert.id)) {
      errors.push(`${where}: id 只能用小寫字母、數字、連字號`);
    }
    if (seenIds.has(cert.id)) {
      errors.push(`${where}: id 重複`);
    }
    seenIds.add(cert.id);
  }

  if (cert.level && !VALID_LEVELS.includes(cert.level)) {
    errors.push(`${where}: level "${cert.level}" 不合法，只能是 ${VALID_LEVELS.join(' / ')}`);
  }

  if (cert.url && !/^https?:\/\//.test(cert.url)) {
    errors.push(`${where}: url 必須以 http:// 或 https:// 開頭`);
  }

  if (cert.verified && (!DATE_RE.test(cert.verified) || isNaN(Date.parse(cert.verified)))) {
    errors.push(`${where}: verified 格式應為 YYYY-MM-DD`);
  }

  if (cert.focus && cert.focus.length > 200) {
    console.warn(`⚠ ${where}: focus 超過 200 字，建議精簡（目前 ${cert.focus.length} 字）`);
  }
});

if (errors.length > 0) {
  fail(errors);
}

console.log(`✓ ${FILE} 通過驗證，共 ${data.certs.length} 筆證照資料。`);
