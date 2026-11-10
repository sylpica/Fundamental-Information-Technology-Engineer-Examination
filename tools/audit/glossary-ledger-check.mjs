// 用語辞典の監査台帳（docs/audit/glossary/*.jsonl）の集計。
// 全用語に台帳の行があるか、略語の外部照合（method に URL）と未照合（uncertainty に「外部未照合」）の件数を出す。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const manifest = JSON.parse(readFileSync('public/data/manifest.json', 'utf-8'));
const g = JSON.parse(readFileSync(join('public/data', manifest.files.find((f) => f.kind === 'glossary').path), 'utf-8'));
const rows = new Map(); const dir = 'docs/audit/glossary';
for (const f of readdirSync(dir).filter((x) => x.endsWith('.jsonl'))) for (const l of readFileSync(join(dir, f), 'utf-8').split('\n').filter(Boolean)) { const r = JSON.parse(l); rows.set(r.term, r); }
const missing = g.filter((t) => !rows.has(t.term));
const abbr = g.filter((t) => t.fullName);
let ext = 0, unv = 0;
for (const t of abbr) { const r = rows.get(t.term); if (!r) continue; if (/外部未照合/.test(r.uncertainty ?? '')) unv++; else if (/https?:/.test(r.method ?? '')) ext++; }
const sev = {}; for (const r of rows.values()) sev[r.severity] = (sev[r.severity] ?? 0) + 1;
console.log(`用語 ${g.length}、台帳 ${rows.size}、台帳なし ${missing.length}`);
console.log(`重要度 ${JSON.stringify(sev)}`);
console.log(`略語（fullName あり）${abbr.length}：外部照合（URL 記録）${ext}、外部未照合 ${unv}、その他 ${abbr.length - ext - unv}`);
if (missing.length) console.log('台帳なし：' + missing.slice(0, 20).map((t) => t.term).join('、'));
