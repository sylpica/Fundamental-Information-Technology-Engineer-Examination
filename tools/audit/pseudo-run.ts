// 監査用：擬似言語プログラムを実行して戻り値・出力を表示する（独立検証用）。
//   node tools/run-ts.mjs tools/audit/pseudo-run.ts <file.txt> [entry] [jsonArgs] [jsonOptions]
//   例: node tools/run-ts.mjs tools/audit/pseudo-run.ts /path/prog.txt sum '[[1,2,3]]'
// 空欄【a】を含むコードは事前に置き換えたファイルを渡すこと。
import { readFileSync } from 'node:fs';
import { runProgram, formatValue } from '../../src/pseudo/interpreter';

const [file, entry, argsJson, optsJson] = process.argv.slice(2);
if (!file) { console.error('usage: pseudo-run.ts <file> [entry] [jsonArgs] [jsonOptions]'); process.exit(2); }
const src = readFileSync(file, 'utf-8');
try {
  const r = runProgram(src, entry || undefined, argsJson ? JSON.parse(argsJson) : [], optsJson ? JSON.parse(optsJson) : {});
  console.log('return:', r.returnValue === undefined ? '(なし)' : formatValue(r.returnValue));
  console.log('output:'); for (const l of r.output) console.log('  ' + l);
  console.log('globals:', JSON.stringify(Object.fromEntries(Object.entries(r.globals).map(([k, v]) => [k, formatValue(v)]))));
  console.log('steps:', r.steps, 'callCounts:', JSON.stringify(r.callCounts));
  if (r.warnings.length) console.log('warnings:', r.warnings.join(' / '));
} catch (e) { console.log('ERROR:', (e as Error).message); process.exitCode = 1; }
