import { Body, Ecliptic, GeoVector, MakeTime } from 'astronomy-engine';
import { norm, signedDiff } from './angles';

export const BODY_IDS = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node',
] as const;
export type BodyId = (typeof BODY_IDS)[number];
export type BodyPos = { id: BodyId; lon: number; retro: boolean };

const ENGINE: Record<Exclude<BodyId, 'node'>, Body> = {
  sun: Body.Sun, moon: Body.Moon, mercury: Body.Mercury, venus: Body.Venus, mars: Body.Mars,
  jupiter: Body.Jupiter, saturn: Body.Saturn, uranus: Body.Uranus, neptune: Body.Neptune, pluto: Body.Pluto,
};
const HOUR = 3_600_000;

/** 평균 북쪽 노드(Meeus 47.7). */
export function meanNode(utc: Date): number {
  const T = MakeTime(utc).tt / 36525;
  return norm(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000);
}

/** 지심 겉보기 황경, 그날의 참 황도·춘분점 기준. */
export function eclipticLon(id: BodyId, utc: Date): number {
  if (id === 'node') return meanNode(utc);
  return norm(Ecliptic(GeoVector(ENGINE[id], utc, true)).elon);
}

export function bodyPositions(utc: Date): BodyPos[] {
  const t = utc.getTime();
  return BODY_IDS.map((id) => {
    const lon = eclipticLon(id, utc);
    const speed = signedDiff(eclipticLon(id, new Date(t + HOUR)), eclipticLon(id, new Date(t - HOUR)));
    return { id, lon, retro: speed < 0 };
  });
}
