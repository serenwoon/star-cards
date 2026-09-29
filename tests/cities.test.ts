import { describe, it, expect } from 'vitest';
import { searchCities, cityById, CITIES } from '../src/lib/cities';

describe('도시', () => {
  it('서울을 한글로 찾는다', () => {
    const [first] = searchCities('서울');
    expect(first.cc).toBe('KR');
    expect(first.tz).toBe('Asia/Seoul');
  });
  it('영문 소문자로도 찾는다', () => {
    expect(searchCities('london')[0].cc).toBe('GB');
  });
  it('빈 검색어는 빈 목록', () => {
    expect(searchCities('  ')).toEqual([]);
  });
  it('id로 되찾는다', () => {
    expect(cityById(CITIES[0].id)).toEqual(CITIES[0]);
    expect(cityById('없음')).toBeNull();
  });
  it('표시 이름(ko)이 겹치지 않는다', () => {
    const names = CITIES.map((c) => c.ko);
    expect(names.length - new Set(names).size).toBe(0);
  });
  it('한국 도시는 모두 한글 이름이 있다', () => {
    for (const c of CITIES.filter((x) => x.cc === 'KR')) expect(c.ko, c.id).toMatch(/[가-힣]/);
  });
});
