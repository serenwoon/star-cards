import type { Chart } from '../astro/chart';
import type { BodyId } from '../astro/bodies';
import { balance } from '../astro/balance';
import { ELEMENT, signOf, type Element, type SignId } from '../astro/zodiac';
import { SIGNS } from '../content/signs';
import { SUN_LINE, MOON_LINE, ASC_LINE } from '../content/cards/big3';
import { TRAITS } from '../content/cards/traits';
import { VENUS_LINE, MARS_LINE, MC_LINE, SATURN_LINE, JUPITER_LINE } from '../content/cards/lines';
import { ELEMENT_LINE, tieLine } from '../content/cards/elements';

export type SignRef = { id: SignId; ko: string; glyph: string };
export type CardData =
  | { kind: 'big3'; title: '나의 빅쓰리'; sun: SignRef; moon: SignRef; asc: SignRef | null;
      sunLine: string; moonLine: string; ascLine: string | null }
  | { kind: 'traits'; title: '성격 키워드'; sign: SignRef; tags: [string, string, string]; strength: string; weakness: string }
  | { kind: 'love'; title: '연애 스타일'; venus: SignRef; mars: SignRef; venusLine: string; marsLine: string }
  | { kind: 'work'; title: '일과 목표'; primary: { label: 'MC' | '목성'; sign: SignRef; line: string };
      saturn: { sign: SignRef; line: string } }
  | { kind: 'elements'; title: '원소 밸런스'; counts: Record<Element, number>; top: Element[]; line: string }
  | { kind: 'chart'; title: '출생 차트'; chart: Chart };
export type CardSet = { element: Element; name: string | null; timeKnown: boolean; cards: CardData[] };

export const ELEMENT_ORDER: Element[] = ['fire', 'earth', 'air', 'water'];

const ref = (id: SignId): SignRef => ({ id, ko: SIGNS[id].ko, glyph: SIGNS[id].glyph });

export function buildCards(chart: Chart, name: string | null): CardSet {
  const signOfBody = (id: BodyId) => signOf(chart.bodies.find((b) => b.id === id)!.lon);
  const sun = signOfBody('sun');
  const moon = signOfBody('moon');
  const asc = chart.houses ? signOf(chart.houses.asc) : null;
  const venus = signOfBody('venus');
  const mars = signOfBody('mars');
  const saturn = signOfBody('saturn');
  const primary = chart.houses
    ? { label: 'MC' as const, sign: ref(signOf(chart.houses.mc)), line: MC_LINE[signOf(chart.houses.mc)] }
    : { label: '목성' as const, sign: ref(signOfBody('jupiter')), line: JUPITER_LINE[signOfBody('jupiter')] };

  const counts = balance(chart.bodies).element;
  const max = Math.max(...ELEMENT_ORDER.map((e) => counts[e]));
  const top = ELEMENT_ORDER.filter((e) => counts[e] === max);
  const elementLine = top.length === 1 ? ELEMENT_LINE[top[0]] : tieLine(top[0], top[1]);

  const trimmed = name?.trim() ?? '';
  return {
    element: ELEMENT[sun],
    name: trimmed ? trimmed : null,
    timeKnown: chart.timeKnown,
    cards: [
      { kind: 'big3', title: '나의 빅쓰리', sun: ref(sun), moon: ref(moon), asc: asc ? ref(asc) : null,
        sunLine: SUN_LINE[sun], moonLine: MOON_LINE[moon], ascLine: asc ? ASC_LINE[asc] : null },
      { kind: 'traits', title: '성격 키워드', sign: ref(sun), ...TRAITS[sun] },
      { kind: 'love', title: '연애 스타일', venus: ref(venus), mars: ref(mars),
        venusLine: VENUS_LINE[venus], marsLine: MARS_LINE[mars] },
      { kind: 'work', title: '일과 목표', primary, saturn: { sign: ref(saturn), line: SATURN_LINE[saturn] } },
      { kind: 'elements', title: '원소 밸런스', counts, top, line: elementLine },
      { kind: 'chart', title: '출생 차트', chart },
    ],
  };
}
