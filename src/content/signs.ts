import type { Element, Modality, SignId } from '../astro/zodiac';
import type { BodyId } from '../astro/bodies';

export type SignInfo = {
  id: SignId; ko: string; latin: string; glyph: string; ruler: BodyId;
  keywords: [string, string, string]; style: string; body: string;
};

export const ELEMENT_KO: Record<Element, string> = { fire: '불', earth: '흙', air: '공기', water: '물' };
export const MODALITY_KO: Record<Modality, string> = { cardinal: '활동', fixed: '고정', mutable: '변통' };

export const SIGNS: Record<SignId, SignInfo> = {
  aries: {
    id: 'aries', ko: '양자리', latin: 'Aries', glyph: '♈\uFE0E', ruler: 'mars',
    keywords: ['시작', '용기', '직진'], style: '곧장 부딪치며',
    body: '불 원소에 활동 양태가 겹친, 황도대의 문을 여는 별자리입니다. 계획서보다 첫걸음이 먼저 나가는 편이라 아무도 손대지 않은 일에 뛰어드는 데 망설임이 적습니다. 불이 빨리 붙는 만큼 빨리 식기도 해서, 흥미가 떨어진 뒤의 반복 작업과 기다림을 견디는 일이 과제로 남기 쉽습니다.',
  },
  taurus: {
    id: 'taurus', ko: '황소자리', latin: 'Taurus', glyph: '♉\uFE0E', ruler: 'venus',
    keywords: ['안정', '감각', '끈기'], style: '천천히 확실하게',
    body: '흙 원소와 고정 양태가 만나 손에 잡히는 것을 믿는 별자리입니다. 맛있는 밥, 좋은 촉감의 옷, 익숙한 동네처럼 몸으로 느끼는 편안함을 소중히 여기고, 한번 정한 속도를 끝까지 지키는 편입니다. 환경이 갑자기 바뀌면 버티는 쪽을 먼저 택해서 고집이 세다는 말을 듣기 쉽습니다.',
  },
  gemini: {
    id: 'gemini', ko: '쌍둥이자리', latin: 'Gemini', glyph: '♊\uFE0E', ruler: 'mercury',
    keywords: ['호기심', '말', '연결'], style: '가볍고 재빠르게',
    body: '공기 원소에 변통 양태가 붙어 정보가 오가는 길목을 좋아하는 별자리입니다. 대화 중에 화제가 여러 번 바뀌어도 금방 따라잡고, 서로 모르는 사람이나 생각을 이어 주는 데 재주가 있습니다. 관심이 넓게 퍼지는 탓에 하나를 깊이 파기 전에 다음 것으로 옮겨 가는 일이 잦습니다.',
  },
  cancer: {
    id: 'cancer', ko: '게자리', latin: 'Cancer', glyph: '♋\uFE0E', ruler: 'moon',
    keywords: ['보살핌', '소속', '기억'], style: '품어 주고 지키며',
    body: '물 원소와 활동 양태가 만나 내 사람과 내 자리를 먼저 챙기는 별자리입니다. 겉은 단단한 껍데기처럼 조심스럽지만 안으로 들인 사람에게는 밥을 챙기고 안부를 묻는 식으로 정을 쏟습니다. 지난 일과 서운함을 오래 기억하는 편이라, 상처를 받으면 말 대신 문을 닫아 버리기 쉽습니다.',
  },
  leo: {
    id: 'leo', ko: '사자자리', latin: 'Leo', glyph: '♌\uFE0E', ruler: 'sun',
    keywords: ['표현', '자존심', '너그러움'], style: '당당하게 나서며',
    body: '불 원소에 고정 양태가 더해져 한결같이 타오르는 별자리입니다. 무대 위든 친구 모임이든 자기 색을 숨기지 않고, 마음에 든 사람에게는 아낌없이 베푸는 편입니다. 인정받고 싶은 마음이 커서 무시당했다고 느끼면 자존심이 먼저 다치고, 그 서운함을 좀처럼 내려놓지 못하기도 합니다.',
  },
  virgo: {
    id: 'virgo', ko: '처녀자리', latin: 'Virgo', glyph: '♍\uFE0E', ruler: 'mercury',
    keywords: ['분석', '쓸모', '세심함'], style: '꼼꼼히 다듬으며',
    body: '흙 원소와 변통 양태가 만나 쓸모 있게 고치는 일에 능한 별자리입니다. 남들이 지나친 오타나 동선의 낭비가 눈에 먼저 들어오고, 누군가 도움을 청하면 구체적인 방법으로 답하는 편입니다. 기준이 높아 스스로를 가장 가혹하게 평가하기 쉽고, 완벽하지 않다는 이유로 시작을 미루기도 합니다.',
  },
  libra: {
    id: 'libra', ko: '천칭자리', latin: 'Libra', glyph: '♎\uFE0E', ruler: 'venus',
    keywords: ['균형', '관계', '미감'], style: '상대와 맞춰 가며',
    body: '공기 원소에 활동 양태가 붙어 관계의 저울을 맞추려는 별자리입니다. 양쪽 말을 다 들어 보고 공정한 결론을 찾으려 하며, 옷차림이나 공간의 조화에도 예민한 편입니다. 모두를 만족시키려다 정작 자기 의견을 늦게 말하거나, 갈등이 싫어 결정을 미루는 모습이 나타나기 쉽습니다.',
  },
  scorpio: {
    id: 'scorpio', ko: '전갈자리', latin: 'Scorpio', glyph: '♏\uFE0E', ruler: 'pluto',
    keywords: ['집중', '깊이', '변화'], style: '깊이 파고들며',
    body: '물 원소와 고정 양태가 만나 감정을 깊고 오래 품는 별자리입니다. 얕은 대화보다 속마음을 나누는 관계를 원하고, 한번 붙든 문제는 밑바닥까지 확인해야 직성이 풀리는 편입니다. 쉽게 믿지 않는 만큼 배신에 민감해서, 상처를 받으면 관계를 통째로 끊어 내는 극단으로 가기도 합니다.',
  },
  sagittarius: {
    id: 'sagittarius', ko: '궁수자리', latin: 'Sagittarius', glyph: '♐\uFE0E', ruler: 'jupiter',
    keywords: ['탐험', '믿음', '자유'], style: '멀리 내다보며',
    body: '불 원소에 변통 양태가 더해져 지평선 너머를 궁금해하는 별자리입니다. 낯선 나라, 새로운 학문, 큰 질문 앞에서 눈이 반짝이고, 웬만한 실패도 배울 거리로 넘기는 낙천성이 있습니다. 솔직함이 지나쳐 상대에게 날 선 말이 되기도 하고, 묶인다고 느끼면 약속에서 슬그머니 빠져나가기 쉽습니다.',
  },
  capricorn: {
    id: 'capricorn', ko: '염소자리', latin: 'Capricorn', glyph: '♑\uFE0E', ruler: 'saturn',
    keywords: ['책임', '목표', '인내'], style: '계단을 하나씩 오르듯',
    body: '흙 원소와 활동 양태가 만나 오래 걸리는 목표를 끝까지 오르는 별자리입니다. 당장의 즐거움보다 몇 년 뒤의 결과를 계산하는 편이고, 맡은 역할은 힘들어도 티 내지 않고 해내려 합니다. 일과 체면을 앞세우다 보니 쉬는 법을 잊거나, 약한 모습을 보이는 것을 실패처럼 여기기 쉽습니다.',
  },
  aquarius: {
    id: 'aquarius', ko: '물병자리', latin: 'Aquarius', glyph: '♒\uFE0E', ruler: 'uranus',
    keywords: ['독립', '이상', '동료'], style: '틀을 벗어나',
    body: '공기 원소에 고정 양태가 붙어 자기만의 원칙을 꾸준히 지키는 별자리입니다. 관습이 왜 그런지부터 묻고, 한 사람보다 여럿이 함께 나아지는 방향에 마음이 끌리는 편입니다. 친구는 많아도 속을 잘 보이지 않아 차갑다는 오해를 사기 쉽고, 남과 다르려는 고집이 스스로를 가두기도 합니다.',
  },
  pisces: {
    id: 'pisces', ko: '물고기자리', latin: 'Pisces', glyph: '♓\uFE0E', ruler: 'neptune',
    keywords: ['공감', '상상', '흐름'], style: '경계를 풀고 스며들며',
    body: '물 원소와 변통 양태가 만나 황도대의 끝에서 모든 것을 녹여 내는 별자리입니다. 남의 기분을 제 것처럼 느끼고, 음악이나 그림처럼 말로 옮기기 어려운 세계에 쉽게 빠져듭니다. 나와 남의 선이 흐려지기 쉬워서 부탁을 거절하지 못하거나, 힘든 현실을 몽상으로 피하려는 경향이 생기기도 합니다.',
  },
};
