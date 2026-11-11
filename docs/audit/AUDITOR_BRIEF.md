# 全件意味監査 要領（問題）

対象：公開中の全問題。バッチ分けは `docs/audit/batches.json`（問題ファイル単位。同じファイルを複数の担当が編集しない）。
あなたは問題の作成者ではない独立した監査担当である。担当バッチの**全問を 1 問ずつ**監査し、誤りを YAML で修正し、問題ごとに監査台帳を残す。サンプリングは禁止。

## 0. 準備（担当の作業ツリーで）

```bash
ln -sfn /home/user/Fundamental-Information-Technology-Engineer-Examination/node_modules node_modules   # 無ければ
npm run content            # エラー 0 を確認（警告 5 件は既知）
git log --oneline -1       # 監査対象コミット（auditCommit に記録）
```

読むもの：`docs/CONTENT_GUIDE.md`（作問規約・verify の書き方・擬似言語の意味論）、`docs/DECISIONS.md`（擬似言語の確定意味論）。
シラバス：`content/syllabus/syllabus-9.2.json`（majors→middles→subs→items→children。ID は `中分類-小分類-項目[-子項目]`、各項目の `terms` が用語例）、科目B は `content/syllabus/subject-b.yaml`。

## 1. 盲検（正答・解説を見る前に）

```bash
node tools/audit/blind.mjs <バッチID> <スクラッチ>/blind-<バッチID>.md
```

この md だけを読み、全問を自力で解く（計算は実際に計算し、擬似言語は手でトレースするか下記の実行手段を使う）。解答を `<スクラッチ>/blind-<バッチID>.json` に `{ "ID": "ア", ... }` で保存してから、

```bash
node tools/audit/compare.mjs <バッチID> <スクラッチ>/blind-<バッチID>.json
```

で照合する。**照合前に YAML の a・exp・why を見てはいけない。** 不一致の問題は最優先で再検証する（問題文の条件不足・正答誤り・複数正解・自分の誤りのどれかを確定する）。

## 2. 全問の精査（YAML を開いて）

各問題について次をすべて確認する。

1. 問題文の意味が一意か、解答に必要な条件がそろっているか
2. 登録正答が正しいか（知識問題は確立した定義・IPA の用語例・法令・規格と照合。確信できない重要な主張は「未確認」と記録）
3. 正答が一意か（他の選択肢も条件次第で正しくならないか）
4. 各誤答選択肢が確実に誤りか、`why` の誤り理由が正確か。**計算問題では、誤答の why に書かれた誤った導出を実際に計算し、その選択肢の値が本当に出るかを確かめる**（「計算を誤った場合」のような曖昧な説明は具体化する）
5. `exp`（解説）と `know`（関連知識）の事実関係、正答との整合、途中式の正しさ
6. シラバス適合：`topic` の論点が内容と合っているか、解答に必要な知識が FE（Ver.9.2）の範囲内か。H2 の `scope` が実態と合っているか
7. 難易度 `diff`：1 基礎（用語の同定）/ 2 標準 / 3 応用（複数段階・複合）/ 4 高難度（3 段階以上の推論・複数論点の統合・初見条件の応用。長文・計算量・用語の多さだけでは 4 にしない）
8. 重複：同じバッチ内・既存問題と実質同一（数値替え・言い換え・選択肢の並べ替えだけ）でないか。疑わしければ `grep` で他ファイルも確認
9. 表示：YAML の型（`: ` を含む素のスカラー、`yes/no/NULL`）、表 `| |`、コードブロック、`[[語]]` リンク、選択肢記号（ア〜エ）を exp・why・know で参照していないか（シャッフルされるため。IPA と noShuffle は例外）
10. `terms` の用語が問題の内容に合っているか
11. 計算問題の `verify.value` が正答値の直書きではなく独立した計算式か。擬似言語の `verify.cases` が正解だけを通すか、`fills` と `c` の対応が同じ位置か
12. 出典：IPA 問題は `source` の年度・問題番号・改変の記載が妥当か

擬似言語・SQL の実行：`npm run content` が verify を実行する。個別に試すときは
`node tools/run-ts.mjs` 経由でなくてもよいので、`src/pseudo/interpreter.ts` の `runProgram(program, entry, args, options)` を一時スクリプトから呼ぶか、`verify` を書き換えてビルドで確認する。SQL は `node:sqlite`（Node 22）で実行できる。

## 3. 修正

- 誤りは YAML を直接直す（生成物 `public/data`・`docs/generated` は手で直さない）。問題 ID は変えない。
- 正答が誤っている／一意でない場合：問題文・選択肢を直して一意にし、`why`・`exp` を整合させ、検証式（`verify`）を追加・修正する。直せない場合はその問題に `status: rejected` と `rejectReason` を付けて隔離する（隔離は最後の手段。記録必須）。
- 選択肢を入れ替える場合は `why` と `fills`（あれば `sqlChoices`）を必ず同じ順に入れ替える。
- 正解の選択肢の why は「正解です。」で始め、他は誤りの理由を書く。
- 修正後は `npm run content`（エラー 0）と `npx vitest run tests/unit/content-source.test.ts` を通す。
- ファイル先頭の `reviewed:` は変更しない（台帳で記録する）。
- 担当外のファイルは編集しない。担当外の問題に疑義を見つけたら findings に書く。

## 4. 監査台帳（必須・問題ごとに 1 行）

`docs/audit/questions/<バッチID>.jsonl` に、担当の全問について 1 行ずつ JSON を書く（1 行 1 問、公開中の全 ID）。

```json
{"id":"A01-001","file":"content/questions/A/01-basic-theory.yaml","auditCommit":"ef1a292","date":"2026-11-04","auditor":"audit-<バッチID>","method":"blind-solve, full-review, recalculation","blindAnswer":"イ","blindMatch":true,"structure":"ok","answer":"ok","distractors":"ok","explanation":"ok","syllabus":"ok (1-1-1)","difficulty":"ok","duplicate":"ok","severity":"none","action":"none","uncertainty":"","reaudit":"pending"}
```

- `answer`・`distractors`・`explanation`・`syllabus`・`difficulty`・`duplicate` は `ok` か、見つけた問題の具体的な記述（例 `fixed: 誤答「48」の why の導出が 36 になるため 2×24 の誤りに修正`）。
- `blindAnswer` は照合前に出した解答。`method` には実際に行ったこと（`recalculation`、`trace`、`sql-run`、`primary-source: <URL>` など）だけを書く。
- `severity`：none / Low（表記）/ Medium（個別の教材誤り・解説の不整合）/ High（正答誤り・複数正解・シラバス逸脱・実質重複）/ Critical（多数に波及する誤採点）。
- `action`：none、または修正内容の要約。隔離は `rejected: 理由`。
- `uncertainty`：一次資料で確かめられなかった点など。無ければ空文字。
- 実施していない検証を書かない。

## 5. 報告

`docs/audit/findings/<バッチID>.md` に、発見した問題（ID・重要度・内容・修正）と盲検の照合結果（一致数／不一致数と各不一致の結論）を書く。最後に `git add -A && git commit`（メッセージ末尾に `Co-Authored-By: Claude <noreply@anthropic.com>`）。push はしない。
