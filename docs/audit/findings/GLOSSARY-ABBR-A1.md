# GLOSSARY-ABBR-A1 発見事項

対象 109 語（略語の正式名称の外部照合）。台帳は `docs/audit/glossary-abbr/A1.jsonl`。
結果：primary 43 / secondary 64 / none 2。実在しない展開・別分野の展開は見つからなかった。

## 修正（4 件）

| 用語 | 重要度 | 内容 | 修正 |
| --- | --- | --- | --- |
| DIMM | 低 | 綴りが Dual Inline。IBM 等は dual in-line | fullName・words を Dual In-line に修正 |
| SAN | 低 | SNIA 辞典は Server Area Network、System Area Network も挙げる | 定義に Storage Area Network の意味で用いると明記 |
| PPM | 低 | プロジェクト・ポートフォリオ・マネジメントの用法もある | 定義に BCG の製品・事業分析を指すことと別義を明記 |
| CAAT | 低 | 日本語は「コンピュータ利用監査技法」とも訳される（PwC） | 定義に別訳を追記 |

## 確認できなかった・留意（修正せず残したもの）

- 55 完全性：JIS Q 27000 本文の定義を取得できず（none）。略語ではなく用語対訳のため残す。
- 93 CAD：JIS・学会の定義文が見つからず（none）。一般的な略語として残す。
- TR分割：fullName は Transaction の 1 語。@IT MONOist の問題解説（二次情報）のみ。
- DVFS：Linux kernel は Switching と書く箇所があるが、一般には Scaling。統一定義は未確認。
- C&Cサーバ：日本語「指令サーバ」の公的出典は未確認。
- ITIL：AXELOS ページに展開の記載はなく、ITIL 4 以降の表記は未確認のため定義は変更せず。
- NISC：2025 年に国家サイバー統括室へ改組済み（防衛省白書で確認）。定義に記載済み。
- NFV：ETSI は英式綴り Virtualisation。米式綴りも通用するため変更せず。
- 日本語訳のみ公的出典が無いもの（JIT コンパイラ、SoE、GPS、GDPR、IEEE、M2M、NS図 など）は台帳の note に記載。
- 二次情報のみ（64 語）は台帳で checked=secondary。
