// 全件意味監査のバッチ分け。問題ファイル単位（同じファイルを複数担当が編集しないため）で、
// おおむね 1 バッチ 200KB 以下になるようにまとめる。出力：docs/audit/batches.json
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import yaml from 'js-yaml';
const ROOT = process.cwd();
const walk = (d) => readdirSync(d).sort().flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.yaml') ? [p] : []; });
const LIMIT = Number(process.env.LIMIT ?? 200000);
const files = walk(join(ROOT, 'content/questions')).map((f) => {
  const doc = yaml.load(readFileSync(f, 'utf-8'));
  return { file: relative(ROOT, f), bytes: statSync(f).size, ids: doc.questions.map((q) => q.id) };
});
const groups = {};
for (const f of files) {
  const dir = f.file.split('/')[2];
  const key = dir === 'A' ? 'A' + f.file.split('/')[3].slice(0, 2) : dir;
  (groups[key] ??= []).push(f);
}
const batches = [];
let cur = null;
const flush = () => { if (cur && cur.files.length) batches.push(cur); cur = null; };
for (const [key, fs] of Object.entries(groups)) {
  for (const f of fs) {
    if (!cur || cur.bytes + f.bytes > LIMIT || (cur.kind !== key[0] && key[0] !== 'A')) { flush(); cur = { kind: key[0], files: [], bytes: 0, count: 0 }; }
    cur.files.push(f.file); cur.bytes += f.bytes; cur.count += f.ids.length;
  }
}
flush();
batches.forEach((b, i) => { b.id = `Q${String(i + 1).padStart(2, '0')}`; });
writeFileSync(join(ROOT, 'docs/audit/batches.json'), JSON.stringify(batches.map(({ id, files, bytes, count }) => ({ id, count, bytes, files })), null, 2) + '\n');
for (const b of batches) console.log(b.id, b.count, b.bytes, b.files.length);
console.log('total', batches.reduce((a, b) => a + b.count, 0), 'batches', batches.length);
