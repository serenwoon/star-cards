import { describe, it, expect } from 'vitest';
import { computeChart } from '../src/astro/chart';
import { buildCards } from '../src/cards/model';
import { buildDetail, type Detail } from '../src/cards/detail';
import { NATAL } from '../src/content/natal';
import { ELEMENT_DETAIL } from '../src/content/cards/elementDetail';
import { GROWTH_ELEMENT, GROWTH_SATURN, GROWTH_NODE, GROWTH_MOON, GROWTH_ASC } from '../src/content/cards/growth';
import { TRAITS } from '../src/content/cards/traits';
import {
  SUN_MOON, SUN_MOON_ASPECT, ASC_SUN, HOUSE_FOCUS, MODALITY_FOCUS, VENUS_MARS, SATURN_TOUCH,
} from '../src/content/cards/synthesis';
import { placementText, aspectText } from '../src/content/interpret';
import { tightestAspects, sunMoonHit } from '../src/cards/synthesisModel';
import { natalAspects } from '../src/astro/aspects';
import { chartPoints } from '../src/astro/chart';
import { SIGNS } from '../src/content/signs';
import { HOUSES } from '../src/content/houses';
import { PLANETS } from '../src/content/planets';
import { houseOf } from '../src/astro/houses';
import type { CardData } from '../src/cards/model';

const seoul = { lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul', system: 'placidus' as const };
const known = computeChart({ date: '1990-05-15', time: '14:30', ...seoul });
const unknown = computeChart({ date: '1990-05-15', time: null, ...seoul });

const details = (chart: typeof known, name: string | null = null) => {
  const set = buildCards(chart, name);
  return Object.fromEntries(set.cards.map((c) => [c.kind, buildDetail(c, chart)])) as Record<string, Detail>;
};
const cardOf = <K extends CardData['kind']>(chart: typeof known, kind: K) =>
  buildCards(chart, null).cards.find((c) => c.kind === kind) as Extract<CardData, { kind: K }>;
const text = (d: Detail) => [d.title, ...d.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.rows ?? []).flat()])].join('\n');

