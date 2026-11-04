# 独立再監査 要領（修正済み問題）

対象：全件監査（`docs/audit/AUDITOR_BRIEF.md`）で修正された問題。あなたは監査担当・作問者のどちらとも別の再監査担当である。

## 対象の特定

```bash
git diff --stat <基準コミット> HEAD -- content/questions
node tools/audit/reaudit-targets.mjs <基準コミット> <バッチID...>   # 変更された問題 ID と台帳の action を一覧
```

## 手順（問題ごと）

1. **盲検で解き直す**：修正後の問題を `node tools/audit/blind.mjs` と同じ形式（問題文と選択肢だけ）で読み、正答・解説を見ずに解く。改題された問題（問題文・選択肢・正答が変わったもの）は特に必須。
2. 登録正答と照合する。一致しなければ原因を確定する。
3. `git diff <基準コミット> HEAD -- <ファイル>` で修正前後を比べ、次を確認する。
   - 指摘された不具合が実際に解消したか（例：誤答の why の導出を実際に計算して、その選択肢の値が出るか）
   - 修正で新しい誤りが入っていないか（正答の一意性、他の誤答、exp・know、verify、fills の対応、topic・diff・scope の妥当性）
   - 改題で既存問題と実質重複になっていないか（`grep` で確認）
   - 学習上の意味が不当に変わっていないか
4. 問題があれば YAML を修正し、`npm run content`（エラー 0）と `npx vitest run tests/unit/content-source.test.ts` を通す。

## 記録

- 台帳 `docs/audit/questions/<バッチID>.jsonl` の該当行の `reaudit` を、`pass: <確認内容>` / `fixed: <内容>` / `fail: <内容>` に更新する（他の項目は変えない）。修正しなかった問題の行は変更しない。
- `docs/audit/findings/REAUDIT-<名前>.md` に、対象 ID、盲検の一致数、合否、再修正の内容を書く。
- 担当の YAML・台帳・findings だけを個別に `git add` してコミットする（`docs/generated` と node_modules は含めない）。push はしない。
