// 盲検の解答（JSON：{ "A01-001": "ア", ... }）を登録正答と照合する。
// 使い方：node tools/audit/compare.mjs Q03 <盲検解答.json>
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
const [batchId, ans] = process.argv.slice(2);
const batch = JSON.parse(readFileSync('docs/audit/batches.json', 'utf-8')).find((b) => b.id === batchId);
const blind = JSON.parse(readFileSync(ans, 'utf-8'));
let n = 0, ok = 0; const miss = [], none = [];
for (const f of batch.files) {
  const doc = yaml.load(readFileSync(f, 'utf-8'));
  for (const q of doc.questions) {
    if (q.status === 'rejected') continue;
    n++;
    const b = blind[q.id];
    if (!b) { none.push(q.id); continue; }
    if (String(b).trim() === String(q.a).trim()) ok++; else miss.push(`${q.id}: 盲検 ${b} / 登録 ${q.a}`);
  }
}
console.log(`照合 ${n} 問：一致 ${ok}、不一致 ${miss.length}、未解答 ${none.length}`);
for (const m of miss) console.log('  不一致 ' + m);
if (none.length) console.log('  未解答 ' + none.join(', '));
