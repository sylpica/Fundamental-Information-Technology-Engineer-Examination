// 盲検用の問題を書き出す（正答・解説・検証情報を除く）。
// 使い方：node tools/audit/blind.mjs Q03 <出力ファイル.md>
import { readFileSync, writeFileSync } from 'node:fs';
import yaml from 'js-yaml';
const [batchId, out] = process.argv.slice(2);
const batch = JSON.parse(readFileSync('docs/audit/batches.json', 'utf-8')).find((b) => b.id === batchId);
if (!batch || !out) { console.error('usage: node tools/audit/blind.mjs <batchId> <out.md>'); process.exit(1); }
const L = 'アイウエオカキクケコ';
const parts = [];
for (const f of batch.files) {
  const doc = yaml.load(readFileSync(f, 'utf-8'));
  for (const q of doc.questions) {
    if (q.status === 'rejected') continue;
    parts.push([
      `## ${q.id}（${f}）`,
      String(q.q ?? '').trim(),
      q.attach ? String(q.attach).trim() : '',
      q.code ? '```\n' + String(q.code).replace(/\s+$/, '') + '\n```' : '',
      (q.c ?? []).map((c, i) => `- ${L[i]}：${String(c)}`).join('\n'),
      q.type === 'input' ? '（入力式：選択肢の文言を答える形式でもよい）' : '',
    ].filter(Boolean).join('\n\n'));
  }
}
writeFileSync(out, `# 盲検 ${batchId}（${parts.length}問）\n\n` + parts.join('\n\n---\n\n') + '\n');
console.log(`${parts.length} questions -> ${out}`);
