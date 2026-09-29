import { useMemo } from 'react';
import { computeChart } from './astro/chart';
import { buildCards } from './cards/model';
import { CardView } from './cards/cards';
import './cards/cards.css';

export default function App() {
  const set = useMemo(() => buildCards(computeChart({ date: '1990-05-15', time: '14:30', lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul', system: 'placidus' }), '예시'), []);
  return <div style={{ display: 'grid', gap: 40, transform: 'scale(.3)', transformOrigin: 'top left' }}>{set.cards.map((c, i) => <CardView key={c.kind} set={set} card={c} index={i} />)}</div>;
}
