import { bodyPositions, type BodyPos } from './bodies';
import { computeHouses, type Houses, type HouseSystem } from './houses';
import { natalAspects, type Aspect, type Point, type PointId } from './aspects';
import { toUtc } from './time';

export type ChartInput = { date: string; time: string | null; lat: number; lon: number; tz: string; system: HouseSystem };
export type Chart = {
  utc: Date;
  timeKnown: boolean;
  timeStatus: 'ok' | 'gap' | 'overlap';
  bodies: BodyPos[];
  houses: Houses | null;
  aspects: Aspect[];
};

export function chartPoints(chart: Pick<Chart, 'bodies' | 'houses'>): Point[] {
  const pts: Point[] = chart.bodies.map((b) => ({ id: b.id, lon: b.lon }));
  if (chart.houses) pts.push({ id: 'asc', lon: chart.houses.asc }, { id: 'mc', lon: chart.houses.mc });
  return pts;
}

export function pointLon(chart: Pick<Chart, 'bodies' | 'houses'>, id: PointId): number {
  if (id === 'asc') return chart.houses!.asc;
  if (id === 'mc') return chart.houses!.mc;
  return chart.bodies.find((b) => b.id === id)!.lon;
}

const ANGLES = new Set<PointId>(['asc', 'mc']);
export function withoutAngles(list: Aspect[]): Aspect[] {
  return list.filter((a) => !ANGLES.has(a.a) && !ANGLES.has(a.b));
}

export function computeChart(input: ChartInput): Chart {
  const timeKnown = input.time !== null;
  const { utc, status } = toUtc(input.date, input.time ?? '12:00', input.tz);
  const bodies = bodyPositions(utc);
  const houses = timeKnown ? computeHouses(utc, input.lat, input.lon, input.system) : null;
  return { utc, timeKnown, timeStatus: status, bodies, houses, aspects: natalAspects(chartPoints({ bodies, houses })) };
}
