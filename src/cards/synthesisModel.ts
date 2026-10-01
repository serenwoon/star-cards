import type { Chart } from '../astro/chart';
import type { BodyId, BodyPos } from '../astro/bodies';
import type { Aspect, AspectType, PointId } from '../astro/aspects';
import { balance } from '../astro/balance';
import { houseOf } from '../astro/houses';
import { signOf, type Modality, type SignId } from '../astro/zodiac';
import { SIGNS } from '../content/signs';

const MODALITY_ORDER: Modality[] = ['cardinal', 'fixed', 'mutable'];

const between = (chart: Chart, x: PointId, y: PointId) =>
  chart.aspects.find((a) => (a.a === x && a.b === y) || (a.a === y && a.b === x));

/** 태양과 달 사이의 주요 각도 그 자체. 없으면 undefined. */
export function sunMoonHit(chart: Chart): Aspect | undefined {
  return between(chart, 'sun', 'moon');
}

/** 태양과 달 사이의 주요 각도 종류. 없으면 'none'. */
export function sunMoonAspect(chart: Chart): AspectType | 'none' {
  return sunMoonHit(chart)?.type ?? 'none';
}

/**
 * 노드를 뺀 열 천체가 가장 많이 든 하우스. 시각을 모르면 null.
 * 동점이면 태양이 든 하우스, 그래도 못 가르면 번호가 작은 쪽.
 */
export function busiestHouse(chart: Chart): { house: number; bodies: BodyId[] } | null {
  if (!chart.houses) return null;
  const { cusps } = chart.houses;
  const byHouse = new Map<number, BodyId[]>();
  let sunHouse = 0;
  for (const b of chart.bodies) {
    if (b.id === 'node') continue;
    const h = houseOf(b.lon, cusps);
    if (b.id === 'sun') sunHouse = h;
    byHouse.set(h, [...(byHouse.get(h) ?? []), b.id]);
  }
  const max = Math.max(...[...byHouse.values()].map((v) => v.length));
  const tied = [...byHouse.keys()].filter((h) => byHouse.get(h)!.length === max).sort((x, y) => x - y);
  const house = tied.includes(sunHouse) ? sunHouse : tied[0];
  return { house, bodies: byHouse.get(house)! };
}

/** 가장 많은 양태들. 활동→고정→변통 순. */
export function topModality(bodies: BodyPos[]): Modality[] {
  const counts = balance(bodies).modality;
  const max = Math.max(...MODALITY_ORDER.map((m) => counts[m]));
  return MODALITY_ORDER.filter((m) => counts[m] === max);
}

/** 상승궁 별자리의 지배 행성(현대 지배 행성)이 놓인 별자리와 하우스. 시각을 모르면 null. */
export function chartRuler(chart: Chart): { planet: BodyId; sign: SignId; house: number } | null {
  if (!chart.houses) return null;
  const planet = SIGNS[signOf(chart.houses.asc)].ruler;
  const lon = chart.bodies.find((b) => b.id === planet)!.lon;
  return { planet, sign: signOf(lon), house: houseOf(lon, chart.houses.cusps) };
}

/** orb가 작은 순서로 n개. 시각을 알면 ASC·MC와 맺은 각도도 들어간다. skip은 이미 다른 자리에서 보여 준 각도. */
export function tightestAspects(chart: Chart, n: number, skip?: Aspect): Aspect[] {
  return chart.aspects.filter((a) => a !== skip).sort((x, y) => x.orb - y.orb).slice(0, n);
}

/** 토성이 태양·달과 주요 각도를 맺고 있으면 그쪽을 돌려준다. */
export function saturnTouches(chart: Chart): ('sun' | 'moon')[] {
  return (['sun', 'moon'] as const).filter((id) => between(chart, 'saturn', id) !== undefined);
}
