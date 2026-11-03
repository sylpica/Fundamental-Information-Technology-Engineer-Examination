// 監査用ビューア。正答を伏せて問題を表示し、独立に解いてから --reveal で正答・解説を確認する。
//   node tools/audit/qview.mjs list <yamlファイル>     … ファイル内の問題ID一覧
//   node tools/audit/qview.mjs show <ID> [<ID>...]     … 正答・解説を伏せて表示
//   node tools/audit/qview.mjs reveal <ID> [<ID>...]   … 全項目を表示
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const LETTERS = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ'];
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const load = (f) => yaml.load(readFileSync(f, 'utf-8'), { schema: yaml.CORE_SCHEMA });
const [cmd, ...args] = process.argv.slice(2);

function index() {
  const m = new Map();
  for (const f of walk('content/questions').filter((f) => f.endsWith('.yaml')).sort()) {
    const y = load(f);
    for (const q of y.questions || []) m.set(String(q.id), { q, file: f, header: { ...y, questions: undefined } });
  }
  return m;
}

if (cmd === 'list') {
  const y = load(args[0]);
  for (const q of y.questions || []) console.log(`${q.id}\tdiff${q.diff}\t${[].concat(q.topic).join(',')}`);
} else if (cmd === 'show' || cmd === 'reveal') {
  const idx = index();
  for (const id of args) {
    const e = idx.get(id);
    if (!e) { console.log(`#### ${id}: 見つかりません`); continue; }
    const q = e.q;
    console.log(`#### ${id}  (${e.file})  topic=${[].concat(q.topic).join(',')} diff=${q.diff}${q.type ? ' type=' + q.type : ''}`);
    if (cmd === 'reveal') { console.log(yaml.dump(q, { lineWidth: 160 })); continue; }
    const intro = q.intro ?? e.header.intro;
    if (intro) console.log(`[前提]\n${intro}`);
    if (q.code) console.log(`[プログラム]\n${q.code}`);
    console.log(`[問題]\n${q.q}`);
    (q.c || []).forEach((c, i) => console.log(`  ${LETTERS[i]}: ${typeof c === 'string' ? c : JSON.stringify(c)}`));
    console.log('');
  }
} else {
  console.log('usage: qview.mjs list <file> | show <ID...> | reveal <ID...>');
}
