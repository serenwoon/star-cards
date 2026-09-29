import type { SignId } from '../../astro/zodiac';

export type Traits = { tags: [string, string, string]; strength: string; weakness: string };

/** 해시태그는 `#` 없이 저장한다. 강점·약점은 한 줄. */
export const TRAITS: Record<SignId, Traits> = {
  aries: {
    tags: ['직진', '추진력', '도전'],
    strength: '망설이는 사람들 앞에서 첫걸음을 떼 줄 수 있어요',
    weakness: '마음이 급해 말이 먼저 나갈 때가 있어요',
  },
  taurus: {
    tags: ['안정감', '미식가', '끈기'],
    strength: '흔들리지 않는 꾸준함으로 주변에 안정감을 줘요',
    weakness: '계획이 갑자기 바뀌면 적응하는 데 시간이 걸려요',
  },
  gemini: {
    tags: ['호기심', '수다', '재치'],
    strength: '낯선 정보도 빠르게 익혀 쉽게 풀어 줄 수 있어요',
    weakness: '이것저것 벌이다 보면 마무리가 밀리기 쉬워요',
  },
  cancer: {
    tags: ['다정함', '집밥', '보살핌'],
    strength: '곁에 있는 사람이 기댈 수 있는 품이 되어 줘요',
    weakness: '상처를 받으면 말없이 마음의 문을 닫기 쉬워요',
  },
  leo: {
    tags: ['존재감', '자신감', '무대'],
    strength: '주변 분위기를 단숨에 밝히는 따뜻한 힘이 있어요',
    weakness: '인정받지 못한다고 느끼면 쉽게 속상해질 수 있어요',
  },
  virgo: {
    tags: ['꼼꼼함', '계획표', '정리'],
    strength: '남들이 놓친 실수를 먼저 찾아 바로잡을 수 있어요',
    weakness: '스스로에게 엄격해서 쉽게 지칠 때가 있어요',
  },
  libra: {
    tags: ['균형', '매너', '조화'],
    strength: '양쪽 입장을 공정하게 듣고 접점을 찾아 줘요',
    weakness: '갈등이 싫어서 결정을 미루게 될 때가 있어요',
  },
  scorpio: {
    tags: ['몰입', '통찰', '신비'],
    strength: '사람과 일의 속사정을 꿰뚫어 보는 눈이 있어요',
    weakness: '쉽게 믿지 못해 혼자 오래 곱씹을 때가 있어요',
  },
  sagittarius: {
    tags: ['여행', '자유', '낙천'],
    strength: '실패도 배울 거리로 넘기는 낙천성이 있어요',
    weakness: '솔직함이 지나쳐 말이 날카롭게 들릴 때가 있어요',
  },
  capricorn: {
    tags: ['책임감', '성실', '목표'],
    strength: '어려운 일도 끝까지 책임지고 해내는 힘이 있어요',
    weakness: '쉬는 법을 잊고 일만 붙들 때가 있어요',
  },
  aquarius: {
    tags: ['독립', '아이디어', '괴짜'],
    strength: '틀에 갇히지 않은 아이디어로 새 길을 열어요',
    weakness: '속마음을 잘 안 보여 차갑다는 오해를 받기 쉬워요',
  },
  pisces: {
    tags: ['공감', '상상력', '감성'],
    strength: '남의 아픔을 내 일처럼 느끼는 공감력이 있어요',
    weakness: '부탁을 거절하지 못해 혼자 지칠 때가 있어요',
  },
};