describe('buildDetail', () => {
  it('카드 7종 모두 해설이 비어 있지 않다', () => {
    for (const chart of [known, unknown]) {
      const all = details(chart);
      expect(Object.keys(all)).toHaveLength(7);
      for (const d of Object.values(all)) {
        expect(d.title.length).toBeGreaterThan(0);
        expect(d.sections.length).toBeGreaterThan(0);
        for (const s of d.sections) expect(s.paragraphs.length + (s.rows?.length ?? 0)).toBeGreaterThan(0);
      }
    }
  });

  it('빅쓰리: 서울 1990 첫 문단은 황소자리 태양 해설', () => {
    const d = details(known).big3;
    expect(d.sections[0].heading).toBe('태양 · 황소자리');
    const card = cardOf(known, 'big3');
    // 각 섹션은 카드에 적힌 한 줄로 시작하고, 이어서 해설 문단이 온다
    expect(d.sections[0].paragraphs[0]).toBe(card.sunLine);
    expect(d.sections[0].paragraphs[1]).toBe(NATAL.sun.taurus);
    expect(d.sections[1].paragraphs[0]).toBe(card.moonLine);
    expect(d.sections[1].paragraphs[1]).toBe(NATAL.moon.capricorn);
    expect(d.sections[2].paragraphs[0]).toBe(card.ascLine);
    expect(d.sections[2].paragraphs[1]).toBe(NATAL.asc.virgo);
  });

  it('성격 키워드: 별자리 본문과 메타 한 줄', () => {
    const d = details(known).traits;
    const all = text(d);
    expect(all).toContain(SIGNS.taurus.body);
    expect(all).toContain('원소 흙 · 양태 고정 · 지배 행성 금성 · 핵심어 안정·감각·끈기');
    const card = cardOf(known, 'traits');
    expect(all).toContain(card.strength);
    expect(all).toContain(card.weakness);
    for (const t of card.tags) expect(all).toContain(t);
  });

  it('연애: 금성·화성 섹션과 두 행성 사이 문단', () => {
    const d = details(known).love;
    expect(d.sections.map((s) => s.heading.split(' · ')[0])).toEqual(expect.arrayContaining(['금성', '화성']));
    expect(text(d)).toMatch(/금성과 화성|화성과 금성|금성과 화성 사이에는 주요 각도가 없습니다/);
  });

  it('연애: 카드 한 줄과 금성·화성·별자리·하우스 해설로 보강', () => {
    for (const chart of [known, unknown]) {
      const d = details(chart).love;
      const card = cardOf(chart, 'love');
      expect(d.sections[0].paragraphs[0]).toBe(card.venusLine);
      expect(d.sections[1].paragraphs[0]).toBe(card.marsLine);
      const all = text(d);
      expect(all).toContain(PLANETS.venus.body);
      expect(all).toContain(PLANETS.mars.body);
      expect(all).toContain(SIGNS[card.venus.id].body);
      expect(all).toContain(SIGNS[card.mars.id].body);
    }
    const venusLon = known.bodies.find((b) => b.id === 'venus')!.lon;
    expect(text(details(known).love)).toContain(HOUSES[houseOf(venusLon, known.houses!.cusps) - 1].body);
  });

  it('일: 토성 행성·하우스 해설, 시각 모름이면 목성 해설로 보강', () => {
    const d = details(known).work;
    const card = cardOf(known, 'work');
    expect(d.sections[0].paragraphs[0]).toBe(card.primary.line);
    expect(d.sections[1].paragraphs[0]).toBe(card.saturn.line);
    const saturnLon = known.bodies.find((b) => b.id === 'saturn')!.lon;
    const all = text(d);
    expect(all).toContain(PLANETS.saturn.body);
    expect(all).toContain(HOUSES[houseOf(saturnLon, known.houses!.cusps) - 1].body);
    const u = details(unknown).work;
    expect(text(u)).toContain(PLANETS.jupiter.body);
    expect(text(u)).toContain(PLANETS.saturn.body);
    expect(u.sections[0].paragraphs[0]).toBe(cardOf(unknown, 'work').primary.line);
  });

  it('일: 시각이 있으면 MC와 10하우스', () => {
    const all = text(details(known).work);
    expect(all).toContain(HOUSES[9].body);
    expect(all).toContain('토성');
  });

  it('시각 모름: 상승궁 안내·일은 목성·차트 하우스는 「—」', () => {
    const all = details(unknown);
    expect(text(all.big3)).toContain('태어난 시각을 넣으면 상승궁 해설이 나옵니다.');
    expect(all.work.sections[0].heading.startsWith('목성')).toBe(true);
    expect(text(all.work)).not.toContain(HOUSES[9].body);
    const rows = all.chart.sections.find((s) => s.rows)!.rows!;
    expect(rows).toHaveLength(11);
    for (const r of rows) expect(r[3]).toBe('—');
  });

  it('차트: 배치 11행에 시각이 있으면 ASC·MC 2행을 더한다', () => {
    const rows = details(known).chart.sections.find((s) => s.rows)!.rows!;
    expect(rows).toHaveLength(13);
    for (const r of rows) expect(r).toHaveLength(4);
    expect(rows[0][0]).toContain('태양');
    expect(rows[0][1]).toBe('황소자리');
    expect(rows[0][2]).toMatch(/^\d{1,2}°\d{2}′$/);
    expect(rows[0][3]).toMatch(/^\d{1,2}$/);
  });

  it('차트: 애스펙트는 orb 작은 순 최대 8개', () => {
    const asp = details(known).chart.sections.find((s) => !s.rows)!;
    expect(asp.paragraphs.length).toBeGreaterThan(0);
    expect(asp.paragraphs.length).toBeLessThanOrEqual(8);
    const orbs = asp.paragraphs.map((p) => Number(/\((\d+\.\d)°\)/.exec(p)![1]));
    expect([...orbs].sort((a, b) => a - b)).toEqual(orbs);
  });

  it('원소: 네 원소의 천체 수 합은 10, 가장 강한 원소 설명을 붙인다', () => {
    const d = details(known).elements;
    const counts = d.sections
      .map((s) => /^(불|흙|공기|물) · (\d+)개$/.exec(s.heading))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => Number(m[2]));
    expect(counts).toHaveLength(4);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(10);
    const set = buildCards(known, null);
    const card = set.cards.find((c) => c.kind === 'elements')!;
    if (card.kind !== 'elements') throw new Error();
    expect(text(d)).toContain(ELEMENT_DETAIL[card.top[0]]);
    expect(text(d)).toContain(card.line);
  });

  it('원소: 가장 약한 원소 섹션(서울 1990은 공기 0개)', () => {
    const d = details(known).elements;
    const last = d.sections[d.sections.length - 1];
    expect(last.heading).toBe('가장 약한 원소 · 공기');
    expect(last.paragraphs).toEqual([ELEMENT_DETAIL.air]);
  });

  it('종합: 첫 섹션은 한 줄 소개와 태양·달·상승궁 해설, 강점·약점', () => {
    const d = details(known).summary;
    const card = cardOf(known, 'summary');
    expect(d.title).toBe('나는 이런 사람');
    expect(d.sections[0].heading).toBe('한눈에 보기');
    expect(d.sections[0].paragraphs).toEqual([
      card.intro, NATAL.sun.taurus, NATAL.moon.capricorn, NATAL.asc.virgo,
      `강점: ${TRAITS.taurus.strength}`, `약점: ${TRAITS.taurus.weakness}`,
    ]);
  });

  it('종합: 타고난 기질은 원소 개수 한 줄과 가장 강한 원소 설명', () => {
    const d = details(known).summary;
    const el = cardOf(known, 'elements');
    const sec = d.sections.find((s) => s.heading === '타고난 기질')!;
    expect(sec.paragraphs[0]).toBe(`불 ${el.counts.fire} · 흙 ${el.counts.earth} · 공기 ${el.counts.air} · 물 ${el.counts.water}`);
    expect(sec.paragraphs.slice(1)).toEqual(el.top.slice(0, 2).map((e) => ELEMENT_DETAIL[e]));
  });

  it('종합: 더 자랄 수 있는 방향 다섯 갈래(서울 1990)', () => {
    const d = details(known).summary;
    const heads = d.sections.map((s) => s.heading);
    expect(heads.slice(heads.indexOf('타고난 기질'))).toEqual([
      '타고난 기질', '더 자랄 수 있는 방향',
      '약한 원소 채우기 · 공기', '토성 · 염소자리', '북쪽 노드 · 물병자리', '달 · 염소자리', '상승궁 · 처녀자리',
    ]);
    const by = (h: string) => d.sections.find((s) => s.heading === h)!.paragraphs;
    expect(by('약한 원소 채우기 · 공기')).toEqual([GROWTH_ELEMENT.air]);
    // 서울 1990은 토성이 태양(삼분)·달(합)과 모두 닿아 조언 앞에 「둘 다」 문장 하나가 붙는다
    expect(by('토성 · 염소자리')).toEqual([SATURN_TOUCH.both, GROWTH_SATURN.capricorn]);
    expect(by('북쪽 노드 · 물병자리')).toEqual([GROWTH_NODE.aquarius]);
    expect(by('달 · 염소자리')).toEqual([GROWTH_MOON.capricorn]);
    expect(by('상승궁 · 처녀자리')).toEqual([GROWTH_ASC.virgo]);
  });

  it('종합: 연결 해석 항목이 한눈에 보기와 타고난 기질 사이에 순서대로 온다(서울 1990)', () => {
    const d = details(known).summary;
    expect(d.sections.map((s) => s.heading)).toEqual([
      '한눈에 보기',
      '속마음과 바라는 것 · 태양 흙 × 달 흙',
      '안에서 맞는가, 부딪치는가 · 태양과 달 삼분',
      '겉모습과 실제 · 상승궁 처녀자리 × 태양 황소자리',
      '삶의 무게중심 · 4하우스',
      '움직이는 방식 · 활동',
      '끌림과 다가가는 방식 · 금성 불 × 화성 물',
      '차트를 이끄는 행성 · 수성',
      '가장 강하게 이어진 세 가지',
      '타고난 기질', '더 자랄 수 있는 방향',
      '약한 원소 채우기 · 공기', '토성 · 염소자리', '북쪽 노드 · 물병자리', '달 · 염소자리', '상승궁 · 처녀자리',
    ]);
    expect(d.sections.length).toBeGreaterThanOrEqual(13);
  });

  it('종합: 연결 해석 문단은 원소 조합·각도·하우스·양태로 고른다(서울 1990)', () => {
    const d = details(known).summary;
    const by = (h: string) => d.sections.find((s) => s.heading.startsWith(h))!.paragraphs;
    expect(by('속마음과 바라는 것')).toEqual([SUN_MOON.earth.earth]);
    const sunMoon = known.aspects.find((a) => a.a === 'sun' && a.b === 'moon')!;
    expect(by('안에서 맞는가')).toEqual([SUN_MOON_ASPECT.trine, aspectText(sunMoon, { mode: 'natal' })]);
    expect(by('겉모습과 실제')).toEqual([ASC_SUN.same]);
    expect(by('삶의 무게중심')).toEqual(['달, 토성, 천왕성, 해왕성이 모여 있습니다.', HOUSE_FOCUS[3]]);
    expect(by('움직이는 방식')).toEqual(['활동 6 · 고정 3 · 변통 1', MODALITY_FOCUS.cardinal]);
    expect(by('끌림과 다가가는 방식')).toEqual([VENUS_MARS.cross]);
    expect(by('차트를 이끄는 행성')).toEqual([
      '상승궁의 지배 행성은 수성입니다. 차트 전체의 방향을 잡는 행성으로 읽습니다.', ...placementText('mercury', 'taurus', 8),
    ]);
    const top = by('가장 강하게 이어진 세 가지');
    expect(top).toHaveLength(3);
    expect(top).toEqual(tightestAspects(known, 3, sunMoonHit(known)).map((a) => aspectText(a, { mode: 'natal' })));
    // 태양–달 각도는 바로 위 섹션에 이미 나왔으니 여기서는 되풀이하지 않는다
    expect(text(d).split(aspectText(sunMoon, { mode: 'natal' }))).toHaveLength(2);
  });

  it('종합: 시각 모름이면 겉모습·무게중심 섹션과 지배 행성 문장이 빠진다', () => {
    const d = details(unknown).summary;
    const heads = d.sections.map((s) => s.heading);
    expect(heads.slice(0, 7)).toEqual([
      '한눈에 보기',
      '속마음과 바라는 것 · 태양 흙 × 달 흙',
      '안에서 맞는가, 부딪치는가 · 태양과 달 삼분',
      '움직이는 방식 · 활동',
      '끌림과 다가가는 방식 · 금성 불 × 화성 물',
      '가장 강하게 이어진 세 가지',
      '타고난 기질',
    ]);
    expect(heads.some((h) => /^(겉모습과 실제|삶의 무게중심|태양이 놓인 자리|차트를 이끄는 행성)/.test(h))).toBe(false);
    const all = text(d);
    expect(all).not.toContain('지배 행성');
    for (const p of [...Object.values(ASC_SUN), ...HOUSE_FOCUS]) expect(all).not.toContain(p);
    expect(d.sections.find((s) => s.heading.startsWith('끌림과 다가가는 방식'))!.paragraphs).toEqual([VENUS_MARS.cross]);
    expect(d.sections.find((s) => s.heading === '가장 강하게 이어진 세 가지')!.paragraphs).toHaveLength(3);
  });

  it('종합: 시각 모름이면 달이 낀 각도 앞에 참고 안내를 붙인다', () => {
    const CAVEAT = '태어난 시각을 모르면 달의 위치가 몇 도 달라질 수 있어, 달이 낀 각도는 참고로만 봐 주세요.';
    const sec = (chart: typeof known, h: string) => details(chart).summary.sections.find((s) => s.heading.startsWith(h))!.paragraphs;
    const hit = sunMoonHit(unknown)!;
    expect(sec(unknown, '안에서 맞는가')).toEqual([CAVEAT, SUN_MOON_ASPECT.trine, aspectText(hit, { mode: 'natal' })]);
    // 서울 1990 시각 모름의 가장 강한 셋에는 달이 없어 안내가 붙지 않는다
    expect(sec(unknown, '가장 강하게 이어진 세 가지')).not.toContain(CAVEAT);
    const moonTop = { ...unknown, aspects: [{ a: 'moon' as const, b: 'venus' as const, type: 'trine' as const, orb: 0.1 }, ...unknown.aspects] };
    const top = sec(moonTop, '가장 강하게 이어진 세 가지');
    expect(top).toHaveLength(4);
    expect(top[0]).toBe(CAVEAT);
    // 시각을 알면 어디에도 붙지 않는다
    expect(text(details(known).summary)).not.toContain(CAVEAT);
  });

  it('종합: 지배 행성이 태양이면 한눈에 보기에 나온 태양 해설을 되풀이하지 않는다(사자자리 상승궁)', () => {
    const leo = { ...known, houses: { ...known.houses!, asc: 130 } };
    const d = details(leo).summary;
    const sec = d.sections.find((s) => s.heading.startsWith('차트를 이끄는 행성'))!;
    expect(sec.heading).toBe('차트를 이끄는 행성 · 태양');
    expect(sec.paragraphs).toEqual([
      '상승궁의 지배 행성은 태양입니다. 차트 전체의 방향을 잡는 행성으로 읽습니다.',
      ...placementText('sun', 'taurus', 9).filter((p) => p !== NATAL.sun.taurus),
    ]);
    expect(sec.paragraphs).toHaveLength(3);
    expect(text(d).split(NATAL.sun.taurus)).toHaveLength(2);
  });

  it('종합: 천체가 하우스마다 흩어져 있으면 「태양이 놓인 자리」로 읽는다', () => {
    const lons = [2, 47, 78, 109, 140, 171, 202, 233, 264, 295, 326];
    const bodies = known.bodies.map((b, i) => ({ ...b, lon: lons[i] }));
    const houses = { ...known.houses!, system: 'whole' as const, asc: 0, mc: 270, cusps: Array.from({ length: 12 }, (_, i) => i * 30) };
    const spread = { ...known, bodies, houses, aspects: natalAspects(chartPoints({ bodies, houses })) };
    const d = details(spread).summary;
    const heads = d.sections.map((s) => s.heading);
    expect(heads).toContain('태양이 놓인 자리 · 1하우스');
    expect(heads.some((h) => h.startsWith('삶의 무게중심'))).toBe(false);
    expect(d.sections.find((s) => s.heading === '태양이 놓인 자리 · 1하우스')!.paragraphs).toEqual([
      '천체가 한 하우스에 몰리지 않고 고르게 흩어져 있어, 태양이 놓인 1하우스를 중심으로 읽습니다.', HOUSE_FOCUS[0],
    ]);
  });

  it('종합: 태양·달 각도가 없으면 「각도 없음」, 양태 동점이면 둘 다, 토성이 안 닿으면 조언만', () => {
    // 열 천체를 양자리 4·황소자리 4·쌍둥이자리 2로 놓되 태양·달·토성은 서로 각도가 없게 한다
    const plan: Record<string, number> = {
      sun: 1, moon: 46, mercury: 5, venus: 9, mars: 13, jupiter: 50, saturn: 71, uranus: 54, neptune: 58, pluto: 75,
    };
    const bodies = known.bodies.map((b) => (b.id in plan ? { ...b, lon: plan[b.id] } : b));
    const chart = { ...known, bodies, aspects: known.aspects.filter((a) => ![a.a, a.b].some((x) => x === 'sun' || x === 'moon' || x === 'saturn')) };
    const d = details(chart).summary;
    const by = (h: string) => d.sections.find((s) => s.heading.startsWith(h))!;
    expect(by('안에서 맞는가').heading).toBe('안에서 맞는가, 부딪치는가 · 태양과 달 각도 없음');
    expect(by('안에서 맞는가').paragraphs).toEqual([SUN_MOON_ASPECT.none]);
    expect(by('속마음과 바라는 것').heading).toBe('속마음과 바라는 것 · 태양 불 × 달 흙');
    expect(by('속마음과 바라는 것').paragraphs).toEqual([SUN_MOON.fire.earth]);
    expect(by('움직이는 방식').heading).toBe('움직이는 방식 · 활동·고정');
    expect(by('움직이는 방식').paragraphs).toEqual(['활동 4 · 고정 4 · 변통 2', MODALITY_FOCUS.cardinal, MODALITY_FOCUS.fixed]);
    expect(by('토성 · ').paragraphs).toEqual([GROWTH_SATURN.gemini]);
  });

  it('종합: 시각 모름이면 상승궁 해설·조언 대신 안내 한 줄', () => {
    const d = details(unknown).summary;
    const all = text(d);
    expect(cardOf(unknown, 'summary').intro).not.toContain('첫인상');
    expect(all).not.toContain('첫인상');
    expect(d.sections[0].paragraphs).toHaveLength(5);
    const last = d.sections[d.sections.length - 1];
    expect(last.heading).toBe('상승궁');
    expect(last.paragraphs).toEqual(['태어난 시각을 넣으면 상승궁 조언이 나옵니다.']);
    for (const p of Object.values(GROWTH_ASC)) expect(all).not.toContain(p);
  });

  it('종합: 약한 원소는 원소 카드 해설과 같은 원소를 고른다', () => {
    for (const chart of [known, unknown]) {
      const all = details(chart);
      const weakEl = all.elements.sections[all.elements.sections.length - 1].heading.replace('가장 약한 원소 · ', '');
      const heads = all.summary.sections.map((s) => s.heading);
      expect(heads.some((h) => h === `약한 원소 채우기 · ${weakEl}` || h === `조금 덜 쓰는 원소 · ${weakEl}`)).toBe(true);
    }
  });

  it('종합: 가장 약한 원소가 2개 이상이면 「조금 덜 쓰는 원소」, 1개 이하면 「약한 원소 채우기」', () => {
    const LON = { fire: 15, earth: 45, air: 75, water: 105 } as const;
    const withElements = (plan: (keyof typeof LON)[]) => {
      const ids = known.bodies.filter((b) => b.id !== 'node');
      return { ...known, bodies: known.bodies.map((b) => {
        const i = ids.findIndex((x) => x.id === b.id);
        return i < 0 ? b : { ...b, lon: LON[plan[i]] };
      }) };
    };
    const mild = withElements(['fire', 'fire', 'fire', 'earth', 'earth', 'earth', 'air', 'air', 'water', 'water']);
    const mildSec = details(mild).summary.sections.find((s) => s.heading.includes('원소 · '))!;
    expect(mildSec.heading).toBe('조금 덜 쓰는 원소 · 공기');
    expect(mildSec.paragraphs).toEqual([GROWTH_ELEMENT.air]);
    const thin = withElements(['fire', 'fire', 'fire', 'fire', 'earth', 'earth', 'earth', 'air', 'air', 'water']);
    const heads = details(thin).summary.sections.map((s) => s.heading);
    expect(heads).toContain('약한 원소 채우기 · 물');
    expect(heads.some((h) => h.startsWith('조금 덜 쓰는 원소'))).toBe(false);
  });

  it('개인정보: 생년월일·시각·도시·UTC·이름이 들어가지 않는다', () => {
    const bads = ['1990', '05-15', '5월 15일', '14:30', '14시', '오후 2', '서울', 'Seoul', 'UTC', '홍길동'];
    for (const chart of [known, unknown]) {
      expect(Object.keys(details(chart, '홍길동'))).toHaveLength(7);
      for (const d of Object.values(details(chart, '홍길동'))) {
        const all = text(d);
        for (const bad of bads) expect(all).not.toContain(bad);
      }
    }
  });
});

describe('ELEMENT_DETAIL', () => {
  it('네 원소 모두 80자 이상, 「~합니다」체', () => {
    for (const e of ['fire', 'earth', 'air', 'water'] as const) {
      expect(ELEMENT_DETAIL[e].length).toBeGreaterThanOrEqual(80);
      expect(ELEMENT_DETAIL[e].trim().endsWith('니다.')).toBe(true);
    }
    expect(new Set(Object.values(ELEMENT_DETAIL)).size).toBe(4);
  });
});
