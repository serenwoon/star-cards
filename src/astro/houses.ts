import { MakeTime, SiderealTime } from 'astronomy-engine';
import { DEG, RAD, norm, signedDiff } from './angles';

export type HouseSystem = 'placidus' | 'whole';
export type Houses = { system: HouseSystem; fallback: boolean; asc: number; mc: number; cusps: number[] };

/** 평균 황도경사(IAU 2006 근사). 장동은 1° 오차 기준에 비해 작아 뺀다. */
export function obliquity(utc: Date): number {
  const T = MakeTime(utc).tt / 36525;
  return 23.439291111 - 0.0130041667 * T - 1.6667e-7 * T * T + 5.0278e-7 * T * T * T;
}

export function ramcOf(utc: Date, lonEast: number): number {
  return norm(SiderealTime(utc) * 15 + lonEast);
}

/** 적경 ra(도)를 가진 황도 위 점의 황경. */
function lonFromRa(ra: number, eps: number): number {
  return norm(Math.atan2(Math.sin(ra * RAD), Math.cos(ra * RAD) * Math.cos(eps * RAD)) * DEG);
}

function ascFrom(ramc: number, eps: number, lat: number): number {
  const r = ramc * RAD;
  const e = eps * RAD;
  return norm(Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(e) + Math.tan(lat * RAD) * Math.sin(e))) * DEG);
}

/** 낮 반호(도). 정의되지 않으면 NaN. */
function diurnalSemiArc(lon: number, eps: number, lat: number): number {
  const dec = Math.asin(Math.sin(eps * RAD) * Math.sin(lon * RAD));
  const x = Math.tan(lat * RAD) * Math.tan(dec);
  if (Math.abs(x) > 1) return NaN;
  return 90 + Math.asin(x) * DEG;
}

/**
 * Placidus 커스프 하나. 반복법으로 푼다.
 * above=true: MC에서 낮 반호의 frac만큼(11하우스 1/3, 12하우스 2/3)
 * above=false: IC에서 밤 반호의 frac만큼 되돌아온 점(2하우스 2/3, 3하우스 1/3)
 */
function placidusCusp(ramc: number, eps: number, lat: number, frac: number, above: boolean): number {
  let ra = above ? ramc + 90 * frac : ramc + 180 - 90 * frac;
  for (let i = 0; i < 50; i++) {
    const lon = lonFromRa(ra, eps);
    const sda = diurnalSemiArc(lon, eps, lat);
    if (Number.isNaN(sda)) return NaN;
    const next = above ? ramc + sda * frac : ramc + 180 - (180 - sda) * frac;
    if (Math.abs(signedDiff(next, ra)) < 1e-9) return lonFromRa(next, eps);
    ra = next;
  }
  return lonFromRa(ra, eps);
}

function wholeSign(asc: number, mc: number, fallback: boolean): Houses {
  const start = Math.floor(asc / 30) * 30;
  return { system: 'whole', fallback, asc, mc, cusps: Array.from({ length: 12 }, (_, i) => norm(start + 30 * i)) };
}

export function housesFromRamc(ramc: number, eps: number, lat: number, system: HouseSystem): Houses {
  const mc = lonFromRa(ramc, eps);
  const asc = ascFrom(ramc, eps, lat);
  if (system === 'whole') return wholeSign(asc, mc, false);
  if (Math.abs(lat) > 66) return wholeSign(asc, mc, true);
  const c11 = placidusCusp(ramc, eps, lat, 1 / 3, true);
  const c12 = placidusCusp(ramc, eps, lat, 2 / 3, true);
  const c2 = placidusCusp(ramc, eps, lat, 2 / 3, false);
  const c3 = placidusCusp(ramc, eps, lat, 1 / 3, false);
  if ([c11, c12, c2, c3].some(Number.isNaN)) return wholeSign(asc, mc, true);
  // ASC·MC는 계산값 그대로 넣는다. 180°를 두 번 돌려 되돌리면 끝자리가 달라져 MC가 9하우스로 떨어진다
  const cusps = [
    asc, c2, c3, norm(mc + 180), norm(c11 + 180), norm(c12 + 180),
    norm(asc + 180), norm(c2 + 180), norm(c3 + 180), mc, c11, c12,
  ];
  return { system: 'placidus', fallback: false, asc, mc, cusps };
}

export function computeHouses(utc: Date, lat: number, lon: number, system: HouseSystem): Houses {
  return housesFromRamc(ramcOf(utc, lon), obliquity(utc), lat, system);
}

export function houseOf(lon: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    if (norm(lon - start) < norm(end - start)) return i + 1;
  }
  return 1;
}
