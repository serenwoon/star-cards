import { describe, it, expect, afterEach, vi } from 'vitest';
import { fileName, canShareFiles } from '../src/share/exportCard';

afterEach(() => vi.unstubAllGlobals());

describe('fileName', () => {
  it('번호와 제목', () => {
    expect(fileName(0, '나의 빅쓰리')).toBe('star-cards-1-나의-빅쓰리.png');
    expect(fileName(5, '출생 차트')).toBe('star-cards-6-출생-차트.png');
  });
});

describe('canShareFiles', () => {
  it('navigator.canShare가 없으면 false', () => {
    vi.stubGlobal('navigator', {});
    expect(canShareFiles()).toBe(false);
  });
  it('파일 공유를 지원하면 true', () => {
    vi.stubGlobal('navigator', { share: () => Promise.resolve(), canShare: () => true });
    vi.stubGlobal('File', class { constructor(public parts: unknown[], public name: string) {} });
    expect(canShareFiles()).toBe(true);
  });
  it('canShare가 던지면 false', () => {
    vi.stubGlobal('navigator', { share: () => Promise.resolve(), canShare: () => { throw new Error(); } });
    expect(canShareFiles()).toBe(false);
  });
});
