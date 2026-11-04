// 監査台帳（docs/audit/questions/*.jsonl）の検証と集計。
// 全公開問題に台帳の行があるか、必須項目がそろっているかを確認し、指標を出力する。
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const DIR = 'docs/audit/questions';
const manifest = JSON.parse(readFileSync('public/data/manifest.json', 'utf-8'));
const qs = manifest.files.filter((f) => f.kind === 'questions').flatMap((f) => JSON.parse(readFileSync(join('public/data', f.path), 'utf-8')));
const rows = new Map();
const problems = [];
const REQ = ['id', 'file', 'auditCommit', 'date', 'auditor', 'method', 'blindAnswer', 'blindMatch', 'structure', 'answer', 'distractors', 'explanation', 'syllabus', 'difficulty', 'duplicate', 'severity', 'action'];
if (existsSync(DIR)) for (const f of readdirSync(DIR).filter((x) => x.endsWith('.jsonl')).sort()) {
  readFileSync(join(DIR, f), 'utf-8').split('\n').filter(Boolean).forEach((line, i) => {
    let r; try { r = JSON.parse(line); } catch { problems.push(`${f}:${i + 1} JSON 不正`); return; }
    for (const k of REQ) if (r[k] === undefined || r[k] === '') problems.push(`${f}:${r.id ?? i + 1} ${k} なし`);
    rows.set(r.id, { ...r, ledger: f });
  });
}
const pub = new Set(qs.map((q) => q.id));
const missing = qs.filter((q) => !rows.has(q.id)).map((q) => q.id);
const sev = {}; let fixed = 0, reaudited = 0, blindMismatch = 0;
for (const r of rows.values()) {
  sev[r.severity] = (sev[r.severity] ?? 0) + 1;
  if (r.action && r.action !== 'none') fixed++;
  if (r.reaudit && r.reaudit !== 'pending') reaudited++;
  if (r.blindMatch === false) blindMismatch++;
}
console.log(`公開問題 ${qs.length}、台帳 ${rows.size}（公開中 ${[...rows.keys()].filter((k) => pub.has(k)).length}）、未監査 ${missing.length}`);
console.log(`盲検不一致 ${blindMismatch}、修正あり ${fixed}、再監査済み ${reaudited}`);
console.log('重要度', JSON.stringify(sev));
if (problems.length) { console.log(`台帳の不備 ${problems.length} 件`); for (const p of problems.slice(0, 50)) console.log('  ' + p); }
if (process.argv.includes('--strict') && (missing.length || problems.length)) process.exit(1);
