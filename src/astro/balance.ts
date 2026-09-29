import type { BodyPos } from './bodies';
import { ELEMENT, MODALITY, signOf, type Element, type Modality } from './zodiac';

export function balance(bodies: BodyPos[]) {
  const element: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modality: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const b of bodies) {
    if (b.id === 'node') continue;
    const s = signOf(b.lon);
    element[ELEMENT[s]]++;
    modality[MODALITY[s]]++;
  }
  return { element, modality };
}
