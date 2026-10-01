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
import { GROWTH_ELEMENT, GROWTH_SATURN, GROWTH_NODE, GROWTH_MOON, GROWTH_ASC } from '../content/cards/growth';
import { TRAITS } from '../content/cards/traits';
import {
  SUN_MOON, SUN_MOON_ASPECT, ASC_SUN, HOUSE_FOCUS, MODALITY_FOCUS, VENUS_MARS, SATURN_TOUCH, elementRelation,
} from '../content/cards/synthesis';
import { ASPECTS } from '../content/aspects';
import { josa } from '../content/josa';
import { balance } from '../astro/balance';
import { ELEMENT_ORDER, elementSummary, weakestElement, type CardData } from './model';
import { sunMoonHit, busiestHouse, topModality, chartRuler, tightestAspects, saturnTouches } from './synthesisModel';

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

/** 천체 한 자리의 해설. rich면 조합 문장 뒤에 행성·별자리·하우스 해설 문단을 잇는다(연애·일 카드용). */
function placement(chart: Chart, id: BodyId, opts: { lead?: string; rich?: boolean } = {}): DetailSection {
  const lon = lonOf(chart, id);
  const sign = signOf(lon);
  const house = houseNum(chart, lon);
  const paragraphs = [...(opts.lead ? [opts.lead] : []), ...placementText(id, sign, house)];
  if (opts.rich) {
    paragraphs.push(PLANETS[id].body, SIGNS[sign].body);
    if (house !== null) paragraphs.push(HOUSES[house - 1].body);
  }
  return { heading: head(PLANETS[id].ko, sign), paragraphs };
}

function saturnLead(chart: Chart): string[] {
  const touched = saturnTouches(chart);
  if (touched.length === 2) return [SATURN_TOUCH.both];
  return touched.map((id) => SATURN_TOUCH[id]);
}

const MOON_CAVEAT = '태어난 시각을 모르면 달의 위치가 몇 도 달라질 수 있어, 달이 낀 각도는 참고로만 보는 편이 좋습니다.';

