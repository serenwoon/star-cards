import { useState } from 'react';
import { canShareFiles, cardToBlob, downloadBlob, fileName, isAbort, shareFiles } from '../share/exportCard';

export function CardActions({ index, title, getNode }: { index: number; title: string; getNode: () => HTMLElement | null }) {
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');
  const share = canShareFiles();

  async function run(mode: 'save' | 'share') {
    setState('busy');
    try {
      const node = getNode();
      if (!node) throw new Error('카드를 찾지 못했어요');
      const blob = await cardToBlob(node);
      const name = fileName(index, title);
      if (mode === 'share') await shareFiles([new File([blob], name, { type: 'image/png' })], title);
      else downloadBlob(blob, name);
      setState('idle');
    } catch (e) {
      setState(isAbort(e) ? 'idle' : 'error');
    }
  }

  return (
    <div className="card-actions">
      <button type="button" disabled={state === 'busy'} onClick={() => run('save')}>{state === 'busy' ? '만드는 중…' : '저장'}</button>
      {share && <button type="button" disabled={state === 'busy'} onClick={() => run('share')}>공유</button>}
      {state === 'error' && <span className="err">저장하지 못했어요 · 다시 눌러 주세요</span>}
    </div>
  );
}
