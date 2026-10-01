import { describe, it, expect } from 'vitest';
import { computeChart, chartPoints, type Chart } from '../src/astro/chart';
import { natalAspects } from '../src/astro/aspects';
import { BODY_IDS, type BodyId } from '../src/astro/bodies';
import {
  sunMoonHit, sunMoonAspect, busiestHouse, topModality, chartRuler, tightestAspects, saturnTouches,
} from '../src/cards/synthesisModel';

const seoul = { lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul', system: 'placidus' as const };
const known = computeChart({ date: '1990-05-15', time: '14:30', ...seoul });
const unknown = computeChart({ date: '1990-05-15', time: null, ...seoul });

/** 손으로 만든 차트. 하우스는 양자리 0°에서 시작하는 30°씩의 칸(lon 0~30 = 1하우스). */
function handChart(lons: Record<BodyId, number>, withHouses = true): Chart {
  const bodies = BODY_IDS.map((id) => ({ id, lon: lons[id], retro: false }));
  const houses = withHouses
    ? { system: 'whole' as const, fallback: false, asc: 0, mc: 270, cusps: Array.from({ length: 12 }, (_, i) => i * 30) }
    : null;
  return { utc: new Date(0), timeKnown: withHouses, timeStatus: 'ok', bodies, houses, aspects: natalAspects(chartPoints({ bodies, houses })) };
}
// 열 천체가 하우스 하나씩에 흩어지고 서로 각도가 거의 없는 바탕
const SPREAD: Record<BodyId, number> = {
  sun: 2, moon: 47, mercury: 78, venus: 109, mars: 140,
  jupiter: 171, saturn: 202, uranus: 233, neptune: 264, pluto: 295, node: 326,
};

describe('sunMoonAspect', () => {
  it('서울 1990은 삼분', () => {
    expect(sunMoonAspect(known)).toBe('trine');
  });
  it('각도가 없으면 none, 90°면 square', () => {
    expect(sunMoonAspect(handChart({ ...SPREAD, sun: 0, moon: 45 }))).toBe('none');
    expect(sunMoonAspect(handChart({ ...SPREAD, sun: 0, moon: 91 }))).toBe('square');
  });
  it('쌍의 순서가 뒤집혀 있어도 찾는다', () => {
    const c = handChart({ ...SPREAD, sun: 0, moon: 91 });
    const flipped = { ...c, aspects: c.aspects.map((a) => ({ ...a, a: a.b, b: a.a })) };
    expect(sunMoonAspect(flipped)).toBe('square');
  });
});

describe('sunMoonHit', () => {
  it('태양–달 각도를 그대로 돌려주고, 없으면 undefined', () => {
    expect(sunMoonHit(known)).toBe(known.aspects.find((a) => a.a === 'sun' && a.b === 'moon'));
    expect(sunMoonHit(handChart({ ...SPREAD, sun: 0, moon: 45 }))).toBeUndefined();
  });
});

describe('busiestHouse', () => {
  it('서울 1990은 4하우스에 달·토성·천왕성·해왕성', () => {
    expect(busiestHouse(known)).toEqual({ house: 4, bodies: ['moon', 'saturn', 'uranus', 'neptune'] });
  });
  it('시각을 모르면 null', () => {
    expect(busiestHouse(unknown)).toBeNull();
  });
  it('동점이면 태양이 든 하우스가 앞선다', () => {
    // 2하우스에 달·수성, 5하우스에 태양·금성
    const c = handChart({ ...SPREAD, moon: 40, mercury: 50, sun: 130, venus: 140, mars: 2 });
    expect(busiestHouse(c)).toEqual({ house: 5, bodies: ['sun', 'venus'] });
  });
  it('태양이 동점 하우스에 없으면 번호가 작은 쪽', () => {
    // 3하우스에 수성·금성, 8하우스에 천왕성·명왕성, 태양은 1하우스 혼자
    const c = handChart({ ...SPREAD, mercury: 70, venus: 80, uranus: 220, pluto: 230 });
    expect(busiestHouse(c)).toEqual({ house: 3, bodies: ['mercury', 'venus'] });
  });
  it('모두 흩어져 있으면 태양 하우스가 뽑힌다', () => {
    expect(busiestHouse(handChart({ ...SPREAD, sun: 325 }))).toEqual({ house: 11, bodies: ['sun'] });
  });
  it('북쪽 노드는 세지 않는다', () => {
    const c = handChart({ ...SPREAD, node: 50 });
    expect(busiestHouse(c)).toEqual({ house: 1, bodies: ['sun'] });
  });
});

describe('topModality', () => {
  it('서울 1990은 활동', () => {
    expect(topModality(known.bodies)).toEqual(['cardinal']);
  });
  it('동점이면 활동→고정→변통 순서로 모두', () => {
    // 활동(양 0~30) 4, 고정(황소 30~60) 4, 변통(쌍둥이 60~90) 2
    const lons = [5, 10, 15, 20, 35, 40, 45, 50, 65, 70];
    const ids = BODY_IDS.filter((id) => id !== 'node');
    const c = handChart({ ...SPREAD, ...Object.fromEntries(ids.map((id, i) => [id, lons[i]])) } as Record<BodyId, number>);
    expect(topModality(c.bodies)).toEqual(['cardinal', 'fixed']);
  });
});

describe('chartRuler', () => {
  it('서울 1990: 상승궁 처녀자리의 지배 행성 수성은 황소자리 8하우스', () => {
    expect(chartRuler(known)).toEqual({ planet: 'mercury', sign: 'taurus', house: 8 });
  });
  it('시각을 모르면 null', () => {
    expect(chartRuler(unknown)).toBeNull();
  });
});

describe('tightestAspects', () => {
  it('orb가 작은 순서로 n개', () => {
    const top = tightestAspects(known, 3);
    expect(top).toHaveLength(3);
    expect(top).toEqual([...known.aspects].sort((x, y) => x.orb - y.orb).slice(0, 3));
    expect(top.map((a) => `${a.a}-${a.b}`)).toEqual(['moon-asc', 'jupiter-uranus', 'sun-moon']);
  });
  it('skip으로 준 각도는 빼고 다음 것을 채운다', () => {
    const top = tightestAspects(known, 3, sunMoonHit(known));
    expect(top.map((a) => `${a.a}-${a.b}`)).toEqual(['moon-asc', 'jupiter-uranus', 'sun-asc']);
  });
  it('각도가 n개보다 적으면 있는 만큼만, 원본은 건드리지 않는다', () => {
    const c = handChart(SPREAD);
    const before = [...c.aspects];
    expect(tightestAspects(c, 99)).toHaveLength(c.aspects.length);
    expect(c.aspects).toEqual(before);
  });
});

describe('saturnTouches', () => {
  it('서울 1990은 토성이 태양(삼분)·달(합) 모두와 닿는다', () => {
    expect(saturnTouches(known)).toEqual(['sun', 'moon']);
  });
  it('닿는 쪽만 돌려준다', () => {
    expect(saturnTouches(handChart(SPREAD))).toEqual([]);
    expect(saturnTouches(handChart({ ...SPREAD, moon: 204 }))).toEqual(['moon']);
    expect(saturnTouches(handChart({ ...SPREAD, sun: 22 }))).toEqual(['sun']);
  });
});
