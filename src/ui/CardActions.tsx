import { useState } from 'react';
import { canShareFiles, cardToBlob, classifyShareError, downloadBlob, fileName, shareFiles } from '../share/exportCard';

export function CardActions({ index, title, resetKey, getNode }: { index: number; title: string; resetKey: unknown; getNode: () => HTMLElement | null }) {
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');
  const share = canShareFiles();
  const [cached, setCached] = useState<{ key: unknown; file: File } | null>(null);
  const file = cached && cached.key === resetKey ? cached.file : null;

  async function run(mode: 'save' | 'share') {
    setState('busy');
    try {
      if (mode === 'share' && file) {
        // 제스처 만료 뒤 새 탭: 만들어 둔 파일을 바로 공유
        try {
          await shareFiles([file], title);
        } catch (e) {
          if (classifyShareError(e) === 'abort') { setState('idle'); return; }
          downloadBlob(file, file.name);
        }
        setCached(null);
        setState('idle');
        return;
      }
      const node = getNode();
      if (!node) throw new Error('카드를 찾지 못했어요');
      const blob = await cardToBlob(node);
      const name = fileName(index, title);
      if (mode === 'share') {
        const f = new File([blob], name, { type: 'image/png' });
        try { await shareFiles([f], title); } catch (e) {
          const kind = classifyShareError(e);
          if (kind === 'abort') { setState('idle'); return; }
          if (kind === 'expired') { setCached({ key: resetKey, file: f }); setState('idle'); return; }
          downloadBlob(blob, name);
        }
      } else downloadBlob(blob, name);
      setState('idle');
    } catch (e) {
      setState(classifyShareError(e) === 'abort' ? 'idle' : 'error');
    }
  }

  return (
    <div className="card-actions">
      <button type="button" disabled={state === 'busy'} aria-busy={state === 'busy'} aria-label={`${title} 저장`} onClick={() => run('save')}>{state === 'busy' ? '만드는 중…' : '저장'}</button>
      {share && <button type="button" disabled={state === 'busy'} aria-busy={state === 'busy'} aria-label={`${title} 공유`} onClick={() => run('share')}>{file ? '준비됐어요 · 눌러서 공유' : '공유'}</button>}
      {state === 'error' && <span className="err" role="alert">저장하지 못했어요 · 다시 눌러 주세요</span>}
    </div>
  );
}
