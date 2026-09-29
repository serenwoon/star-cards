import { describe, it, expect } from 'vitest';
import { josa } from '../src/content/josa';
import { SIGNS } from '../src/content/signs';
import { PLANETS, POINT_NAMES } from '../src/content/planets';
import { HOUSES } from '../src/content/houses';
import { ASPECTS } from '../src/content/aspects';
import { SIGN_IDS } from '../src/astro/zodiac';
import { BODY_IDS } from '../src/astro/bodies';
import { ASPECT_TYPES } from '../src/astro/aspects';

describe('조사', () => {
  it('받침 유무', () => {
    expect(josa('달', '이', '가')).toBe('이');
    expect(josa('금성', '과', '와')).toBe('과');
    expect(josa('나비', '이', '가')).toBe('가');
    expect(josa('화성의 수', '을', '를')).toBe('를');
  });
  it('한글이 아니면 둘 다 보여 준다', () => {
    expect(josa('ASC', '이', '가')).toBe('이(가)');
  });
});

describe('사전 데이터', () => {
  it('별자리 12개가 모두 채워져 있다', () => {
    for (const id of SIGN_IDS) {
      expect(SIGNS[id].keywords).toHaveLength(3);
      expect(SIGNS[id].body.length).toBeGreaterThan(80);
    }
  });
  it('행성 11개', () => {
    for (const id of BODY_IDS) expect(PLANETS[id].body.length).toBeGreaterThan(80);
    expect(POINT_NAMES.asc.ko).toContain('상승');
  });
  it('하우스 12개가 순서대로', () => {
    expect(HOUSES.map((h) => h.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const h of HOUSES) expect(h.body.length).toBeGreaterThan(80);
  });
  it('애스펙트 5개', () => {
    for (const t of ASPECT_TYPES) expect(ASPECTS[t].body.length).toBeGreaterThan(80);
  });
});

describe('조사 — 괄호·따옴표 꼬리', () => {
  it('끝의 괄호 부분을 떼고 판정한다', () => {
    expect(josa('상승궁(ASC)', '과', '와')).toBe('과');
    expect(josa('상승궁(ASC)', '이', '가')).toBe('이');
    expect(josa('중천(MC)', '과', '와')).toBe('과');
  });
  it('닫는 따옴표와 공백을 떼고 판정한다', () => {
    expect(josa('「자아와 삶의 방향」', '과', '와')).toBe('과');
    expect(josa('「나비」 ', '이', '가')).toBe('가');
  });
});

describe('기호', () => {
  it('별자리·행성·애스펙트 기호 뒤에 텍스트 표시 선택자', () => {
    for (const id of SIGN_IDS) expect(SIGNS[id].glyph.endsWith('︎')).toBe(true);
    for (const id of BODY_IDS) expect(PLANETS[id].glyph.endsWith('︎')).toBe(true);
    for (const t of ASPECT_TYPES) expect(ASPECTS[t].glyph.endsWith('︎')).toBe(true);
  });
});
