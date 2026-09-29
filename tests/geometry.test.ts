import { describe, it, expect } from 'vitest';
import { toXY, spread } from '../src/wheel/geometry';
import { norm } from '../src/astro/angles';

describe('toXY', () => {
  it('ASC는 왼쪽', () => {
    const [x, y] = toXY(123, 100, 123);
    expect(x).toBeCloseTo(-100);
    expect(y).toBeCloseTo(0);
  });
  it('ASC+90°(IC 쪽)은 아래', () => {
    const [x, y] = toXY(213, 100, 123);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(100);
  });
});

describe('spread', () => {
  it('가까운 점을 최소 간격 가까이 벌린다', () => {
    const out = spread([10, 11, 12, 200], 6);
    const sorted = [...out].sort((a, b) => a - b);
    expect(norm(sorted[1] - sorted[0])).toBeGreaterThan(5.9);
    expect(norm(sorted[2] - sorted[1])).toBeGreaterThan(5.9);
    expect(out[3]).toBeCloseTo(200);
  });
  it('멀리 떨어진 점은 그대로', () => {
    expect(spread([0, 90, 180], 6)).toEqual([0, 90, 180]);
  });
});
