import { signedDiff } from './angles';
import type { BodyId } from './bodies';

export const ASPECT_TYPES = ['conjunction', 'opposition', 'trine', 'square', 'sextile'] as const;
export type AspectType = (typeof ASPECT_TYPES)[number];
export const ASPECT_ANGLE: Record<AspectType, number> = {
  conjunction: 0, opposition: 180, trine: 120, square: 90, sextile: 60,
};
export type OrbTable = Record<AspectType, number>;
export const NATAL_ORBS: OrbTable = { conjunction: 8, opposition: 8, trine: 7, square: 7, sextile: 5 };
export const CROSS_ORBS: OrbTable = { conjunction: 3, opposition: 3, trine: 3, square: 3, sextile: 2 };

export type PointId = BodyId | 'asc' | 'mc';
export type Point = { id: PointId; lon: number };
export type Aspect = { a: PointId; b: PointId; type: AspectType; orb: number };

export function findAspect(lonA: number, lonB: number, orbs: OrbTable, bonus = 0) {
  const sep = Math.abs(signedDiff(lonA, lonB));
  let best: { type: AspectType; orb: number } | null = null;
  for (const type of ASPECT_TYPES) {
    const orb = Math.abs(sep - ASPECT_ANGLE[type]);
    if (orb <= orbs[type] + bonus && (!best || orb < best.orb)) best = { type, orb };
  }
  return best;
}

const LUMINARY = new Set<PointId>(['sun', 'moon']);
const byOrb = (x: Aspect, y: Aspect) => x.orb - y.orb;

export function natalAspects(points: Point[]): Aspect[] {
  const out: Aspect[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p = points[i];
      const q = points[j];
      if ((p.id === 'asc' && q.id === 'mc') || (p.id === 'mc' && q.id === 'asc')) continue;
      const bonus = LUMINARY.has(p.id) || LUMINARY.has(q.id) ? 2 : 0;
      const hit = findAspect(p.lon, q.lon, NATAL_ORBS, bonus);
      if (hit) out.push({ a: p.id, b: q.id, ...hit });
    }
  }
  return out.sort(byOrb);
}

export function crossAspects(outer: Point[], inner: Point[], orbs: OrbTable = CROSS_ORBS): Aspect[] {
  const out: Aspect[] = [];
  for (const p of outer) {
    for (const q of inner) {
      const hit = findAspect(p.lon, q.lon, orbs);
      if (hit) out.push({ a: p.id, b: q.id, ...hit });
    }
  }
  return out.sort(byOrb);
}
