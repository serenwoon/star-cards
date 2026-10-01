import { describe, it, expect } from 'vitest';
import { SIGN_IDS } from '../src/astro/zodiac';
import { GROWTH_ELEMENT, GROWTH_SATURN, GROWTH_NODE, GROWTH_MOON, GROWTH_ASC, NODE_LINE } from '../src/content/cards/growth';

const ELEMENTS = ['fire', 'earth', 'air', 'water'] as const;
const signTables = { GROWTH_SATURN, GROWTH_NODE, GROWTH_MOON, GROWTH_ASC };
const paragraphs = () => [
  ...ELEMENTS.map((e) => GROWTH_ELEMENT[e]),
  ...Object.values(signTables).flatMap((t) => SIGN_IDS.map((s) => t[s])),
];

describe('성장 방향 조언', () => {
  it('GROWTH_ELEMENT: 네 원소 빠짐없음', () => {
    expect(Object.keys(GROWTH_ELEMENT).sort()).toEqual([...ELEMENTS].sort());
    ELEMENTS.forEach((e) => expect(typeof GROWTH_ELEMENT[e]).toBe('string'));
  });
  for (const [name, table] of Object.entries(signTables)) {
    it(`${name}: 열두 별자리 빠짐없음`, () => {
      expect(Object.keys(table).sort()).toEqual([...SIGN_IDS].sort());
      SIGN_IDS.forEach((s) => expect(typeof table[s]).toBe('string'));
    });
  }
  it('52문단 모두 80자 이상', () => {
    const all = paragraphs();
    expect(all).toHaveLength(52);
    all.forEach((p) => expect(p.length, p).toBeGreaterThanOrEqual(80));
  });
  it('52문단이 서로 겹치지 않는다', () => {
    const all = paragraphs();
    expect(new Set(all).size).toBe(all.length);
  });
  it('문단마다 행동 제안(「보세요」 또는 「좋습니다」)이 있다', () => {
    paragraphs().forEach((p) => expect(/보세요|좋습니다/.test(p), p).toBe(true));
  });
  it('「~합니다」체로 끝나고 2~4문장이다', () => {
    paragraphs().forEach((p) => {
      expect(p.endsWith('니다.'), p).toBe(true);
      const n = p.split(/(?<=[.?])\s+/).length;
      expect(n >= 2 && n <= 4, `${n}문장: ${p}`).toBe(true);
    });
  });
  it('금지어가 없다', () => {
    const banned = /이러한|이를 통해|다양한|핵심적인|효과적으로|따라서/;
    [...paragraphs(), ...SIGN_IDS.map((s) => NODE_LINE[s])].forEach((p) => expect(banned.test(p), p).toBe(false));
  });
  it('NODE_LINE: 12개, 12~60자, 요로 끝남, 서로 다름', () => {
    const lines = SIGN_IDS.map((s) => NODE_LINE[s]);
    expect(Object.keys(NODE_LINE).sort()).toEqual([...SIGN_IDS].sort());
    lines.forEach((v) => {
      expect(v.length >= 12 && v.length <= 60, v).toBe(true);
      expect(v.endsWith('요'), v).toBe(true);
    });
    expect(new Set(lines).size).toBe(12);
  });
});
