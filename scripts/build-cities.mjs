// 사용: node scripts/build-cities.mjs <cities15000.txt 경로>
// GeoNames(CC BY 4.0) → src/data/cities.json
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) throw new Error('cities15000.txt 경로를 주세요');
const HANGUL = /^[가-힣]+$/;
const PLACE = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLC']);

// 같은 도시의 중복 항목·제주시 안의 동네(한글 이름을 확신할 수 없어 뺀다), 거제(1842754 Kyosai)는 1842754가 이미 있는 거제(11101805)와 같은 곳
const EXCLUDE = new Set(['1841775', '1833332', '1847050', '1842754']);

// 이름이 겹치는 해외 도시에 붙일 나라 이름 (겹치는 항목의 나라만)
const COUNTRY = {
  JM: '자메이카', GY: '가이아나', KY: '케이맨 제도', KN: '세인트키츠 네비스', GP: '과들루프', NF: '노퍽섬',
};

// 자동 고르기가 어색한 도시의 수동 보정 (geonameid → 한글 이름)
const OVERRIDES = {
  // 같은 이름 구분
  1841811: '광주광역시', 1841810: '광주 (경기)', 1840179: '고성 (강원)', 1842518: '고성 (경남)',
  // 영문만 남던 한국 도시 (좌표로 확인)
  1840379: '남원', 1793505: '타이저우 (장쑤)', 8400694: '타이저우 (저장)', 1832617: '영천',
  // 한국: 옛 이름·한자 읽기·한글 이름 없음
  1835848: '서울', 1845020: '통영', 6621166: '서귀포', 1892823: '동해', 1840982: '무안',
  1842939: '김제', 1838722: '부안', 1897118: '화도', 1912205: '웅상', 1882056: '신현', 1925936: '내서',
  1925943: '화원', 1896953: '부발', 1840862: '문산', 1846852: '아라동', 1844954: '증평', 1844308: '하양',
  1886598: '연무', 1840413: '남사',
  // 중국·일본 등: 옛 한자음(상해·북경) 대신 오늘날 표기, 한글 이름이 없는 큰 도시 보충
  1796236: '상하이', 1816670: '베이징', 1795565: '선전', 1792947: '톈진', 1808926: '항저우', 1814087: '다롄',
  1787093: '옌타이', 2038180: '창춘', 1795855: '사오싱', 1814906: '충칭', 1815286: '청두', 1791247: '우한',
  1790630: '시안', 2037013: '하얼빈', 1812545: '둥관', 1811103: '포산', 1805753: '지난', 1797929: '칭다오',
  1886760: '쑤저우', 1784658: '정저우', 1804651: '쿤밍', 1810821: '푸저우', 1790645: '샤먼', 1799397: '닝보',
  1790923: '우시', 1808722: '허페이', 1815577: '창사', 1800163: '난창',
  1853909: '오사카', 1848354: '요코하마', 1856057: '나고야', 1857910: '교토', 2128295: '삿포로', 1863967: '후쿠오카',
  1859171: '고베', 2111149: '센다이', 1862415: '히로시마', 1859642: '가와사키', 6940394: '사이타마',
  1668399: '타이중', 1673820: '가오슝', 1668355: '타이난',
  745044: '이스탄불', 3448439: '상파울루', 1277333: '벵갈루루', 498817: '상트페테르부르크', 1880252: '싱가포르',
  2158177: '멜버른', 703448: '키이우', 706483: '하르키우', 5368361: '로스앤젤레스', 4140963: '워싱턴',
};

// 한글 이름 고르기: 순한글만 후보로 삼고, 도시 이름다운 것(짧고 시/군/구로 끝나지 않는 접미 제거형)을 우선한다.
function pickKo(alt, name, cc) {
  const cands = alt.split(',').filter((n) => HANGUL.test(n));
  if (!cands.length) return null;
  const strip = (n) => (cc === 'KR' ? n.replace(/(특별자치시|특별자치도|특별시|광역시|시|군)$/, '') : n);
  const score = (n) => {
    let s = n.length;
    if (cc === 'KR' && n !== strip(n)) s += 0.5; // 접미사 붙은 긴 이름은 뒤로
    return s;
  };
  const best = [...cands].sort((a, b) => score(a) - score(b))[0];
  return cc === 'KR' ? strip(best) || best : best;
}

const rows = readFileSync(src, 'utf8').split('\n').filter(Boolean).map((line) => line.split('\t'));
const out = [];
for (const r of rows) {
  const [id, name, , alt, lat, lon, , code, cc, , , , , , pop, , , tz] = r;
  if (!PLACE.has(code) || EXCLUDE.has(id)) continue;
  const population = Number(pop);
  const keep = cc === 'KR' || population >= 1_000_000 || code === 'PPLC';
  if (!keep) continue;
  const ko = OVERRIDES[id] ?? pickKo(alt, name, cc) ?? name;
  out.push({ id, ko, en: name, cc, lat: Number(Number(lat).toFixed(4)), lon: Number(Number(lon).toFixed(4)), tz, pop: population });
}
// 이름이 겹치는 해외 도시는 나라를 붙이고, 그래도 겹치면 실패한다
const groups = new Map();
for (const c of out) groups.set(c.ko, [...(groups.get(c.ko) ?? []), c]);
for (const list of groups.values()) {
  if (list.length < 2 || list.some((c) => c.cc === 'KR')) continue;
  for (const c of list) {
    if (!COUNTRY[c.cc]) throw new Error(`나라 이름 표에 ${c.cc} 가 없습니다: ${c.ko}`);
    c.ko = `${c.ko} (${COUNTRY[c.cc]})`;
  }
}
const seen = new Map();
for (const c of out) seen.set(c.ko, [...(seen.get(c.ko) ?? []), c]);
const dup = [...seen.values()].filter((l) => l.length > 1);
if (dup.length) throw new Error('ko 이름이 겹칩니다: ' + dup.map((l) => l.map((c) => `${c.id}:${c.ko}`).join(' / ')).join(', '));

out.sort((a, b) => b.pop - a.pop);
writeFileSync(fileURLToPath(new URL('../src/data/cities.json', import.meta.url)), JSON.stringify(out) + '\n');
console.log(`도시 ${out.length}곳, 한국 ${out.filter((c) => c.cc === 'KR').length}곳`);
