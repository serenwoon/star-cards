import { describe, it, expect } from 'vitest';
import { norm, signedDiff } from '../src/astro/angles';
import { signOf, degInSign, ELEMENT, MODALITY, SIGN_IDS } from '../src/astro/zodiac';

describe('각도', () => {
  it('norm은 0~360', () => {
    expect(norm(-30)).toBe(330);
    expect(norm(725)).toBe(5);
  });
  it('signedDiff는 짧은 쪽', () => {
    expect(signedDiff(10, 350)).toBe(20);
    expect(signedDiff(350, 10)).toBe(-20);
  });
});

describe('별자리', () => {
  it('황경으로 별자리를 고른다', () => {
    expect(signOf(0)).toBe('aries');
    expect(signOf(29.99)).toBe('aries');
    expect(signOf(30)).toBe('taurus');
    expect(signOf(359)).toBe('pisces');
    expect(signOf(-1)).toBe('pisces');
  });
  it('별자리 안의 도수', () => {
    expect(degInSign(45.5)).toBeCloseTo(15.5);
  });
  it('원소·양태가 12개씩 채워져 있다', () => {
    expect(SIGN_IDS).toHaveLength(12);
    expect(ELEMENT.leo).toBe('fire');
    expect(MODALITY.scorpio).toBe('fixed');
  });
});
