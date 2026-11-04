// 用語辞典の全件監査のバッチ分け（ファイル単位、おおむね 1 バッチ 220KB 以下）。出力：docs/audit/glossary-batches.json
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import yaml from 'js-yaml';
const files = readdirSync('content/glossary').filter((f) => f.endsWith('.yaml')).sort().map((f) => {
  const p = `content/glossary/${f}`;
  return { file: p, bytes: statSync(p).size, count: (yaml.load(readFileSync(p, 'utf-8')).terms ?? []).length };
});
const out = []; let cur = null;
for (const f of files) {
  if (!cur || cur.bytes + f.bytes > 220000) { cur = { id: `G${String(out.length + 1).padStart(2, '0')}`, count: 0, bytes: 0, files: [] }; out.push(cur); }
  cur.files.push(f.file); cur.bytes += f.bytes; cur.count += f.count;
}
writeFileSync('docs/audit/glossary-batches.json', JSON.stringify(out, null, 2) + '\n');
for (const b of out) console.log(b.id, b.count, b.bytes, b.files.length);
