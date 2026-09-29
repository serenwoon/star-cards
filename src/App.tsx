import { useCallback, useMemo, useRef, useState } from 'react';
import { computeChart } from './astro/chart';
import { cityById } from './lib/cities';
import { clearLastInput, loadLastInput, saveLastInput, type BirthInput } from './lib/store';
import { buildCards, type CardSet } from './cards/model';
import { BirthForm } from './ui/BirthForm';
import { CardDeck } from './ui/CardDeck';
import { CardActions } from './ui/CardActions';
import { canShareFiles, cardToBlob, downloadBlob, fileName, isAbort, shareFiles } from './share/exportCard';
import './cards/cards.css';
import './ui/ui.css';

export default function App() {
  const [input, setInput] = useState<BirthInput | null>(loadLastInput);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const built = useMemo((): { set: { set: CardSet; status: string } | null; error: string | null } => {
    if (!input) return { set: null, error: null };
    const city = cityById(input.cityId);
    if (!city) return { set: null, error: '저장된 도시를 찾을 수 없어요. 다시 골라 주세요.' };
    try {
      const chart = computeChart({ date: input.date, time: input.time, lat: city.lat, lon: city.lon, tz: city.tz, system: 'placidus' });
      return { set: { set: buildCards(chart, input.name || null), status: chart.timeStatus }, error: null };
    } catch {
      return { set: null, error: '이 날짜로는 계산하지 못했어요. 입력을 확인해 주세요.' };
    }
  }, [input]);
  const set = built.set;
  const [all, setAll] = useState<'idle' | 'busy' | 'error'>('idle');
  const cardNode = (i: number) => nodes.current[i]?.firstElementChild as HTMLElement | null;
  async function saveAll() {
    if (!set) return;
    setAll('busy');
    try {
      const blobs: { blob: Blob; name: string }[] = [];
      for (let i = 0; i < set.set.cards.length; i++) {
        const node = cardNode(i);
        if (!node) throw new Error('카드를 찾지 못했어요');
        blobs.push({ blob: await cardToBlob(node), name: fileName(i, set.set.cards[i].title) });
      }
      if (canShareFiles()) {
        await shareFiles(blobs.map((b) => new File([b.blob], b.name, { type: 'image/png' })), 'star-cards');
      } else {
        for (const b of blobs) {
          downloadBlob(b.blob, b.name);
          await new Promise((r) => setTimeout(r, 300));
        }
      }
      setAll('idle');
    } catch (e) {
      setAll(isAbort(e) ? 'idle' : 'error');
    }
  }
  const shareAll = canShareFiles();
  const onCardNode = useCallback((i: number, el: HTMLDivElement | null) => { nodes.current[i] = el; }, []);

  return (
    <div className="app">
      <header className="top"><h1>star-cards</h1><p>생년월일로 나의 별자리 카드를 만들어요</p></header>
      <BirthForm
        initial={input}
        onSubmit={(v) => { saveLastInput(v); setInput(v); }}
        onClear={() => { clearLastInput(); setInput(null); }}
      />
      {built.error && <p className="err" role="alert">{built.error}</p>}
      {set?.status === 'gap' && <p className="warn">서머타임 전환으로 없는 시각이라 전환 전 시간으로 계산했어요.</p>}
      {set?.status === 'overlap' && <p className="warn">서머타임이 끝나 두 번 있는 시각이라 앞쪽 시각으로 계산했어요.</p>}
      {set && <p className="swipe-hint">옆으로 넘겨 보세요</p>}
      {set && (
        <div className="deck-tools">
          <button type="button" disabled={all === 'busy'} onClick={saveAll}>
            {all === 'busy' ? '만드는 중…' : shareAll ? '6장 모두 공유' : '6장 모두 저장'}
          </button>
          {all === 'error' && <span className="err">저장하지 못했어요</span>}
        </div>
      )}
      {set && (
        <CardDeck
          set={set.set}
          onCardNode={onCardNode}
          renderActions={(i) => <CardActions index={i} title={set.set.cards[i].title} getNode={() => cardNode(i)} />}
        />
      )}
      <footer className="foot">
        점성술 해설은 재미와 자기 성찰용입니다. 천체 위치는 astronomy-engine으로 계산합니다.
        도시 데이터: <a href="https://www.geonames.org/">GeoNames</a> (CC BY 4.0), 가공.
      </footer>
    </div>
  );
}
