// js-yaml は型定義を同梱しないため、テストで使う範囲だけ宣言する
declare module 'js-yaml' {
  const yaml: { load(src: string): unknown };
  export default yaml;
}
