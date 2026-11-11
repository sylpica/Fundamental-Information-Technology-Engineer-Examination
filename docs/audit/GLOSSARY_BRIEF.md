# 全件意味監査 要領（用語辞典）

対象：`content/glossary/*.yaml` の全用語。バッチは `docs/audit/glossary-batches.json`（ファイル単位）。担当バッチの**全用語を 1 語ずつ**監査し、誤りを修正し、用語ごとに台帳を残す。サンプリング禁止。あなたは作成者とは別の独立監査担当である。

準備：`ln -sfn /home/user/Fundamental-Information-Technology-Engineer-Examination/node_modules node_modules`、`npm run content` がエラー 0 であることを確認。書式は `docs/CONTENT_GUIDE.md` の「用語辞典」。

## 確認項目（全用語）

1. `term`（用語名）と `reading`（読み）が正しいか
2. `simple`（初心者向け説明）と `definition`（定義）が事実として正確か。FE の文脈で誤解を招かないか。似た概念との混同がないか
3. **略語の正式名称の捏造**：`fullName`・`japanese`・`words` が実在する正式名称か。略語の各文字に合わせて英単語を当てはめただけの名称、別の分野の同じ略語の展開、存在しない展開を検出する。確かな正式名称が確認できない場合は推測で埋めず、`fullName`・`words` を削除して定義で説明する（略語であることだけ書く）。複数の正式名称がある場合は文脈を定義に明示する
4. `words` の英単語ごとの訳が正しく、`fullName` の語と対応しているか
5. **別名の誤用**：`aliases` は真の同義語・略称・表記揺れだけ。関連概念・上位／下位概念・似た別概念が別名になっていたら外す（必要なら `related` へ移す。別の用語として独立させる場合は、辞典全体で名前が一意になることを `npm run content` で確認）
6. `related` が実在の関連で、辞典に存在する用語か（ビルド警告に出る）
7. シラバス適合：FE の範囲の用語か、範囲外ならその旨が分かる説明になっているか（削除はしない。問題から参照されている用語は消せない）
8. 法令・規格の名称・番号・版（JIS Q 27001 など）が正しいか

## 修正の原則

- YAML を直接直す。用語名の変更・削除は、問題の `terms` が参照していないことを `grep -rn` で確かめてから行う（参照されていればビルドがエラーにする）。
- 確証のない事実を書き足さない。一次資料で確かめられないものは「未確認」として台帳に残す。
- 修正後は `npm run content`（エラー 0）と `npx vitest run tests/unit/content.test.ts` を通す。
- 担当外のファイルは編集しない。

## 台帳（必須・用語ごとに 1 行）

`docs/audit/glossary/<バッチID>.jsonl`：

```json
{"term":"SBOM","file":"content/glossary/11-security.yaml","auditCommit":"<git log -1>","date":"2026-11-04","auditor":"audit-<バッチID>","reading":"ok","definition":"ok","abbreviation":"ok","aliases":"ok","related":"ok","syllabus":"ok","severity":"none","action":"none","uncertainty":"","reaudit":"pending"}
```

略語でない用語の `abbreviation` は `n/a`。問題があれば具体的に（例 `fixed: fullName を実在しない展開から削除`）。実施していない検証を書かない。

## 報告

`docs/audit/findings/<バッチID>.md` に発見事項（用語・重要度・内容・修正）を書く。担当の YAML・台帳・findings だけを個別に `git add` してコミットする（`docs/generated` と node_modules は含めない）。push はしない。
