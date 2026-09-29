import { describe, it, expect, beforeEach } from 'vitest';
import { loadLastInput, saveLastInput, clearLastInput } from '../src/lib/store';

class Mem { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } }

describe('store', () => {
  beforeEach(() => { (globalThis as any).localStorage = new Mem(); });
  const v = { name: '나', date: '1990-05-15', time: '14:30', cityId: '1835848' };
  it('저장·되읽기·지우기', () => {
    saveLastInput(v);
    expect(loadLastInput()).toEqual(v);
    clearLastInput();
    expect(loadLastInput()).toBeNull();
  });
  it('모양이 틀리면 null', () => {
    localStorage.setItem('sc.last', JSON.stringify({ date: '1990/05/15' }));
    expect(loadLastInput()).toBeNull();
    localStorage.setItem('sc.last', '{');
    expect(loadLastInput()).toBeNull();
  });
  it('시각 null 허용', () => {
    saveLastInput({ ...v, time: null });
    expect(loadLastInput()?.time).toBeNull();
  });
  it('저장소가 막혀도 던지지 않는다', () => {
    (globalThis as any).localStorage = { getItem() { throw new Error(); }, setItem() { throw new Error(); }, removeItem() { throw new Error(); } };
    expect(loadLastInput()).toBeNull();
    expect(() => saveLastInput(v)).not.toThrow();
    expect(() => clearLastInput()).not.toThrow();
  });
});
