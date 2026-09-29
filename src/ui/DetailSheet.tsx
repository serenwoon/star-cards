import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import type { Detail } from '../cards/detail';

/** 카드 해설 창. 휴대폰은 아래에서 올라오는 시트, 넓은 화면은 가운데 창(ui.css). */
export function DetailSheet({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  // 배경에서 누르기 시작해 배경에서 뗀 경우만 닫는다(본문을 끌다가 밖에서 떼면 닫지 않음)
  const downOnBackdrop = useRef(false);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useEffect(() => {
    // 연 요소(카드)를 기억했다가 닫힐 때 돌려준다
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  // 창 밖으로 Tab이 새지 않게 가둔다
  function trapTab(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !panel.current) return;
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  return (
    <div className="detail-backdrop"
      onPointerDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => {
        const ok = downOnBackdrop.current && e.target === e.currentTarget;
        downOnBackdrop.current = false;
        if (ok) onClose();
      }}>
      <div ref={panel} className="detail-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={trapTab}>
        <div className="detail-head">
          <h2 id={titleId}>{detail.title}</h2>
          <button ref={closeBtn} type="button" className="detail-close" onClick={onClose}>닫기</button>
        </div>
        {/* 키보드로도 본문을 스크롤할 수 있게 초점을 받는다 */}
        <div className="detail-body" tabIndex={0} role="region" aria-labelledby={titleId}>
          {detail.sections.map((s, i) => (
            <section key={i} className="detail-section">
              <h3>{s.heading}</h3>
              {s.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
              {s.rows && (
                <table className="detail-table">
                  {s.columns && (
                    <thead><tr>{s.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
                  )}
                  <tbody>
                    {s.rows.map((r, j) => (
                      <tr key={j}>{r.map((cell, k) => (k === 0 ? <th key={k} scope="row">{cell}</th> : <td key={k}>{cell}</td>))}</tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
