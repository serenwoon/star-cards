import { useMemo } from 'react';
import { computeChart } from './astro/chart';
import { buildCards, type CardData, type CardSet } from './cards/model';
import { CardView } from './cards/cards';
import { SUN_LINE, MOON_LINE, ASC_LINE } from './content/cards/big3';
import { TRAITS } from './content/cards/traits';
import { VENUS_LINE, MARS_LINE, MC_LINE, SATURN_LINE } from './content/cards/lines';
import './cards/cards.css';

const longest = (xs: string[]) => xs.reduce((a, b) => (b.length > a.length ? b : a));
const longestOf = (t: Record<string, string>) => longest(Object.values(t));

// 임시: 가장 긴 실제 문장으로 채운 최악 조건 카드 세트
function worstCase(set: CardSet): CardSet {
  const traits = Object.values(TRAITS);
  const cards = set.cards.map((c): CardData => {
    switch (c.kind) {
      case 'big3': return { ...c, sunLine: longestOf(SUN_LINE), moonLine: longestOf(MOON_LINE), ascLine: longestOf(ASC_LINE) };
      case 'traits': return { ...c, strength: longest(traits.map((t) => t.strength)), weakness: longest(traits.map((t) => t.weakness)) };
      case 'love': return { ...c, venusLine: longestOf(VENUS_LINE), marsLine: longestOf(MARS_LINE) };
      case 'work': return { ...c, primary: { ...c.primary, line: longestOf(MC_LINE) }, saturn: { ...c.saturn, line: longestOf(SATURN_LINE) } };
      default: return c;
    }
  });
  return { ...set, name: 'ABCDEFGHIJKL', cards };
}

export default function App() {
  const { set, worst } = useMemo(() => {
    const s = buildCards(computeChart({ date: '1990-05-15', time: '14:30', lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul', system: 'placidus' }), '예시');
    return { set: s, worst: worstCase(s) };
  }, []);
  return (
    <div style={{ display: 'grid', gap: 40, transform: 'scale(.3)', transformOrigin: 'top left' }}>
      {set.cards.map((c, i) => <CardView key={c.kind} set={set} card={c} index={i} />)}
      {worst.cards.map((c, i) => <CardView key={`w-${c.kind}`} set={worst} card={c} index={i} />)}
    </div>
  );
}
