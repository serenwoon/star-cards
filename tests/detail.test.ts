import { describe, it, expect } from 'vitest';
import { computeChart } from '../src/astro/chart';
import { buildCards } from '../src/cards/model';
import { buildDetail, type Detail } from '../src/cards/detail';
import { NATAL } from '../src/content/natal';
import { ELEMENT_DETAIL } from '../src/content/cards/elementDetail';
import { SIGNS } from '../src/content/signs';
import { HOUSES } from '../src/content/houses';

const seoul = { lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul', system: 'placidus' as const };
const known = computeChart({ date: '1990-05-15', time: '14:30', ...seoul });
const unknown = computeChart({ date: '1990-05-15', time: null, ...seoul });

const details = (chart: typeof known) => {
  const set = buildCards(chart, null);
  return Object.fromEntries(set.cards.map((c) => [c.kind, buildDetail(c, chart)])) as Record<string, Detail>;
};
const text = (d: Detail) => [d.title, ...d.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.rows ?? []).flat()])].join('\n');

describe('buildDetail', () => {
  it('카드 6종 모두 해설이 비어 있지 않다', () => {
    for (const chart of [known, unknown]) {
      const all = details(chart);
      expect(Object.keys(all)).toHaveLength(6);
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
    expect(d.sections[0].paragraphs[0]).toBe(NATAL.sun.taurus);
    expect(d.sections[1].paragraphs[0]).toBe(NATAL.moon.capricorn);
    expect(d.sections[2].paragraphs[0]).toBe(NATAL.asc.virgo);
  });

  it('성격 키워드: 별자리 본문과 메타 한 줄', () => {
    const d = details(known).traits;
    const all = text(d);
    expect(all).toContain(SIGNS.taurus.body);
    expect(all).toContain('원소 흙 · 양태 고정 · 지배 행성 금성 · 핵심어 안정·감각·끈기');
  });

  it('연애: 금성·화성 섹션과 두 행성 사이 문단', () => {
    const d = details(known).love;
    expect(d.sections.map((s) => s.heading.split(' · ')[0])).toEqual(expect.arrayContaining(['금성', '화성']));
    expect(text(d)).toMatch(/금성과 화성|화성과 금성|금성과 화성 사이에는 주요 각도가 없습니다/);
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
  });

  it('개인정보: 생년월일·시각·도시·UTC가 들어가지 않는다', () => {
    for (const chart of [known, unknown]) {
      for (const d of Object.values(details(chart))) {
        const all = text(d);
        for (const bad of ['1990', '14:30', '서울', 'Seoul', 'UTC']) expect(all).not.toContain(bad);
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
