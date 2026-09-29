import type { AspectType } from '../astro/aspects';

export type AspectInfo = {
  id: AspectType; ko: string; glyph: string; angle: number;
  nature: 'harmony' | 'tension' | 'blend'; phrase: string; body: string;
};

export const ASPECTS: Record<AspectType, AspectInfo> = {
  conjunction: {
    id: 'conjunction', ko: '합', glyph: '☌\uFE0E', angle: 0, nature: 'blend', phrase: '한 덩어리로 섞입니다',
    body: '두 점이 거의 같은 자리(0°)에 겹친 모양입니다. 두 행성의 성질이 따로 놀지 않고 한 목소리로 나와서 그 주제가 삶에서 유난히 크게 들립니다. 좋고 나쁨은 어떤 행성끼리 만났는지에 달려 있고, 둘을 떼어 놓고 보기 어렵다는 점이 특징입니다.',
  },
  opposition: {
    id: 'opposition', ko: '충', glyph: '☍\uFE0E', angle: 180, nature: 'tension', phrase: '서로 반대편에서 당깁니다',
    body: '두 점이 황도 원의 정반대(180°)에 마주 선 모양입니다. 한쪽을 택하면 다른 쪽이 서운해하는 줄다리기처럼 느껴지고, 그 갈등을 남에게 비춰 보며 알아차리는 경우가 많습니다. 양쪽을 번갈아 오가다 가운데서 균형점을 찾으면 시야가 넓어지는 긴장입니다.',
  },
  trine: {
    id: 'trine', ko: '삼분', glyph: '△\uFE0E', angle: 120, nature: 'harmony', phrase: '힘들이지 않고 잘 어울립니다',
    body: '두 점이 120° 떨어져 보통 같은 원소의 별자리끼리 이어지는 조화로운 각입니다. 두 행성이 서로를 자연스럽게 돕기 때문에 그 분야는 배우지 않아도 되는 재능처럼 느껴집니다. 너무 편하다 보니 굳이 갈고닦지 않고 흘려보내기 쉽다는 점이 아쉬움으로 남습니다.',
  },
  square: {
    id: 'square', ko: '사분', glyph: '□\uFE0E', angle: 90, nature: 'tension', phrase: '부딪치며 서로를 자극합니다',
    body: '두 점이 90° 꺾여 만나는 긴장된 각입니다. 두 행성이 원하는 것이 달라 속에서 마찰이 생기고, 같은 문제로 여러 번 걸려 넘어지는 느낌을 주기 쉽습니다. 불편함이 행동을 끌어내기 때문에 오래 씨름한 사분은 차트에서 가장 단단한 추진력이 되기도 합니다.',
  },
  sextile: {
    id: 'sextile', ko: '육분', glyph: '⚹\uFE0E', angle: 60, nature: 'harmony', phrase: '기회가 오면 잘 맞물립니다',
    body: '두 점이 60° 떨어진 부드러운 각으로, 보통 불과 공기, 흙과 물처럼 서로 통하는 원소끼리 이어집니다. 삼분보다 힘은 약하지만 손을 조금만 뻗으면 두 행성이 협력하는 문이 열립니다. 그냥 두면 가능성으로만 남기 쉬워서 먼저 움직여야 빛을 보는 각입니다.',
  },
};
