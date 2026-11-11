// 再監査の対象：基準コミット以降に内容が変わった問題と、台帳で action が none 以外の問題。
// 使い方：node tools/audit/reaudit-targets.mjs <基準コミット> <バッチID...>
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';
const [base, ...batchIds] = process.argv.slice(2);
const batches = JSON.parse(readFileSync('docs/audit/batches.json', 'utf-8')).filter((b) => batchIds.includes(b.id));
const out = [];
for (const b of batches) {
  const ledger = new Map();
  const lf = `docs/audit/questions/${b.id}.jsonl`;
  if (existsSync(lf)) for (const l of readFileSync(lf, 'utf-8').split('\n').filter(Boolean)) { const r = JSON.parse(l); ledger.set(r.id, r); }
  for (const f of b.files) {
    let before = [];
    try { before = yaml.load(execSync(`git show ${base}:${f}`, { encoding: 'utf-8', maxBuffer: 1 << 26 })).questions; } catch { /* 新規 */ }
    const prev = new Map(before.map((q) => [q.id, JSON.stringify(q)]));
    for (const q of yaml.load(readFileSync(f, 'utf-8')).questions) {
      const changed = prev.get(q.id) !== JSON.stringify(q);
      const r = ledger.get(q.id);
      if (changed || (r && r.action && r.action !== 'none')) out.push(`${b.id}\t${q.id}\t${changed ? 'changed' : 'ledger-only'}\t${r?.severity ?? '-'}\t${(r?.action ?? '').slice(0, 120)}`);
    }
  }
}
console.log(out.join('\n'));
console.log(`対象 ${out.length} 問`);
