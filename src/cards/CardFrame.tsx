import type { ReactNode } from 'react';
import type { CardSet } from './model';

export const CARD_W = 1080;
export const CARD_H = 1920;

export function CardFrame({ set, index, total, title, children }: {
  set: CardSet; index: number; total: number; title: string; children: ReactNode;
}) {
  return (
    <div className={`card el-${set.element}`} data-card-index={index} style={{ width: CARD_W, height: CARD_H }}>
      <div className="card-top">
        <span className="card-no">{index + 1} / {total}</span>
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-body">{children}</div>
      <div className="card-foot">
        <span>{set.name ?? ''}</span>
        <span className="brand">star-cards</span>
      </div>
    </div>
  );
}
