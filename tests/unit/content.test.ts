// ビルド済み教材データ（public/data）の整合性テスト。`npm run content` の後に実行する。
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ContentManifest, GlossaryTerm, Question } from '../../src/types';
import { runProgram } from '../../src/pseudo/interpreter';
import { normalizeForCompare } from '../../src/lib/text';

const DIR = join(process.cwd(), 'public', 'data');
const hasData = existsSync(join(DIR, 'manifest.json'));
const read = <T>(p: string): T => JSON.parse(readFileSync(join(DIR, p), 'utf-8')) as T;

describe.skipIf(!hasData)('教材データ', () => {
  const manifest = read<ContentManifest>('manifest.json');
  const questions = manifest.files.filter((f) => f.kind === 'questions').flatMap((f) => read<Question[]>(f.path));
  const glossaryFile = manifest.files.find((f) => f.kind === 'glossary');
  const glossary = glossaryFile ? read<GlossaryTerm[]>(glossaryFile.path) : [];
  const termIds = new Set(glossary.map((t) => t.id));

  it('マニフェストの件数と実データが一致する', () => {
    expect(questions.length).toBe(manifest.counts.total);
    expect(questions.filter((q) => q.subject === 'A').length).toBe(manifest.counts.A);
    expect(questions.filter((q) => q.subject === 'B').length).toBe(manifest.counts.B);
  });

  it('問題 ID は一意で、公開されている問題はすべて検証済み', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    expect(questions.filter((q) => q.verificationStatus !== 'verified').map((q) => q.id)).toEqual([]);
  });

  it('正解番号・選択肢・解説の数が整合している', () => {
    for (const q of questions) {
      expect(q.correctAnswer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer, q.id).toBeLessThan(q.choices.length);
      expect(q.choiceExplanations.length, q.id).toBe(q.choices.length);
      expect(new Set(q.choices.map(normalizeForCompare)).size, q.id).toBe(q.choices.length);
      expect(q.choiceExplanations[q.correctAnswer].startsWith('正解です'), q.id).toBe(true);
      q.choiceExplanations.forEach((w, i) => { if (i !== q.correctAnswer) expect(w.startsWith('正解です'), q.id).toBe(false); });
      if (q.subject === 'A' && q.questionType === 'choice') expect(q.choices.length, q.id).toBe(4);
      if (q.questionType === 'input') expect(q.acceptedInputs?.length, q.id).toBeGreaterThan(0);
    }
  });

  it('科目Aの分野は中分類番号の正規形（1〜23）で、主論点の中分類と一致する', () => {
    const middles = new Set(Array.from({ length: 23 }, (_, i) => String(i + 1)));
    const cats = new Set<string>();
    for (const q of questions.filter((x) => x.subject === 'A')) {
      expect(middles.has(q.category), `${q.id}: ${q.category}`).toBe(true);
      expect(q.topicIds[0].split('-')[0], q.id).toBe(q.category);
      cats.add(q.category);
    }
    expect(cats.size).toBe(23);
    for (const q of questions.filter((x) => x.subject === 'B')) expect(['B-ALG', 'B-SEC'], q.id).toContain(q.category);
  });

  it('depth は quick か deep で、科目B のセキュリティ事例問題（長文）は deep', () => {
    for (const q of questions) expect(['quick', 'deep'], `${q.id}: ${q.depth}`).toContain(q.depth);
    for (const q of questions.filter((x) => x.subject === 'B' && x.depth === 'quick')) {
      expect(q.questionText.length + (q.code ?? '').length, `${q.id} は短時間学習には長すぎる`).toBeLessThan(800);
    }
  });

  it('IPA 公開問題は選択肢を並べ替えない（原典の記号と登録正答が一致する）', () => {
    // 過去に正答位置の均等化で IPA 問題の選択肢が並べ替えられ、登録正答の記号が公式解答と食い違った
    for (const q of questions.filter((x) => x.source.kind === 'ipa')) {
      expect(q.noShuffle, `${q.id} は noShuffle が必要`).toBe(true);
      expect(q.id, q.id).toMatch(/^IPA-R\d{2}-[AB]-\d{3}$/);
    }
  });

  it('すべての問題に出典とライセンス状態がある', () => {
    for (const q of questions) {
      expect(q.source?.kind, q.id).toBeTruthy();
      expect(q.source.title, q.id).toBeTruthy();
      if (q.source.kind === 'ipa') {
        expect(q.source.url, q.id).toMatch(/^https:\/\/www\.ipa\.go\.jp\//);
        expect(q.licenseStatus, q.id).toBe('ipa-public-permitted');
        expect(q.noShuffle, q.id).toBe(true);
      }
    }
  });

  it('関連用語はすべて辞典に存在する', () => {
    for (const q of questions) for (const t of q.relatedConcepts) expect(termIds.has(t), `${q.id}: ${t}`).toBe(true);
  });

  it('用語の分野はシラバスの中分類名のいずれか', () => {
    const syllabus = read<{ majors: { middles: { name: string }[] }[] }>(manifest.files.find((f) => f.kind === 'syllabus')!.path);
    const names = new Set(syllabus.majors.flatMap((M) => M.middles.map((m) => m.name)));
    for (const t of glossary) expect(names.has(t.category), `${t.term}: ${t.category}`).toBe(true);
  });

  it('略語の用語には正式名称・日本語訳・単語ごとの意味がある', () => {
    for (const t of glossary) {
      if (t.fullName) {
        expect(t.japanese, t.term).toBeTruthy();
        expect(t.words?.length, t.term).toBeGreaterThan(0);
      }
    }
  });

  it('シミュレーター付きの問題はすべて実行できる', () => {
    for (const q of questions.filter((x) => x.simulation)) {
      const s = q.simulation!;
      expect(() => runProgram(s.program, s.entry, s.args ?? [], { ...(s.options ?? {}), trace: true, maxSteps: 500000 }), q.id).not.toThrow();
    }
  });

  it('問題文・解説に危険な HTML を含まない', () => {
    const bad = /<\s*(script|iframe|object|embed)|javascript:|on\w+\s*=/i;
    for (const q of questions) expect(bad.test(q.questionText + q.explanation + q.choiceExplanations.join('') + (q.code ?? '')), q.id).toBe(false);
  });
});
