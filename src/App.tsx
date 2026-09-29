import { useCallback, useMemo, useRef, useState } from 'react';
import { computeChart } from './astro/chart';
import { cityById } from './lib/cities';
import { clearLastInput, loadLastInput, saveLastInput, type BirthInput } from './lib/store';
import { buildCards } from './cards/model';
import { BirthForm } from './ui/BirthForm';
import { CardDeck } from './ui/CardDeck';
import './cards/cards.css';
import './ui/ui.css';

export default function App() {
  const [input, setInput] = useState<BirthInput | null>(loadLastInput);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const set = useMemo(() => {
    if (!input) return null;
    const city = cityById(input.cityId);
    if (!city) return null;
    const chart = computeChart({ date: input.date, time: input.time, lat: city.lat, lon: city.lon, tz: city.tz, system: 'placidus' });
    return { set: buildCards(chart, input.name || null), status: chart.timeStatus };
  }, [input]);
  const onCardNode = useCallback((i: number, el: HTMLDivElement | null) => { nodes.current[i] = el; }, []);

  return (
    <div className="app">
      <header className="top"><h1>star-cards</h1><p>생년월일로 나의 별자리 카드를 만들어요</p></header>
      <BirthForm
        initial={input}
        onSubmit={(v) => { saveLastInput(v); setInput(v); }}
        onClear={() => { clearLastInput(); setInput(null); }}
      />
      {set?.status === 'gap' && <p className="warn">서머타임 전환으로 없는 시각이라 전환 전 시간으로 계산했어요.</p>}
      {set?.status === 'overlap' && <p className="warn">서머타임이 끝나 두 번 있는 시각이라 앞쪽 시각으로 계산했어요.</p>}
      {set && <p className="swipe-hint">옆으로 넘겨 보세요</p>}
      {set && <CardDeck set={set.set} onCardNode={onCardNode} />}
      <footer className="foot">
        점성술 해설은 재미와 자기 성찰용입니다. 천체 위치는 astronomy-engine으로 계산합니다.
        도시 데이터: <a href="https://www.geonames.org/">GeoNames</a> (CC BY 4.0), 가공.
      </footer>
    </div>
  );
}