/** 종합 긴 글의 연결 해석: 배치 하나씩이 아니라 둘 이상이 만나서 생기는 결을 읽는다. */
function connections(chart: Chart): DetailSection[] {
  const sun = signOf(lonOf(chart, 'sun'));
  const moon = signOf(lonOf(chart, 'moon'));
  const asc = chart.houses ? signOf(chart.houses.asc) : null;
  const out: DetailSection[] = [];

  out.push({
    heading: `속마음과 바라는 것 · 태양 ${ELEMENT_KO[ELEMENT[sun]]} × 달 ${ELEMENT_KO[ELEMENT[moon]]}`,
    paragraphs: [SUN_MOON[ELEMENT[sun]][ELEMENT[moon]]],
  });

  const hit = sunMoonHit(chart);
  out.push({
    heading: `안에서 맞는가, 부딪치는가 · 태양과 달 ${hit ? ASPECTS[hit.type].ko : '각도 없음'}`,
    paragraphs: [
      ...(chart.houses ? [] : [MOON_CAVEAT]),
      SUN_MOON_ASPECT[hit?.type ?? 'none'],
      ...(hit ? [aspectText(hit, { mode: 'natal' })] : []),
    ],
  });

  if (asc) {
    out.push({
      heading: `겉모습과 실제 · 상승궁 ${SIGNS[asc].ko} × 태양 ${SIGNS[sun].ko}`,
      paragraphs: [ASC_SUN[elementRelation(ELEMENT[asc], ELEMENT[sun])]],
    });
  }

  const busy = busiestHouse(chart);
  if (busy) {
    const names = busy.bodies.map((id) => PLANETS[id].ko);
    const focus = HOUSE_FOCUS[busy.house - 1];
    if (names.length > 1) {
      const line = `${names.join(', ')}${josa(names[names.length - 1], '이', '가')} 모여 있습니다.`;
      out.push({ heading: `삶의 무게중심 · ${busy.house}하우스`, paragraphs: [line, focus] });
    } else {
      // 최다가 1개면 몰린 곳이 없다는 뜻이고, 규칙대로 태양 하우스가 뽑혀 있다
      const line = `천체가 한 하우스에 몰리지 않고 고르게 흩어져 있어, 태양이 놓인 ${busy.house}하우스를 중심으로 읽습니다.`;
      out.push({ heading: `태양이 놓인 자리 · ${busy.house}하우스`, paragraphs: [line, focus] });
    }
  }

  const modality = balance(chart.bodies).modality;
  const tops = topModality(chart.bodies).slice(0, 2);
  out.push({
    heading: `움직이는 방식 · ${tops.map((m) => MODALITY_KO[m]).join('·')}`,
    paragraphs: [
      (['cardinal', 'fixed', 'mutable'] as const).map((m) => `${MODALITY_KO[m]} ${modality[m]}`).join(' · '),
      ...tops.map((m) => MODALITY_FOCUS[m]),
    ],
  });

  const venus = ELEMENT[signOf(lonOf(chart, 'venus'))];
  const mars = ELEMENT[signOf(lonOf(chart, 'mars'))];
  out.push({
    heading: `끌림과 다가가는 방식 · 금성 ${ELEMENT_KO[venus]} × 화성 ${ELEMENT_KO[mars]}`,
    paragraphs: [VENUS_MARS[elementRelation(venus, mars)]],
  });

  const ruler = chartRuler(chart);
  if (ruler) {
    const name = PLANETS[ruler.planet].ko;
    // 지배 행성이 태양·달이면 그 해설 문단은 「한눈에 보기」에 이미 있으니 뺀다
    const shown = ruler.planet === 'sun' || ruler.planet === 'moon' ? NATAL[ruler.planet][ruler.sign] : null;
    out.push({
      heading: `차트를 이끄는 행성 · ${name}`,
      paragraphs: [
        `상승궁의 지배 행성은 ${name}입니다. 차트 전체의 방향을 잡는 행성으로 읽습니다.`,
        ...placementText(ruler.planet, ruler.sign, ruler.house).filter((p) => p !== shown),
      ],
    });
  }

  // 태양–달 각도는 위에서 이미 읽었으니 여기서는 그다음 것을 채운다
  const top = tightestAspects(chart, 3, hit);
  const moonInTop = top.some((a) => a.a === 'moon' || a.b === 'moon');
  out.push({
    // 태양–달을 건너뛰었으면 「가장」이 아니라 「그 밖에」다
    heading: hit ? '그 밖에 강하게 이어진 세 가지' : '가장 강하게 이어진 세 가지',
    paragraphs: top.length
      ? [...(!chart.houses && moonInTop ? [MOON_CAVEAT] : []), ...top.map((a) => aspectText(a, { mode: 'natal' }))]
      : [hit ? '태양과 달 말고는 주요 각도가 없습니다.' : '주요 각도가 없습니다.'],
  });
  return out;
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
          { heading: head('태양', sun), paragraphs: [card.sunLine, NATAL.sun[sun]] },
          { heading: head('달', moon), paragraphs: [card.moonLine, NATAL.moon[moon]] },
          asc
            ? { heading: head('상승궁', asc), paragraphs: [...(card.ascLine ? [card.ascLine] : []), ...ascText(asc)] }
            : { heading: '상승궁', paragraphs: ['태어난 시각을 넣으면 상승궁 해설이 나옵니다.'] },
        ],
      };
    }
    case 'traits': {
      const s = SIGNS[card.sign.id];
      const meta = `원소 ${ELEMENT_KO[ELEMENT[s.id]]} · 양태 ${MODALITY_KO[MODALITY[s.id]]} · 지배 행성 ${PLANETS[s.ruler].ko} · 핵심어 ${s.keywords.join('·')}`;
      return {
        title,
        sections: [
          { heading: `태양 · ${s.ko}`, paragraphs: [card.tags.map((t) => `#${t}`).join(' '), meta, s.body] },
          { heading: '강점과 약점', paragraphs: [`강점: ${card.strength}`, `약점: ${card.weakness}`] },
        ],
      };
    }
    case 'love': {
      const hit = chart.aspects.find((a) => (a.a === 'venus' && a.b === 'mars') || (a.a === 'mars' && a.b === 'venus'));
      return {
        title,
        sections: [
          placement(chart, 'venus', { lead: card.venusLine, rich: true }),
          placement(chart, 'mars', { lead: card.marsLine, rich: true }),
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
        primary = { heading: head('중천(MC)', mc), paragraphs: [card.primary.line, SIGNS[mc].body, HOUSES[9].body] };
      } else {
        // 시각을 모르면 하우스가 없으니 목성은 행성·별자리 해설까지만 붙는다
        primary = placement(chart, 'jupiter', { lead: card.primary.line, rich: true });
      }
      return { title, sections: [primary, placement(chart, 'saturn', { lead: card.saturn.line, rich: true })] };
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
        paragraphs: [card.line, ...top.map((e) => ELEMENT_DETAIL[e])],
      });
      const weak = weakestElement(card.counts, card.top);
      if (weak) sections.push({ heading: `가장 약한 원소 · ${ELEMENT_KO[weak]}`, paragraphs: [ELEMENT_DETAIL[weak]] });
      return { title, sections };
    }
    case 'summary': {
      const sun = signOf(lonOf(chart, 'sun'));
      const moon = signOf(lonOf(chart, 'moon'));
      const asc = chart.houses ? signOf(chart.houses.asc) : null;
      const saturn = signOf(lonOf(chart, 'saturn'));
      const node = signOf(lonOf(chart, 'node'));
      const { counts, top } = elementSummary(chart);
      const weak = weakestElement(counts, top);
      return {
        title,
        sections: [
          {
            heading: '한눈에 보기',
            paragraphs: [
              card.intro, NATAL.sun[sun], NATAL.moon[moon], ...(asc ? [NATAL.asc[asc]] : []),
              `강점: ${TRAITS[sun].strength}`, `약점: ${TRAITS[sun].weakness}`,
            ],
          },
          ...connections(chart),
          {
            heading: '타고난 기질',
            paragraphs: [
              ELEMENT_ORDER.map((e) => `${ELEMENT_KO[e]} ${counts[e]}`).join(' · '),
              ...top.slice(0, 2).map((e) => ELEMENT_DETAIL[e]),
            ],
          },
          {
            heading: '더 자랄 수 있는 방향',
            paragraphs: ['차트에서 덜 쓰는 쪽과 힘이 들어가는 자리를 보고 고른 제안입니다. 정해진 답이 아니라 해 볼 만한 연습으로 읽으면 됩니다.'],
          },
          // 가장 약한 원소라도 2개 이상이면 「약하다」고 하지 않는다
          ...(weak ? [{ heading: `${counts[weak] >= 2 ? '조금 덜 쓰는 원소' : '약한 원소 채우기'} · ${ELEMENT_KO[weak]}`, paragraphs: [GROWTH_ELEMENT[weak]] }] : []),
          // 토성이 태양·달과 닿아 있으면 그 사실을 조언 앞에 한 문장으로 먼저 적는다
          { heading: head('토성', saturn), paragraphs: [...saturnLead(chart), GROWTH_SATURN[saturn]] },
          { heading: head('북쪽 노드', node), paragraphs: [GROWTH_NODE[node]] },
          { heading: head('달', moon), paragraphs: [GROWTH_MOON[moon]] },
          asc
            ? { heading: head('상승궁', asc), paragraphs: [GROWTH_ASC[asc]] }
            : { heading: '상승궁', paragraphs: ['태어난 시각을 넣으면 상승궁 조언이 나옵니다.'] },
        ],
      };
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
