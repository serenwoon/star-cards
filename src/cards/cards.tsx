import type { CardData, CardSet, SignRef } from './model';
import { ELEMENT_ORDER } from './model';
import { ELEMENT_KO } from '../content/signs';
import { PLANETS } from '../content/planets';
import { CardFrame } from './CardFrame';
import { StaticWheel } from './StaticWheel';

function Sign({ label, sign }: { label: string; sign: SignRef | null }) {
  return (
    <div className="sign-row">
      <span className="sign-label">{label}</span>
      {sign ? (
        <span className="sign-name"><span className="glyph">{sign.glyph}</span>{sign.ko}</span>
      ) : (
        <span className="sign-missing">시각을 넣으면 보여요</span>
      )}
    </div>
  );
}

function Content({ card }: { card: CardData }) {
  switch (card.kind) {
    case 'big3':
      return (
        <>
          <div className="hero"><span className="glyph big">{card.sun.glyph}</span><p className="hero-name">{card.sun.ko}</p></div>
          <div className="panel">
            <Sign label="태양" sign={card.sun} />
            <p className="line">{card.sunLine}</p>
            <Sign label="달" sign={card.moon} />
            <p className="line">{card.moonLine}</p>
            <Sign label="상승궁" sign={card.asc} />
            {card.ascLine && <p className="line">{card.ascLine}</p>}
          </div>
        </>
      );
    case 'traits':
      return (
        <>
          <div className="hero"><span className="glyph big">{card.sign.glyph}</span><p className="hero-name">{card.sign.ko}</p></div>
          <div className="tags">{card.tags.map((t) => <span key={t} className="tag">#{t}</span>)}</div>
          <div className="panel">
            <p className="kicker">강점</p><p className="line">{card.strength}</p>
            <p className="kicker">약점</p><p className="line">{card.weakness}</p>
          </div>
        </>
      );
    case 'love':
      return (
        <>
        <div className="hero">
          <span className="glyph pair">{PLANETS.venus.glyph}{PLANETS.mars.glyph}</span>
          <p className="hero-name">{card.venus.ko} · {card.mars.ko}</p>
        </div>
        <div className="panel">
          <Sign label="금성 · 끌리는 것" sign={card.venus} />
          <p className="line">{card.venusLine}</p>
          <Sign label="화성 · 다가가는 방식" sign={card.mars} />
          <p className="line">{card.marsLine}</p>
        </div>
        </>
      );
    case 'work':
      return (
        <>
        <div className="hero"><span className="glyph big">{card.primary.sign.glyph}</span><p className="hero-name">{card.primary.sign.ko}</p></div>
        <div className="panel">
          <Sign label={card.primary.label === 'MC' ? 'MC · 가고 싶은 방향' : '목성 · 기회가 오는 길'} sign={card.primary.sign} />
          <p className="line">{card.primary.line}</p>
          <Sign label="토성 · 버티는 힘" sign={card.saturn.sign} />
          <p className="line">{card.saturn.line}</p>
        </div>
        </>
      );
    case 'elements':
      return (
        <>
        <div className="hero"><p className="hero-name xl">{card.top.slice(0, 2).map((e) => ELEMENT_KO[e]).join(' · ')}</p></div>
        <div className="panel">
          {ELEMENT_ORDER.map((e) => (
            <div key={e} className={`bar-row ${card.top.slice(0, 2).includes(e) ? 'top' : ''}`}>
              <span className="bar-label">{ELEMENT_KO[e]}</span>
              <span className="bar-track"><span className={`bar-fill fill-${e}`} style={{ width: `${Math.min(card.counts[e] * 10, 100)}%` }} /></span>
              <span className="bar-num">{card.counts[e]}</span>
            </div>
          ))}
          <p className="line strong">{card.line}</p>
        </div>
        </>
      );
    case 'chart':
      return <div className="wheel-wrap"><StaticWheel chart={card.chart} size={920} /></div>;
    case 'summary': {
      const parts = card.intro.split(', ');
      return (
        <>
        <div className="hero">
          <p className="hero-name intro">
            {parts.map((p, i) => <span key={p}>{p}{i < parts.length - 1 ? ',' : ''}</span>)}
          </p>
        </div>
        <div className="panel">
          <p className="kicker">타고난 기질</p><p className="line">{card.elementLine}</p>
          <p className="kicker">자라는 방향</p><p className="line">{card.growthLine}</p>
        </div>
        </>
      );
    }
  }
}

export function CardView({ set, card, index }: { set: CardSet; card: CardData; index: number }) {
  return (
    <CardFrame set={set} index={index} total={set.cards.length} title={card.title}>
      <Content card={card} />
    </CardFrame>
  );
}
