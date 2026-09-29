import { describe, it, expect } from 'vitest';
import { toUtc } from '../src/astro/time';

const iso = (d: Date) => d.toISOString().slice(0, 16);

describe('toUtc', () => {
  it('서울 2000년 = UTC+9', () => {
    const r = toUtc('2000-01-01', '12:00', 'Asia/Seoul');
    expect(iso(r.utc)).toBe('2000-01-01T03:00');
    expect(r.status).toBe('ok');
  });
  it('서울 1960년 = UTC+8:30', () => {
    expect(iso(toUtc('1960-01-01', '12:00', 'Asia/Seoul').utc)).toBe('1960-01-01T03:30');
  });
  it('서울 1988년 여름 = 서머타임 UTC+10', () => {
    expect(iso(toUtc('1988-07-01', '12:00', 'Asia/Seoul').utc)).toBe('1988-07-01T02:00');
  });
  it('서머타임 시작으로 없는 시각은 gap', () => {
    const r = toUtc('1987-05-10', '02:30', 'Asia/Seoul');
    expect(r.status).toBe('gap');
    expect(iso(r.utc)).toBe('1987-05-09T17:30');
  });
  it('서머타임 끝으로 겹치는 시각은 앞쪽을 고른다', () => {
    const r = toUtc('1987-10-11', '02:30', 'Asia/Seoul');
    expect(r.status).toBe('overlap');
    expect(iso(r.utc)).toBe('1987-10-10T16:30');
  });
  it('뉴욕 겹치는 시각', () => {
    const r = toUtc('2024-11-03', '01:30', 'America/New_York');
    expect(r.status).toBe('overlap');
    expect(iso(r.utc)).toBe('2024-11-03T05:30');
  });
});
