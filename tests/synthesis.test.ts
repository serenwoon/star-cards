import { describe, it, expect } from 'vitest';
import { ASPECT_TYPES } from '../src/astro/aspects';
import type { Element } from '../src/astro/zodiac';
import { SIGNS } from '../src/content/signs';
import {
  SUN_MOON, SUN_MOON_ASPECT, ASC_SUN, HOUSE_FOCUS, MODALITY_FOCUS, VENUS_MARS, SATURN_TOUCH, elementRelation,
} from '../src/content/cards/synthesis';

const ELEMENTS: Element[] = ['fire', 'earth', 'air', 'water'];
const RELATIONS = ['same', 'kin', 'cross'] as const;
const MODALITIES = ['cardinal', 'fixed', 'mutable'] as const;
const ASPECT_KEYS = [...ASPECT_TYPES, 'none'] as const;

const paragraphs = () => [
  ...ELEMENTS.flatMap((s) => ELEMENTS.map((m) => SUN_MOON[s][m])),
  ...ASPECT_KEYS.map((k) => SUN_MOON_ASPECT[k]),
  ...RELATIONS.map((r) => ASC_SUN[r]),
  ...HOUSE_FOCUS,
  ...MODALITIES.map((m) => MODALITY_FOCUS[m]),
  ...RELATIONS.map((r) => VENUS_MARS[r]),
];
const touches = () => [SATURN_TOUCH.sun, SATURN_TOUCH.moon];
const sentences = (p: string) => p.split(/(?<=[.?])\s+/).length;

describe('연결 해석 문구', () => {
  it('표마다 빠짐없음(16/6/3/12/3/3/2)', () => {
    expect(Object.keys(SUN_MOON).sort()).toEqual([...ELEMENTS].sort());
    for (const s of ELEMENTS) {
      expect(Object.keys(SUN_MOON[s]).sort()).toEqual([...ELEMENTS].sort());
      for (const m of ELEMENTS) expect(typeof SUN_MOON[s][m]).toBe('string');
    }
    expect(Object.keys(SUN_MOON_ASPECT).sort()).toEqual([...ASPECT_KEYS].sort());
    expect(Object.keys(ASC_SUN).sort()).toEqual([...RELATIONS].sort());
    expect(HOUSE_FOCUS).toHaveLength(12);
    expect(Object.keys(MODALITY_FOCUS).sort()).toEqual([...MODALITIES].sort());
    expect(Object.keys(VENUS_MARS).sort()).toEqual([...RELATIONS].sort());
    expect(Object.keys(SATURN_TOUCH).sort()).toEqual(['moon', 'sun']);
    expect(paragraphs()).toHaveLength(43);
  });

  it('43문단 모두 80자 이상, 2~4문장, 「니다.」로 끝난다', () => {
    paragraphs().forEach((p) => {
      expect(typeof p).toBe('string');
      expect(p.length, p).toBeGreaterThanOrEqual(80);
      expect(p.endsWith('니다.'), p).toBe(true);
      const n = sentences(p);
      expect(n >= 2 && n <= 4, `${n}문장: ${p}`).toBe(true);
    });
  });

  it('SATURN_TOUCH는 한 문장 30자 이상, 「니다.」로 끝난다', () => {
    touches().forEach((p) => {
      expect(p.length, p).toBeGreaterThanOrEqual(30);
      expect(p.endsWith('니다.'), p).toBe(true);
      expect(sentences(p), p).toBe(1);
    });
  });

  it('문단이 서로 겹치지 않는다', () => {
    const all = [...paragraphs(), ...touches()];
    expect(new Set(all).size).toBe(all.length);
  });

  it('금지어가 없다', () => {
    const banned = /이러한|이를 통해|다양한|핵심적인|효과적으로|따라서/;
    [...paragraphs(), ...touches()].forEach((p) => expect(banned.test(p), p).toBe(false));
  });

  it('별자리 이름을 넣지 않는다', () => {
    const names = Object.values(SIGNS).map((s) => s.ko);
    [...paragraphs(), ...touches()].forEach((p) => {
      for (const n of names) expect(p.includes(n), `${n}: ${p}`).toBe(false);
    });
  });

  it('HOUSE_FOCUS[n-1]은 n하우스를 말한다', () => {
    HOUSE_FOCUS.forEach((p, i) => expect(p.startsWith(`${i + 1}하우스`), p).toBe(true));
  });
});

describe('elementRelation', () => {
  it('같은 원소는 same', () => {
    for (const e of ELEMENTS) expect(elementRelation(e, e)).toBe('same');
  });
  it('불-공기, 흙-물은 어느 순서로든 kin', () => {
    expect(elementRelation('fire', 'air')).toBe('kin');
    expect(elementRelation('air', 'fire')).toBe('kin');
    expect(elementRelation('earth', 'water')).toBe('kin');
    expect(elementRelation('water', 'earth')).toBe('kin');
  });
  it('그 밖은 어느 순서로든 cross', () => {
    const pairs: [Element, Element][] = [['fire', 'water'], ['fire', 'earth'], ['air', 'water'], ['air', 'earth']];
    for (const [a, b] of pairs) {
      expect(elementRelation(a, b)).toBe('cross');
      expect(elementRelation(b, a)).toBe('cross');
    }
  });
});
