import raw from '../data/cities.json';

export type City = { id: string; ko: string; en: string; cc: string; lat: number; lon: number; tz: string; pop: number };
export const CITIES = raw as City[];
const BY_ID = new Map(CITIES.map((c) => [c.id, c]));

export function cityById(id: string): City | null {
  return BY_ID.get(id) ?? null;
}

export function searchCities(q: string, limit = 8): City[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const score = (c: City) => (c.ko.startsWith(s) || c.en.toLowerCase().startsWith(s) ? 0 : 1);
  return CITIES.filter((c) => c.ko.includes(s) || c.en.toLowerCase().includes(s))
    .sort((a, b) => score(a) - score(b) || b.pop - a.pop)
    .slice(0, limit);
}
