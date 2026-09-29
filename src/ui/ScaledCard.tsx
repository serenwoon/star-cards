import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { CARD_H, CARD_W } from '../cards/CardFrame';

/** 1080×1920 카드를 부모 폭에 맞춰 축소해 보여 준다. 캡처는 안쪽 원래 크기 노드로 한다. */
export function ScaledCard({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = outer.current!;
    if (el.clientWidth > 0) setScale(el.clientWidth / CARD_W);
    const ro = new ResizeObserver(() => { const w = el.clientWidth; if (w > 0) setScale(w / CARD_W); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={outer} className="scaled" style={scale > 0 ? { height: Math.round(CARD_H * scale) } : undefined}>
      <div className="scaled-inner" style={{ transform: `scale(${scale})`, visibility: scale > 0 ? 'visible' : 'hidden' }}>{children}</div>
    </div>
  );
}
