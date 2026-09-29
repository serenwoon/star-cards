const DAY = 86_400_000;
const cache = new Map<string, Intl.DateTimeFormat>();

function formatter(tz: string): Intl.DateTimeFormat {
  let f = cache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    cache.set(tz, f);
  }
  return f;
}

/** 순간 ms에서 tz의 UTC 오프셋(분). 서울 2000년이면 540. */
export function offsetMinutes(ms: number, tz: string): number {
  const parts = formatter(tz).formatToParts(new Date(ms));
  const get = (t: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === t)!.value);
  const wall = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((wall - Math.floor(ms / 1000) * 1000) / 60000);
}

export type UtcResult = { utc: Date; status: 'ok' | 'gap' | 'overlap' };

/** 현지 벽시계 시각을 UTC로. 겹치면 앞선 순간, 없으면 전환 전 오프셋으로 해석한다. */
export function toUtc(date: string, time: string, tz: string): UtcResult {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const before = offsetMinutes(wall - DAY, tz);
  const offsets = new Set([before, offsetMinutes(wall, tz), offsetMinutes(wall + DAY, tz)]);
  const valid = [...offsets]
    .map((o) => wall - o * 60000)
    .filter((u) => offsetMinutes(u, tz) * 60000 === wall - u)
    .sort((a, b) => a - b);
  if (valid.length === 0) return { utc: new Date(wall - before * 60000), status: 'gap' };
  return { utc: new Date(valid[0]), status: valid.length > 1 ? 'overlap' : 'ok' };
}
