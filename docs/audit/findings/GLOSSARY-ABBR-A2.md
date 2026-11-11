# GLOSSARY-ABBR-A2 発見事項

対象: 略語 108 語の fullName / japanese の外部照合。結果は primary 54、secondary 54、none 0。台帳は `docs/audit/glossary-abbr/A2.jsonl`。

## 修正

- CCB（content/glossary/14-pm.yaml）: NIST 用語集は CCB を Configuration Control Board と定義し、PM 文脈では Change Control Board。複数の展開があるため、定義に両方を明示した。fullName は変更なし。

## 実在しない・捏造と判断した展開

なし。

## 注意（修正せず維持）

- BNF: 元は Backus Normal Form、Knuth の提案で Backus-Naur Form。
- SQL: ISO/IEC 9075 の題名は Database languages SQL。Structured Query Language は通称。
- AML・CFT: CFT は Combating（FATF 系）と Countering の両表記がある。FATF・金融庁ページは取得できず（403/404）。
- PL法: 英語の法令名 Product Liability Act は未確認。
- BPMS: 一次資料で Business Process Management System の展開は未確認（Wikipedia は BPM suite）。
- MP3: ISO は Layer III、Fraunhofer は Layer-3。
- UPS: IEC 62040 の題名は Uninterruptible power systems。Supply は通称。
- COSO: coso.org で『…of the Treadway Commission』の完全形の逐語確認はできず。
- 二次情報のみの語は台帳の checked=secondary。IEC・ANSI は公式サイトが 403 で取得できなかった。
- 照合手段の制約: 検索回数の上限に一度達し、リセット後に残りを再検索した。取得できなかったものは推測で埋めていない。
