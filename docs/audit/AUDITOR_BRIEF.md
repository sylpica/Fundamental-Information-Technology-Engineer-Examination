# 全件意味監査 実施要領（2026-11 監査）

監査対象コミット：`423f598`（監査開始時点）。本要領は問題の意味監査担当（グループ gNN）向け。

## 担当範囲と禁止事項

- 担当グループに割り当てられた YAML ファイル**だけ**を編集する。他のファイル（用語辞典、他グループの問題、src/、tools/、docs/ の他文書）は編集しない。
- `git` の状態を変える操作（commit、checkout、stash、reset、add など）はしない。`git diff` の閲覧は可。
- 生成物（public/data、docs/generated）を直接編集しない。検証は書き出しなしの `node tools/run-ts.mjs tools/build-content.ts --check` を使う（`npm run content` は使わない）。
- 問題 ID を変更しない。問題を削除しない（隔離は `status: rejected` と `rejectReason`）。
- 用語辞典の修正が必要なら台帳の `glossaryNotes` に書く（統合担当が反映）。

## 1問ごとの手順（全問、サンプリング禁止）

1. `node tools/audit/qview.mjs show <ID>` で**正答・解説を伏せて**表示し、自力で解く。計算は途中式を自分で書き、擬似言語は `node tools/run-ts.mjs tools/audit/pseudo-run.ts <file> <entry> '<jsonArgs>'` で実行（空欄は各選択肢で置換したファイルを作って実行。作業ファイルは各自のスクラッチ領域に置く）、SQL は `node -e` で `node:sqlite` の `DatabaseSync(':memory:')` に流して確認する。
2. 自分の答えを決めてから `node tools/audit/qview.mjs reveal <ID>` で登録内容を見る。
3. 次の全項目を確認する。
   1. 問題文の意味が一意に読めるか、解答に必要な条件が揃っているか
   2. 登録正答が正しいか（独立解答と一致するか。不一致なら原因を突き止める）
   3. 正答の一意性（他の選択肢が条件次第で正解になり得ないか）
   4. 各誤答が確実に誤りか
   5. 誤答の `why` が具体的で正しいか。**計算問題では、`why` に書かれた誤った計算を実際に行うと、その誤答選択肢の値に本当になるか**を必ず確かめる。「計算を誤った値」のような曖昧な説明は不可（具体的な誤り方に書き直す。どう導いても出ない値なら、そう書くのではなく、ありがちな誤りから出る値に選択肢を差し替えることも検討）
   6. 正答の `why` が「正解です。」で始まり、`exp` と矛盾しないか
   7. `exp`・`know` の事実・定義・数値が正確か（規格・法令・制度は一次資料と矛盾しないか。自信がない事実は `uncertainty` に書く）
   8. `exp`・`why`・`know` が選択肢記号（ア・イ…）に依存していないか（表示時にシャッフルされる）
   9. シラバス適合：`topic` の ID が `content/syllabus/syllabus-9.2.json`（科目Bは `content/syllabus/subject-b.yaml`）の該当論点か、解答に必要な知識が基本情報技術者試験（シラバス Ver.9.2）の範囲内か。H2 問題は `scope` の主張が実態と合うか
   10. 難易度：1 基礎（単一知識の想起）/ 2 標準（標準的な適用）/ 3 応用（複数知識の組合せ・多段推論）/ 4 高難度（3段階以上の推論、複数論点の統合、初見条件への応用、合理的な誤答。範囲内知識だけで解ける）。長文・計算量・専門用語の多さだけでは高難度にしない。過大・過小評価は修正する（diff を変えるとき、H2 で diff≥3 なら `hard` が必要）
   11. 重複：同グループ内・同分野の既存問題と、出題意図・解法が実質同一でないか（数値替え・言い換え・選択肢並べ替え）。疑わしいものは台帳に相手 ID を書く
   12. `verify.value` が正答値の定数ではなく独立した計算式か。`verify.cases` が正解だけを通すか。`fills`・`sqlChoices` が選択肢 `c` と同じ順に対応しているか
   13. `terms` が問題に関係する用語か
   14. YAML の表示（表・コードブロック・改行・`[[語|リンク]]`）が崩れないか
   15. IPA 公開問題（`content/questions/IPA/`）は原文・公式正答を改変していないか、出典記載（年度・問題番号・改変注記）が揃っているか。正答は公式解答と照合する（WebFetch で IPA の公開ページを確認してよい。確認できなければ `uncertainty` に記録）
4. 誤りがあれば YAML を修正する（最小限の修正。問題の意図を変えない）。正答の選択肢位置を変えたら `a`、`why` の並び、`fills`、`sqlChoices` を必ず同じ順に揃える。修正後は `--check` でエラー 0 を確認。
5. 正答に疑義が残り解消できない問題は `status: rejected` と `rejectReason` を付けて隔離し、台帳に理由を書く。
6. 台帳に 1 行追記する（下記）。**数問ごとに追記して保存**し、中断しても再開できるようにする。再開時は台帳を読み、未記録の ID から続ける。

## 台帳（docs/audit/questions/gNN.jsonl、1 問 1 行の JSON）

```json
{"id":"A01-002","file":"content/questions/A/01-basic-theory.yaml","baseCommit":"423f598","date":"2026-11-03","auditor":"audit-g01","method":"blind-solve, recompute, distractor-derivation","answerBlind":"イ","answer":"pass","question":"pass","distractors":"fixed: 42 の why を具体的な誤り方に修正","explanation":"pass","syllabus":"pass","difficulty":"pass","duplicate":"pass","verifyCheck":"value is formula","severity":"low","findings":"…","fixes":"…","uncertainty":"","glossaryNotes":""}
```

- `answerBlind`：伏せた状態で自分が出した答え（記号）。入力式・解けなかった場合は理由を書く。
- 各項目は `pass` / `fixed: 内容` / `quarantined: 理由` / `issue: 未修正の理由`。`difficulty` を変えたら `fixed: 3->2 理由`。
- `severity`：見つけた欠陥の重さ（none / low / medium / high / critical）。誤採点（正答誤り）は high 以上、解説の事実誤りは medium、表記は low。
- 実際に行った確認だけを書く。開いただけ・スキーマを見ただけで pass にしない。

## 最終報告（担当終了時に返す）

- 監査した問題数と ID 範囲（台帳の行数と一致させる）、正答誤り・誤答理由の誤り・事実誤り・難易度修正・隔離・重複疑いの件数と ID
- 修正したファイル、`--check` の結果
- 未解決事項（確信の持てない事実、要一次資料確認）
