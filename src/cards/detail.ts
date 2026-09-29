import type { Chart } from '../astro/chart';
import type { BodyId } from '../astro/bodies';
import { houseOf } from '../astro/houses';
import { MODALITY, degInSign, signOf, ELEMENT, type SignId } from '../astro/zodiac';
import { ELEMENT_KO, MODALITY_KO, SIGNS } from '../content/signs';
import { PLANETS } from '../content/planets';
import { HOUSES } from '../content/houses';
import { NATAL } from '../content/natal';
import { placementText, ascText, aspectText } from '../content/interpret';
import { ELEMENT_DETAIL } from '../content/cards/elementDetail';
import { ELEMENT_ORDER, type CardData } from './model';

export type DetailSection = { heading: string; paragraphs: string[]; rows?: string[][]; columns?: string[] };
export type Detail = { title: string; sections: DetailSection[] };

/** 별자리 안 도수. star-voyage fmtDeg와 같은 표기(분은 2자리, 버림). */
export function fmtDeg(lon: number): string {
  const d = degInSign(lon);
  return `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}′`;
}

const lonOf = (chart: Chart, id: BodyId) => chart.bodies.find((b) => b.id === id)!.lon;
const houseNum = (chart: Chart, lon: number) => (chart.houses ? houseOf(lon, chart.houses.cusps) : null);
const head = (label: string, sign: SignId) => `${label} · ${SIGNS[sign].ko}`;

function placement(chart: Chart, id: BodyId): DetailSection {
  const lon = lonOf(chart, id);
  const sign = signOf(lon);
  return { heading: head(PLANETS[id].ko, sign), paragraphs: placementText(id, sign, houseNum(chart, lon)) };
}

export function buildDetail(card: CardData, chart: Chart): Detail {
  const title = card.title;
  switch (card.kind) {
    case 'big3': {
      const sun = signOf(lonOf(chart, 'sun'));
      const moon = signOf(lonOf(chart, 'moon'));
      const asc = chart.houses ? signOf(chart.houses.asc) : null;
      return {
        title,
        sections: [
          { heading: head('태양', sun), paragraphs: [NATAL.sun[sun]] },
          { heading: head('달', moon), paragraphs: [NATAL.moon[moon]] },
          asc
            ? { heading: head('상승궁', asc), paragraphs: ascText(asc) }
            : { heading: '상승궁', paragraphs: ['태어난 시각을 넣으면 상승궁 해설이 나옵니다.'] },
        ],
      };
    }
    case 'traits': {
      const s = SIGNS[card.sign.id];
      const meta = `원소 ${ELEMENT_KO[ELEMENT[s.id]]} · 양태 ${MODALITY_KO[MODALITY[s.id]]} · 지배 행성 ${PLANETS[s.ruler].ko} · 핵심어 ${s.keywords.join('·')}`;
      return { title, sections: [{ heading: `태양 · ${s.ko}`, paragraphs: [meta, s.body] }] };
    }
    case 'love': {
      const hit = chart.aspects.find((a) => (a.a === 'venus' && a.b === 'mars') || (a.a === 'mars' && a.b === 'venus'));
      return {
        title,
        sections: [
          placement(chart, 'venus'),
          placement(chart, 'mars'),
          {
            heading: '금성과 화성 사이',
            paragraphs: [hit ? aspectText(hit, { mode: 'natal' }) : '금성과 화성 사이에는 주요 각도가 없습니다.'],
          },
        ],
      };
    }
    case 'work': {
      let primary: DetailSection;
      if (chart.houses) {
        const mc = signOf(chart.houses.mc);
        primary = { heading: head('중천(MC)', mc), paragraphs: [SIGNS[mc].body, HOUSES[9].body] };
      } else {
        const jup = signOf(lonOf(chart, 'jupiter'));
        primary = { heading: head('목성', jup), paragraphs: placementText('jupiter', jup, null) };
      }
      return { title, sections: [primary, placement(chart, 'saturn')] };
    }
    case 'elements': {
      const sections: DetailSection[] = ELEMENT_ORDER.map((e) => {
        const names = chart.bodies
          .filter((b) => b.id !== 'node' && ELEMENT[signOf(b.lon)] === e)
          .map((b) => PLANETS[b.id].ko);
        return { heading: `${ELEMENT_KO[e]} · ${card.counts[e]}개`, paragraphs: [names.length ? names.join(', ') : '없음'] };
      });
      const top = card.top.slice(0, 2);
      sections.push({
        heading: `가장 강한 원소 · ${top.map((e) => ELEMENT_KO[e]).join('·')}`,
        paragraphs: top.map((e) => ELEMENT_DETAIL[e]),
      });
      return { title, sections };
    }
    case 'chart': {
      const rows = chart.bodies.map((b) => {
        const p = PLANETS[b.id];
        const h = houseNum(chart, b.lon);
        return [`${p.glyph} ${p.ko}${b.retro && b.id !== 'node' ? ' (역행)' : ''}`, SIGNS[signOf(b.lon)].ko, fmtDeg(b.lon), h === null ? '—' : String(h)];
      });
      if (chart.houses) {
        const { asc, mc, cusps } = chart.houses;
        rows.push(['AC 상승궁', SIGNS[signOf(asc)].ko, fmtDeg(asc), String(houseOf(asc, cusps))]);
        rows.push(['MC 중천', SIGNS[signOf(mc)].ko, fmtDeg(mc), String(houseOf(mc, cusps))]);
      }
      const aspects = [...chart.aspects].sort((x, y) => x.orb - y.orb).slice(0, 8);
      return {
        title,
        sections: [
          {
            heading: '천체 배치',
            paragraphs: chart.houses ? [] : ['태어난 시각을 모르면 하우스 칸은 비워 둡니다.'],
            rows,
            columns: ['천체', '별자리', '도수', '하우스'],
          },
          {
            heading: '주요 각도',
            paragraphs: aspects.length
              ? aspects.map((a) => aspectText(a, { mode: 'natal' }))
              : ['주요 각도가 없습니다.'],
          },
        ],
      };
    }
  }
}
