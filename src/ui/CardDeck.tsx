import type { ReactNode } from 'react';
import type { CardSet } from '../cards/model';
import { CardView } from '../cards/cards';
import { ScaledCard } from './ScaledCard';

export function CardDeck({ set, onCardNode, renderActions }: {
  set: CardSet;
  onCardNode: (index: number, el: HTMLDivElement | null) => void;
  renderActions?: (index: number) => ReactNode;
}) {
  return (
    <ol className="deck" aria-label="나의 별자리 카드">
      {set.cards.map((c, i) => (
        <li key={c.kind} className="deck-item">
          <ScaledCard>
            <div ref={(el) => onCardNode(i, el)}><CardView set={set} card={c} index={i} /></div>
          </ScaledCard>
          {renderActions?.(i)}
        </li>
      ))}
    </ol>
  );
}
