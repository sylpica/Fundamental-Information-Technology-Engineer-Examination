// 監査台帳（docs/audit/questions/*.jsonl, docs/audit/reaudit/*.jsonl, docs/audit/glossary/*.jsonl）を集計し、
// 公開問題・用語の全件に対する監査率を出力する。分子は台帳に記録された ID 数（実施した監査のみ）。
//   node tools/audit/ledger-summary.mjs [--json]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const readJsonl = (dir) => !existsSync(dir) ? [] : readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort().flatMap((f) =>
  readFileSync(join(dir, f), 'utf-8').split('\n').filter((l) => l.trim()).map((l, i) => {
    try { return { ...JSON.parse(l), _src: `${f}:${i + 1}` }; } catch (e) { console.error(`JSON 不正 ${f}:${i + 1}`); process.exitCode = 1; return null; }
  }).filter(Boolean));

const manifest = JSON.parse(readFileSync('public/data/manifest.json', 'utf-8'));
const published = new Set();
for (const f of manifest.files.filter((f) => f.kind === 'questions')) for (const q of JSON.parse(readFileSync(join('public/data', f.path), 'utf-8'))) published.add(q.id);
const glossaryFile = manifest.files.find((f) => f.kind === 'glossary');
const terms = new Set(JSON.parse(readFileSync(join('public/data', glossaryFile.path), 'utf-8')).map((t) => t.term));

const audit = new Map(); for (const r of readJsonl('docs/audit/questions')) audit.set(r.id, r);
const reaudit = new Map(); for (const r of readJsonl('docs/audit/reaudit')) reaudit.set(r.id, r);
const gl = new Map(); for (const r of readJsonl('docs/audit/glossary')) gl.set(r.term, r);

const changed = (v) => typeof v === 'string' && /^(fixed|quarantined|rewritten|replaced)/.test(v);
const pubAudited = [...published].filter((id) => audit.has(id));
const rows = pubAudited.map((id) => audit.get(id));
const isFixed = (r) => ['answer', 'distractors', 'explanation', 'syllabus', 'difficulty', 'question'].some((k) => changed(r[k]));
const fixedIds = rows.filter(isFixed).map((r) => r.id);
const sev = {}; for (const r of rows) sev[r.severity || 'none'] = (sev[r.severity || 'none'] || 0) + 1;
const out = {
  questions: {
    published: published.size,
    semanticAudited: pubAudited.length,
    blindSolved: rows.filter((r) => r.answerBlind && r.answerBlind !== 'n/a').length,
    syllabusChecked: rows.filter((r) => r.syllabus && r.syllabus !== 'unchecked').length,
    fixed: fixedIds.length,
    fixedReaudited: fixedIds.filter((id) => reaudit.has(id)).length,
    reauditPass: fixedIds.filter((id) => reaudit.get(id)?.verdict === 'pass').length,
    reauditFail: [...reaudit.values()].filter((r) => r.verdict && r.verdict !== 'pass').map((r) => r.id),
    unaudited: [...published].filter((id) => !audit.has(id)),
    ledgerNotPublished: [...audit.keys()].filter((id) => !published.has(id)),
    severity: sev,
  },
  glossary: {
    terms: terms.size,
    audited: [...terms].filter((t) => gl.has(t)).length,
    fixed: [...gl.values()].filter((r) => r.result && r.result !== 'pass').length,
    unaudited: [...terms].filter((t) => !gl.has(t)).length,
  },
};
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else {
  const q = out.questions, g = out.glossary;
  console.log(`問題: 公開 ${q.published} / 意味監査 ${q.semanticAudited}（${(100 * q.semanticAudited / q.published).toFixed(1)}%）/ 独立解答 ${q.blindSolved} / シラバス確認 ${q.syllabusChecked}`);
  console.log(`      修正 ${q.fixed} / 修正の独立再監査 ${q.fixedReaudited}（合格 ${q.reauditPass}）/ 再監査不合格 ${q.reauditFail.length}`);
  console.log(`      重要度 ${JSON.stringify(q.severity)}  未監査 ${q.unaudited.length}`);
  console.log(`用語: ${g.terms} / 監査 ${g.audited}（${(100 * g.audited / g.terms).toFixed(1)}%）/ 修正 ${g.fixed} / 未監査 ${g.unaudited}`);
  if (q.unaudited.length && q.unaudited.length <= 40) console.log('未監査ID: ' + q.unaudited.join(' '));
}
