import { describe, it, expect } from 'vitest';
import { NATAL } from '../src/content/natal';
import { placementText, ascText, aspectText } from '../src/content/interpret';
import { SIGN_IDS } from '../src/astro/zodiac';

describe('NATAL 36문단', () => {
  it('빈칸이 없다', () => {
    for (const k of ['sun', 'moon', 'asc'] as const) {
      for (const s of SIGN_IDS) expect(NATAL[k][s].length).toBeGreaterThan(80);
    }
  });
  it('문단끼리 겹치지 않는다', () => {
    const all = (['sun', 'moon', 'asc'] as const).flatMap((k) => SIGN_IDS.map((s) => NATAL[k][s]));
    expect(new Set(all).size).toBe(36);
  });
});

describe('placementText', () => {
  it('태양은 직접 쓴 문단을 앞에 둔다', () => {
    const t = placementText('sun', 'leo', 5);
    expect(t[0]).toBe(NATAL.sun.leo);
    expect(t.join(' ')).toContain('5하우스');
  });
  it('금성은 조합 문장', () => {
    const t = placementText('venus', 'taurus', null);
    expect(t.join(' ')).toContain('황소자리');
    expect(t.join(' ')).toContain('사랑과 좋아하는 것');
    expect(t.join(' ')).not.toContain('하우스');
  });
});

describe('ascText', () => {
  it('상승궁 문단', () => {
    expect(ascText('libra')[0]).toBe(NATAL.asc.libra);
  });
});

describe('aspectText', () => {
  it('출생 차트', () => {
    const s = aspectText({ a: 'moon', b: 'saturn', type: 'square', orb: 2.4 }, { mode: 'natal' });
    expect(s).toContain('달과 토성');
    expect(s).toContain('사분');
    expect(s).toContain('2.4°');
  });
  it('트랜짓', () => {
    const s = aspectText({ a: 'jupiter', b: 'sun', type: 'trine', orb: 0.5 }, { mode: 'transit' });
    expect(s).toContain('지금 하늘의 목성');
  });
  it('궁합', () => {
    const s = aspectText({ a: 'venus', b: 'mars', type: 'conjunction', orb: 1 }, { mode: 'synastry', nameA: '민지', nameB: '준호' });
    expect(s).toContain('준호');
    expect(s).toContain('민지');
  });
});

describe('문장 다듬기', () => {
  it('애스펙트 의미 구절은 주제를 「」로 감싼다', () => {
    const s = aspectText({ a: 'sun', b: 'moon', type: 'trine', orb: 3 }, { mode: 'natal' });
    expect(s).toContain('「자아와 삶의 방향」과 「감정과 편안함을 찾는 방식」이 힘들이지 않고 잘 어울립니다');
  });
  it('상승궁이 낀 출생 애스펙트의 조사', () => {
    const s = aspectText({ a: 'asc', b: 'mc', type: 'square', orb: 1 }, { mode: 'natal' });
    expect(s).toContain('상승궁(ASC)과 중천(MC)이 사분');
    expect(s).not.toContain('(와)');
    expect(s).not.toContain('(가)');
    const t = aspectText({ a: 'moon', b: 'asc', type: 'trine', orb: 1 }, { mode: 'natal' });
    expect(t).toContain('달과 상승궁(ASC)이 삼분');
  });
  it('궁합은 nameB의 행성을 먼저 쓴다', () => {
    const s = aspectText({ a: 'venus', b: 'mars', type: 'conjunction', orb: 1 }, { mode: 'synastry', nameA: '민지', nameB: '준호' });
    expect(s.startsWith('준호님의 금성과 민지님의 화성')).toBe(true);
  });
  it('하우스 문장', () => {
    expect(placementText('mars', 'aries', 10).join(' ')).toContain('10하우스에 놓여 이 힘은');
  });
  it('사자자리 style이 드러납니다와 겹치지 않는다', () => {
    expect(placementText('sun', 'leo', null).join(' ')).not.toContain('드러내며 드러납니다');
  });
});
