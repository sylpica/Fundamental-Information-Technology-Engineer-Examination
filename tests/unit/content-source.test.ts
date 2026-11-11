// 教材ソース（content/questions/*.yaml）に対する回帰テスト。
// 過去の障害：選択肢の並べ替えで fills（擬似言語の穴埋め）や sqlChoices が選択肢と対応しなくなった、
// 科目Aの分野番号がファイルによって '01' と '1' に分かれ、分野別演習・模試配分で別分野になった。
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

const ROOT = join(process.cwd(), 'content', 'questions');
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.yaml') ? [p] : [];
});
interface RawQ { id: string; c?: unknown[]; fills?: Record<string, unknown>[]; verify?: { sql?: { sqlChoices?: string[] } } }
const files = walk(ROOT).map((f) => ({ f, doc: yaml.load(readFileSync(f, 'utf-8')) as { category: string; questions: RawQ[] } }));
const all = files.flatMap(({ f, doc }) => doc.questions.map((q) => ({ f, q })));
// 比較用の正規化：空白・全角半角・引用符の違いを吸収する
const norm = (s: unknown) => String(s).normalize('NFKC').replace(/[\s'"“”‘’「」]/g, '').toLowerCase();

describe('教材ソースの回帰テスト', () => {
  it('fills は選択肢と同数で、各 fills の値が同じ位置の選択肢の文言に含まれる', () => {
    const bad: string[] = [];
    for (const { q } of all) {
      if (!q.fills) continue;
      if (q.fills.length !== (q.c ?? []).length) { bad.push(`${q.id}: fills ${q.fills.length} / c ${(q.c ?? []).length}`); continue; }
      q.fills.forEach((fill, i) => {
        const choice = norm(q.c![i]);
        for (const [k, v] of Object.entries(fill)) {
          // 複数文の穴埋めは各行が選択肢に含まれればよい。「未定義の値」は選択肢では「未定義」と表記する
          const parts = String(v).split('\n').map((x) => norm(x.replace(/^未定義の値$/, '未定義'))).filter(Boolean);
          if (!parts.every((x) => choice.includes(x))) bad.push(`${q.id}: 選択肢${i + 1} の fills.${k}「${v}」が選択肢「${q.c![i]}」にない`);
        }
      });
    }
    expect(bad).toEqual([]);
  });

  it('sqlChoices は選択肢と同数', () => {
    for (const { q } of all) {
      const sc = q.verify?.sql?.sqlChoices;
      if (sc) expect(sc.length, q.id).toBe((q.c ?? []).length);
    }
  });

  it('問題 ID は全ファイルで一意', () => {
    const ids = all.map(({ q }) => q.id);
    expect(ids.length - new Set(ids).size).toBe(0);
  });
});
