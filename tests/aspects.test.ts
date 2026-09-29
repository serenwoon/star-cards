import { describe, it, expect } from 'vitest';
import { findAspect, natalAspects, crossAspects, NATAL_ORBS, CROSS_ORBS } from '../src/astro/aspects';

describe('findAspect', () => {
  it('0°를 걸친 삼분', () => {
    expect(findAspect(355, 118, NATAL_ORBS)).toEqual({ type: 'trine', orb: expect.closeTo(3, 6) });
  });
  it('orb 밖이면 null', () => {
    expect(findAspect(0, 45, NATAL_ORBS)).toBeNull();
  });
  it('보너스 orb', () => {
    expect(findAspect(0, 69, NATAL_ORBS)).toBeNull();
    expect(findAspect(0, 69, NATAL_ORBS, 2)?.type).toBeUndefined();
    expect(findAspect(0, 99, NATAL_ORBS, 2)?.type).toBe('square');
  });
});

describe('natalAspects', () => {
  it('태양·달은 orb +2', () => {
    const list = natalAspects([
      { id: 'sun', lon: 0 },
      { id: 'moon', lon: 129 },
      { id: 'mars', lon: 300 },
    ]);
    expect(list.find((a) => a.a === 'sun' && a.b === 'moon')?.type).toBe('trine');
  });
  it('ASC-MC 쌍은 넣지 않는다', () => {
    const list = natalAspects([{ id: 'asc', lon: 0 }, { id: 'mc', lon: 270 }]);
    expect(list).toEqual([]);
  });
  it('orb 오름차순', () => {
    const list = natalAspects([
      { id: 'venus', lon: 0 }, { id: 'mars', lon: 4 }, { id: 'jupiter', lon: 121 },
    ]);
    for (let i = 1; i < list.length; i++) expect(list[i].orb).toBeGreaterThanOrEqual(list[i - 1].orb);
  });
});

describe('crossAspects', () => {
  it('a는 바깥, b는 안쪽', () => {
    const list = crossAspects([{ id: 'saturn', lon: 90 }], [{ id: 'sun', lon: 1 }], CROSS_ORBS);
    expect(list).toEqual([{ a: 'saturn', b: 'sun', type: 'square', orb: expect.closeTo(1, 6) }]);
  });
});
