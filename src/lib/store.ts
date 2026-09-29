export type BirthInput = { name: string; date: string; time: string | null; cityId: string };
const KEY = 'sc.last';

function valid(v: unknown): v is BirthInput {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.name === 'string' && typeof o.cityId === 'string'
    && typeof o.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.date)
    && (o.time === null || (typeof o.time === 'string' && /^\d{2}:\d{2}$/.test(o.time)));
}

export function loadLastInput(): BirthInput | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return valid(v) ? v : null;
  } catch {
    return null;
  }
}

export function saveLastInput(v: BirthInput): void {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* 저장이 막힌 브라우저 */ }
}

export function clearLastInput(): void {
  try { localStorage.removeItem(KEY); } catch { /* 위와 같음 */ }
}
