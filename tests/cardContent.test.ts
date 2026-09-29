import { describe, it, expect } from 'vitest';
import { SIGN_IDS } from '../src/astro/zodiac';
import { SUN_LINE, MOON_LINE, ASC_LINE } from '../src/content/cards/big3';
import { TRAITS } from '../src/content/cards/traits';
import { VENUS_LINE, MARS_LINE, MC_LINE, SATURN_LINE, JUPITER_LINE } from '../src/content/cards/lines';
import { ELEMENT_LINE, tieLine } from '../src/content/cards/elements';

const tables = { SUN_LINE, MOON_LINE, ASC_LINE, VENUS_LINE, MARS_LINE, MC_LINE, SATURN_LINE, JUPITER_LINE };
const okLen = (s: string) => s.length >= 12 && s.length <= 60;

describe('카드 문구', () => {
  for (const [name, table] of Object.entries(tables)) {
    it(`${name}: 12개, 길이 12~60자, 서로 다름`, () => {
      const vals = SIGN_IDS.map((s) => table[s]);
      vals.forEach((v) => expect(okLen(v), `${name} ${v}`).toBe(true));
      expect(new Set(vals).size).toBe(12);
    });
  }
  it('모든 한 줄이 표끼리도 겹치지 않는다', () => {
    const all = Object.values(tables).flatMap((t) => SIGN_IDS.map((s) => t[s]));
    expect(new Set(all).size).toBe(all.length);
  });
  it('TRAITS: 해시태그 3개(공백·# 없음), 강점·약점 길이', () => {
    for (const s of SIGN_IDS) {
      const t = TRAITS[s];
      expect(t.tags).toHaveLength(3);
      t.tags.forEach((g) => expect(/^[^\s#]{1,8}$/.test(g), g).toBe(true));
      expect(okLen(t.strength)).toBe(true);
      expect(okLen(t.weakness)).toBe(true);
    }
  });
  it('원소 문구와 동점 문구', () => {
    for (const e of ['fire', 'earth', 'air', 'water'] as const) expect(okLen(ELEMENT_LINE[e])).toBe(true);
    expect(tieLine('fire', 'water')).toBe('불과 물이 비슷하게 강해요');
    expect(tieLine('earth', 'air')).toBe('흙과 공기가 비슷하게 강해요');
  });
  it('해요체로 끝난다', () => {
    const all = Object.values(tables).flatMap((t) => SIGN_IDS.map((s) => t[s]));
    all.forEach((v) => expect(/(요|요\.|요!)$/.test(v), v).toBe(true));
  });

  // 아래는 문체 규칙을 지키는 무결성 시험(계획서 추가분)
  const prose = () => [
    ...Object.values(tables).flatMap((t) => SIGN_IDS.map((s) => t[s])),
    ...SIGN_IDS.flatMap((s) => [TRAITS[s].strength, TRAITS[s].weakness]),
    ...Object.values(ELEMENT_LINE),
  ];
  it('강점·약점·원소 문구도 해요체로 끝난다', () => {
    const extra = [...SIGN_IDS.flatMap((s) => [TRAITS[s].strength, TRAITS[s].weakness]), ...Object.values(ELEMENT_LINE)];
    extra.forEach((v) => expect(/(요|요\.|요!)$/.test(v), v).toBe(true));
  });
  it('같은 별자리의 문구끼리 첫 단어가 겹치지 않는다', () => {
    for (const s of SIGN_IDS) {
      const lines = [...Object.values(tables).map((t) => t[s]), TRAITS[s].strength, TRAITS[s].weakness];
      const firsts = lines.map((v) => v.split(/\s+/)[0]);
      expect(new Set(firsts).size, `${s}: ${firsts.join(' / ')}`).toBe(firsts.length);
    }
  });
  it('금지어와 줄임표가 없다', () => {
    const banned = /이러한|이를 통해|다양한|핵심적인|효과적으로|…|\.\.\./;
    prose().forEach((v) => expect(banned.test(v), v).toBe(false));
  });
  it('해시태그는 별자리끼리 겹치지 않는다', () => {
    const tags = SIGN_IDS.flatMap((s) => TRAITS[s].tags);
    expect(new Set(tags).size).toBe(tags.length);
  });
});
