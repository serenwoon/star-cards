import { describe, it, expect } from 'vitest';
import { computeChart, chartPoints } from '../src/astro/chart';
import { balance } from '../src/astro/balance';

const seoul = { lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul' };

describe('computeChart', () => {
  it('시각을 알면 하우스와 ASC·MC가 있다', () => {
    const c = computeChart({ date: '1990-05-15', time: '14:30', ...seoul, system: 'placidus' });
    expect(c.timeKnown).toBe(true);
    expect(c.houses?.cusps).toHaveLength(12);
    expect(chartPoints(c).map((p) => p.id)).toContain('asc');
  });
  it('시각을 모르면 정오로 계산하고 하우스를 뺀다', () => {
    const c = computeChart({ date: '1990-05-15', time: null, ...seoul, system: 'placidus' });
    expect(c.timeKnown).toBe(false);
    expect(c.houses).toBeNull();
    expect(c.utc.toISOString().slice(11, 16)).toBe('03:00');
    expect(chartPoints(c).map((p) => p.id)).not.toContain('asc');
  });
});

describe('balance', () => {
  it('노드를 빼고 10개를 센다', () => {
    const c = computeChart({ date: '1990-05-15', time: '14:30', ...seoul, system: 'placidus' });
    const b = balance(c.bodies);
    const total = Object.values(b.element).reduce((s, n) => s + n, 0);
    expect(total).toBe(10);
  });
});
