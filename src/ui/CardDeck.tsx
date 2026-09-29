import type { KeyboardEvent, ReactNode } from 'react';
import type { CardSet } from '../cards/model';
import { CardView } from '../cards/cards';
import { ScaledCard } from './ScaledCard';

export function CardDeck({ set, onCardNode, onOpen, renderActions }: {
  set: CardSet;
  onCardNode: (index: number, el: HTMLDivElement | null) => void;
  onOpen?: (index: number) => void;
  renderActions?: (index: number) => ReactNode;
}) {
  const onKey = (i: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(i); }
  };
  return (
    <ol className="deck" aria-label="나의 별자리 카드">
      {set.cards.map((c, i) => (
        <li key={c.kind} className="deck-item">
          {/* 저장·공유 버튼(renderActions)은 이 영역 밖이라 눌러도 해설이 열리지 않는다 */}
          <div className="card-open" role="button" tabIndex={0} aria-label={`${c.title} 자세히 보기`}
            onClick={() => onOpen?.(i)} onKeyDown={onKey(i)}>
            <ScaledCard>
              <div ref={(el) => onCardNode(i, el)}><CardView set={set} card={c} index={i} /></div>
            </ScaledCard>
          </div>
          {renderActions?.(i)}
        </li>
      ))}
    </ol>
  );
}
