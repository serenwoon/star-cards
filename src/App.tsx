import { useCallback, useMemo, useRef, useState } from 'react';
import { computeChart } from './astro/chart';
import { cityById } from './lib/cities';
import { clearLastInput, loadLastInput, saveLastInput, type BirthInput } from './lib/store';
import { buildCards, type CardSet } from './cards/model';
import { BirthForm } from './ui/BirthForm';
import { CardDeck } from './ui/CardDeck';
import { CardActions } from './ui/CardActions';
import { canShareFiles, cardToBlob, downloadBlob, fileName, classifyShareError, isAbort, shareFiles } from './share/exportCard';
import './cards/cards.css';
import './ui/ui.css';

export default function App() {
  const [input, setInput] = useState<BirthInput | null>(loadLastInput);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const built = useMemo((): { result: { cardSet: CardSet; status: string } | null; error: string | null } => {
    if (!input) return { result: null, error: null };
    const city = cityById(input.cityId);
    if (!city) return { result: null, error: '저장된 도시를 찾을 수 없어요. 다시 골라 주세요.' };
    try {
      const chart = computeChart({ date: input.date, time: input.time, lat: city.lat, lon: city.lon, tz: city.tz, system: 'placidus' });
      return { result: { cardSet: buildCards(chart, input.name || null), status: chart.timeStatus }, error: null };
    } catch {
      return { result: null, error: '이 날짜로는 계산하지 못했어요. 입력을 확인해 주세요.' };
    }
  }, [input]);
  const set = built.result;
  const [all, setAll] = useState<'idle' | 'busy' | 'error'>('idle');
  // 공유 제스처가 만료됐을 때 만들어 둔 파일. 카드 묶음이 바뀌면 무효.
  const [ready, setReady] = useState<{ forSet: CardSet; files: File[] } | null>(null);
  const readyFiles = set && ready?.forSet === set.cardSet ? ready.files : null;
  const cardNode = (i: number) => nodes.current[i]?.firstElementChild as HTMLElement | null;
  async function downloadFiles(files: File[]) {
    for (const f of files) {
      downloadBlob(f, f.name);
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  async function saveAll() {
    if (!set) return;
    setAll('busy');
    try {
      if (readyFiles) {
        // 새 탭(새 제스처) 안에서 곧바로 공유
        try {
          await shareFiles(readyFiles, 'star-cards');
        } catch (e) {
          if (classifyShareError(e) === 'abort') { setAll('idle'); return; }
          await downloadFiles(readyFiles);
        }
        setReady(null);
        setAll('idle');
        return;
      }
      const files: File[] = [];
      for (let i = 0; i < set.cardSet.cards.length; i++) {
        const node = cardNode(i);
        if (!node) throw new Error('카드를 찾지 못했어요');
        const name = fileName(i, set.cardSet.cards[i].title);
        files.push(new File([await cardToBlob(node)], name, { type: 'image/png' }));
      }
      if (canShareFiles()) {
        try {
          await shareFiles(files, 'star-cards');
        } catch (e) {
          const kind = classifyShareError(e);
          if (kind === 'abort') { setAll('idle'); return; }
          setReady({ forSet: set.cardSet, files });
          setAll('idle');
          return;
        }
      } else {
        await downloadFiles(files);
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
          <button type="button" disabled={all === 'busy'} aria-busy={all === 'busy'} onClick={saveAll}>
            {all === 'busy' ? '만드는 중…' : readyFiles ? '준비됐어요 · 눌러서 6장 공유' : shareAll ? '6장 모두 공유' : '6장 모두 저장'}
          </button>
          {all === 'error' && <span className="err" role="alert">저장하지 못했어요</span>}
        </div>
      )}
      {set && (
        <CardDeck
          set={set.cardSet}
          onCardNode={onCardNode}
          renderActions={(i) => <CardActions index={i} title={set.cardSet.cards[i].title} resetKey={set.cardSet} getNode={() => cardNode(i)} />}
        />
      )}
      <footer className="foot">
        점성술 해설은 재미와 자기 성찰용입니다. 천체 위치는 astronomy-engine으로 계산합니다.
        도시 데이터: <a href="https://www.geonames.org/">GeoNames</a> (CC BY 4.0), 가공.
      </footer>
    </div>
  );
}
