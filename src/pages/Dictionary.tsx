import { useMemo, useState } from 'react';
import { useApp } from '../app/context';
import { Link } from '../app/router';
import { matchesQuery } from '../lib/text';

export default function Dictionary() {
  const { content } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('');
  const [limit, setLimit] = useState(PAGE);
  // 分野はシラバスの中分類の順に並べる
  const cats = useMemo(() => {
    const order = content!.syllabus.majors.flatMap((M) => M.middles.map((m) => m.name));
    const present = new Set(content!.glossary.map((t) => t.category));
    return [...order.filter((n) => present.has(n)), ...[...present].filter((n) => !order.includes(n))];
  }, [content]);
  const list = content!.glossary
    .filter((t) => (!cat || t.category === cat) && (!q || matchesQuery([t.term, t.reading, t.fullName, t.japanese, t.simple, ...(((t as { aliases?: string[] }).aliases) ?? [])].join(' '), q)))
    .sort((a, b) => (a.reading ?? a.term).localeCompare(b.reading ?? b.term, 'ja'));
  return (
    <div className="stack">
      <h1 tabIndex={-1}>IT用語辞典</h1>
      <div className="row">
        <Link to="/reference" className="btn sm">コンパクト参考書</Link>
        <Link to="/lessons" className="btn sm">プログラミング講座</Link>
        <Link to="/search" className="btn sm">問題・解説も含めて検索</Link>
      </div>
      <div className="field">
        <label htmlFor="dq">用語を検索（略語・正式名称・読み方）</label>
        <input id="dq" type="search" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="例：DNS、ドメイン、ハッシュ" />
      </div>
      <div className="chips">
        <button className="chip" aria-pressed={!cat} onClick={() => { setCat(''); setLimit(PAGE); }}>すべて（{content!.glossary.length}）</button>
        {cats.map((c) => <button key={c} className="chip" aria-pressed={cat === c} onClick={() => { setCat(c); setLimit(PAGE); }}>{c}</button>)}
      </div>
      <ul className="list card" style={{ padding: '4px 14px' }}>
        {list.length === 0 && <li className="item muted small">該当する用語がありません。</li>}
        {list.slice(0, limit).map((t) => (
          <li key={t.id}>
            <Link to={`/term/${t.id}`} className="item">
              <span className="grow">
                <strong>{t.term}</strong>{t.fullName && <span className="small muted">　{t.fullName}</span>}
                <br /><span className="small muted">{t.japanese ? `${t.japanese}：` : ''}{t.simple}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length > limit && (
        <button className="btn block" onClick={() => setLimit((n) => n + PAGE)}>さらに表示（{limit} / {list.length} 語）</button>
      )}
    </div>
  );
}

// 一度に描画する件数。全 2,700 語余りを一括で描画すると長大なページになり、スマホでの表示も重くなるため
const PAGE = 100;
