import type { Element } from '../../astro/zodiac';
import { ELEMENT_KO } from '../signs';
import { josa } from '../josa';

/** 가장 강한 원소가 하나일 때의 한 줄 */
export const ELEMENT_LINE: Record<Element, string> = {
  fire: '불이 강해서 일단 해 보는 추진력이 큰 편이에요',
  earth: '흙이 강해서 현실 감각과 꾸준함이 돋보이는 편이에요',
  air: '공기가 강해서 생각과 대화로 세상을 넓혀 가요',
  water: '물이 강해서 감정을 깊이 느끼고 잘 헤아리는 편이에요',
};

/** 원소 동점: 「A와 B가 비슷하게 강해요」 */
export function tieLine(a: Element, b: Element): string {
  const A = ELEMENT_KO[a];
  const B = ELEMENT_KO[b];
  return `${A}${josa(A, '과', '와')} ${B}${josa(B, '이', '가')} 비슷하게 강해요`;
}
