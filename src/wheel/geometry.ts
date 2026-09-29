import { RAD, norm, signedDiff } from '../astro/angles';

export function toXY(lon: number, r: number, asc: number): [number, number] {
  const t = (180 + lon - asc) * RAD;
  return [r * Math.cos(t), -r * Math.sin(t)];
}

export function sectorPath(r0: number, r1: number, lonStart: number, lonEnd: number, asc: number): string {
  const span = norm(lonEnd - lonStart);
  const large = span > 180 ? 1 : 0;
  const [x1, y1] = toXY(lonStart, r1, asc);
  const [x2, y2] = toXY(lonEnd, r1, asc);
  const [x3, y3] = toXY(lonEnd, r0, asc);
  const [x4, y4] = toXY(lonStart, r0, asc);
  return `M${x1},${y1} A${r1},${r1} 0 ${large} 0 ${x2},${y2} L${x3},${y3} A${r0},${r0} 0 ${large} 1 ${x4},${y4} Z`;
}

/** 원 위의 점들을 minGap 이상 벌린다. 이웃끼리 겹친 만큼 반씩 밀어내기를 반복한다. */
export function spread(lons: number[], minGap: number): number[] {
  const order = lons.map((lon, i) => ({ i, lon })).sort((a, b) => a.lon - b.lon);
  const pos = order.map((o) => o.lon);
  const n = pos.length;
  if (n < 2) return [...lons];
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let k = 0; k < n; k++) {
      const j = (k + 1) % n;
      const gap = j === 0 ? pos[0] + 360 - pos[k] : pos[j] - pos[k];
      if (gap < minGap) {
        const push = (minGap - gap) / 2 + 1e-6;
        pos[k] -= push;
        pos[j] += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Array<number>(n);
  order.forEach((o, k) => { out[o.i] = Math.abs(signedDiff(pos[k], o.lon)) < 1e-9 ? o.lon : norm(pos[k]); });
  return out;
}
