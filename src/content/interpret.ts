import type { BodyId } from '../astro/bodies';
import type { SignId } from '../astro/zodiac';
import type { Aspect } from '../astro/aspects';
import { SIGNS } from './signs';
import { PLANETS, POINT_NAMES } from './planets';
import { HOUSES } from './houses';
import { ASPECTS } from './aspects';
import { NATAL } from './natal';
import { josa } from './josa';

function signSentence(body: BodyId, sign: SignId): string {
  const p = PLANETS[body];
  const s = SIGNS[sign];
  return `${s.ko}의 ${p.ko}: ${p.theme}${josa(p.theme, '이', '가')} ${s.style} 드러납니다. 핵심어는 ${s.keywords.join('·')}입니다.`;
}

function houseSentence(n: number): string {
  return `${n}하우스에 놓여 이 힘은 주로 「${HOUSES[n - 1].area}」 영역에서 쓰입니다.`;
}

export function placementText(body: BodyId, sign: SignId, house: number | null): string[] {
  const out: string[] = [];
  if (body === 'sun' || body === 'moon') out.push(NATAL[body][sign]);
  out.push(signSentence(body, sign));
  if (house !== null) out.push(houseSentence(house));
  return out;
}

export function ascText(sign: SignId): string[] {
  const s = SIGNS[sign];
  return [NATAL.asc[sign], `처음 만난 사람에게는 ${s.style} 움직이는 사람으로 보이기 쉽습니다.`];
}

export type AspectContext = { mode: 'natal' } | { mode: 'transit' } | { mode: 'synastry'; nameA: string; nameB: string };

export function aspectText(asp: Aspect, ctx: AspectContext): string {
  const A = POINT_NAMES[asp.a];
  const B = POINT_NAMES[asp.b];
  const k = ASPECTS[asp.type];
  const orb = `${asp.orb.toFixed(1)}°`;
  const meaning = `「${A.theme}」${josa(A.theme, '과', '와')} 「${B.theme}」${josa(B.theme, '이', '가')} ${k.phrase}`;
  if (ctx.mode === 'transit') {
    return `지금 하늘의 ${A.ko}${josa(A.ko, '이', '가')} 내 ${B.ko}에 ${k.ko}(${orb}) — ${meaning}`;
  }
  if (ctx.mode === 'synastry') {
    return `${ctx.nameB}님의 ${A.ko}${josa(A.ko, '과', '와')} ${ctx.nameA}님의 ${B.ko}: ${k.ko}(${orb}) — ${meaning}`;
  }
  return `${A.ko}${josa(A.ko, '과', '와')} ${B.ko}${josa(B.ko, '이', '가')} ${k.ko}(${orb}) — ${meaning}`;
}
