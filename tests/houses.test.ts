import { describe, it, expect } from 'vitest';
import { housesFromRamc, houseOf, obliquity } from '../src/astro/houses';
import { norm, signedDiff } from '../src/astro/angles';

const EPS = 23.4393;

describe('ASC·MC', () => {
  it('적도·RAMC 0이면 MC 0°, ASC 90°', () => {
    const h = housesFromRamc(0, EPS, 0, 'placidus');
    expect(h.mc).toBeCloseTo(0, 6);
    expect(h.asc).toBeCloseTo(90, 6);
  });
  it('적도·RAMC 90이면 MC 90°, ASC 180°', () => {
    const h = housesFromRamc(90, EPS, 0, 'placidus');
    expect(h.mc).toBeCloseTo(90, 6);
    expect(h.asc).toBeCloseTo(180, 6);
  });
  it('J2000 황도경사 ≈ 23.439°', () => {
    expect(obliquity(new Date('2000-01-01T12:00Z'))).toBeCloseTo(23.4393, 3);
  });
});

describe('Placidus', () => {
  it('적도에서 11하우스 = 적경 30°에 해당하는 황경(32.18°)', () => {
    const h = housesFromRamc(0, EPS, 0, 'placidus');
    expect(h.cusps[10]).toBeCloseTo(32.18, 1);
  });
  it('서울 위도에서 커스프가 차례로 돌고 맞은편이 180° 차이', () => {
    const h = housesFromRamc(123.4, EPS, 37.57, 'placidus');
    expect(h.fallback).toBe(false);
    expect(h.cusps[0]).toBeCloseTo(h.asc, 6);
    expect(h.cusps[9]).toBeCloseTo(h.mc, 6);
    for (let i = 0; i < 12; i++) {
      const gap = norm(h.cusps[(i + 1) % 12] - h.cusps[i]);
      expect(gap).toBeGreaterThan(0);
      expect(gap).toBeLessThan(90);
    }
    for (let i = 0; i < 6; i++) {
      expect(Math.abs(signedDiff(h.cusps[i + 6], h.cusps[i] + 180))).toBeLessThan(1e-6);
    }
  });
  it('위도 70°에서는 홀사인으로 바꾼다', () => {
    const h = housesFromRamc(10, EPS, 70, 'placidus');
    expect(h.system).toBe('whole');
    expect(h.fallback).toBe(true);
  });
});

describe('홀사인', () => {
  it('ASC가 든 별자리 0°에서 시작한다', () => {
    const h = housesFromRamc(10, EPS, 0, 'whole');
    expect(h.asc).toBeCloseTo(99.19, 1);
    expect(h.cusps[0]).toBe(90);
    expect(h.cusps[1]).toBe(120);
  });
});

describe('houseOf', () => {
  const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  it('구간에 따라 하우스 번호', () => {
    expect(houseOf(15, cusps)).toBe(1);
    expect(houseOf(335, cusps)).toBe(12);
  });
  it('0°를 걸친 하우스', () => {
    const shifted = cusps.map((c) => norm(c + 350));
    expect(houseOf(5, shifted)).toBe(1);
    expect(houseOf(345, shifted)).toBe(12);
  });
});

describe('ASC·MC가 드는 하우스', () => {
  const ramcs = Array.from({ length: 720 }, (_, i) => i * 0.5);
  for (const lat of [37.57, -33.9]) {
    it(`Placidus 위도 ${lat}: ASC는 1하우스, MC는 10하우스`, () => {
      for (const r of ramcs) {
        const h = housesFromRamc(r, EPS, lat, 'placidus');
        expect(h.system).toBe('placidus');
        expect(h.cusps[0]).toBe(h.asc);
        expect(h.cusps[9]).toBe(h.mc);
        expect([r, houseOf(h.mc, h.cusps)]).toEqual([r, 10]);
        expect([r, houseOf(h.asc, h.cusps)]).toEqual([r, 1]);
      }
    });
    it(`홀사인 위도 ${lat}: ASC는 늘 1하우스`, () => {
      for (const r of ramcs) {
        const h = housesFromRamc(r, EPS, lat, 'whole');
        expect([r, houseOf(h.asc, h.cusps)]).toEqual([r, 1]);
      }
    });
  }
});
