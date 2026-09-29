import { describe, it, expect } from 'vitest';
import { computeChart } from '../src/astro/chart';
import { buildCards } from '../src/cards/model';
import { SUN_LINE, ASC_LINE } from '../src/content/cards/big3';
import { JUPITER_LINE, MC_LINE } from '../src/content/cards/lines';
import { tieLine } from '../src/content/cards/elements';
import type { Element } from '../src/astro/zodiac';

const seoul = { lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul', system: 'placidus' as const };
const known = computeChart({ date: '1990-05-15', time: '14:30', ...seoul });
const unknown = computeChart({ date: '1990-05-15', time: null, ...seoul });

describe('buildCards', () => {
  it('카드 6장, 순서 고정', () => {
    const set = buildCards(known, '나');
    expect(set.cards.map((c) => c.kind)).toEqual(['big3', 'traits', 'love', 'work', 'elements', 'chart']);
    expect(set.name).toBe('나');
  });
  it('서울 1990: 태양 황소, 달 염소, 상승궁 처녀(Swiss Ephemeris 기준값)', () => {
    const big3 = buildCards(known, null).cards[0];
    if (big3.kind !== 'big3') throw new Error();
    expect(big3.sun.id).toBe('taurus');
    expect(big3.moon.id).toBe('capricorn');
    expect(big3.asc?.id).toBe('virgo');
    expect(big3.sunLine).toBe(SUN_LINE.taurus);
    expect(big3.ascLine).toBe(ASC_LINE.virgo);
  });
  it('배경 원소 = 태양 별자리 원소', () => {
    expect(buildCards(known, null).element).toBe('earth');
  });
  it('시각 모름: 상승궁 없음, 일 카드는 목성', () => {
    const set = buildCards(unknown, null);
    const big3 = set.cards[0];
    const work = set.cards[3];
    if (big3.kind !== 'big3' || work.kind !== 'work') throw new Error();
    expect(set.timeKnown).toBe(false);
    expect(big3.asc).toBeNull();
    expect(big3.ascLine).toBeNull();
    expect(work.primary.label).toBe('목성');
    expect(work.primary.line).toBe(JUPITER_LINE[work.primary.sign.id]);
  });
  it('시각 앎: 일 카드는 MC', () => {
    const work = buildCards(known, null).cards[3];
    if (work.kind !== 'work') throw new Error();
    expect(work.primary.label).toBe('MC');
    expect(work.primary.line).toBe(MC_LINE[work.primary.sign.id]);
  });
  it('원소 개수 합 10, top은 최댓값들', () => {
    const el = buildCards(known, null).cards[4];
    if (el.kind !== 'elements') throw new Error();
    const sum = Object.values(el.counts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(10);
    const max = Math.max(...Object.values(el.counts));
    el.top.forEach((e) => expect(el.counts[e]).toBe(max));
  });
  it('이름이 빈 문자열이면 null', () => {
    expect(buildCards(known, '  ').name).toBeNull();
  });
});

const LON: Record<Element, number> = { fire: 15, earth: 45, air: 75, water: 105 };
function withElements(plan: Element[]) {
  const ids = known.bodies.filter((b) => b.id !== 'node');
  return {
    ...known,
    bodies: known.bodies.map((b) => {
      const i = ids.findIndex((x) => x.id === b.id);
      return i < 0 ? b : { ...b, lon: LON[plan[i]] };
    }),
  };
}
const rep = (e: Element, n: number) => Array<Element>(n).fill(e);

describe('원소 동점', () => {
  it('2자 동점: 불 3 / 흙 3 / 공기 2 / 물 2 → 앞 둘', () => {
    const chart = withElements([...rep('fire', 3), ...rep('earth', 3), ...rep('air', 2), ...rep('water', 2)]);
    const el = buildCards(chart, null).cards[4];
    if (el.kind !== 'elements') throw new Error();
    expect(el.top).toEqual(['fire', 'earth']);
    expect(el.line).toBe(tieLine('fire', 'earth'));
    expect(el.line).toBe('불과 흙이 비슷하게 강해요');
  });
  it('3자 동점: 불·공기·물 3 / 흙 1 → 문구는 앞 둘만', () => {
    const chart = withElements([...rep('fire', 3), ...rep('air', 3), ...rep('water', 3), 'earth']);
    const el = buildCards(chart, null).cards[4];
    if (el.kind !== 'elements') throw new Error();
    expect(el.top).toEqual(['fire', 'air', 'water']);
    expect(el.line).toBe('불과 공기가 비슷하게 강해요');
  });
});

describe('이름 다듬기', () => {
  it('앞뒤 공백을 자른다', () => {
    expect(buildCards(known, ' 나 ').name).toBe('나');
  });
});
