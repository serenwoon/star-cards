import { describe, it, expect } from 'vitest';
import { eclipticLon, meanNode, bodyPositions, BODY_IDS } from '../src/astro/bodies';
import { signedDiff } from '../src/astro/angles';

const near = (a: number, b: number, tol: number) => expect(Math.abs(signedDiff(a, b))).toBeLessThan(tol);

describe('천체 위치', () => {
  it('2024 춘분에 태양은 0°', () => {
    near(eclipticLon('sun', new Date('2024-03-20T03:06Z')), 0, 0.05);
  });
  it('2024 하지에 태양은 90°', () => {
    near(eclipticLon('sun', new Date('2024-06-20T20:51Z')), 90, 0.05);
  });
  it('2024-04-08 개기일식 때 달과 태양이 겹친다', () => {
    const t = new Date('2024-04-08T18:18Z');
    near(eclipticLon('moon', t), eclipticLon('sun', t), 0.5);
  });
  it('J2000의 평균 노드 = 125.04°', () => {
    near(meanNode(new Date('2000-01-01T12:00Z')), 125.04, 0.05);
  });
  it('2024-04-10 수성은 역행, 2024-05-10은 순행', () => {
    const at = (iso: string) => bodyPositions(new Date(iso)).find((b) => b.id === 'mercury')!;
    expect(at('2024-04-10T00:00Z').retro).toBe(true);
    expect(at('2024-05-10T00:00Z').retro).toBe(false);
  });
  it('11개 천체를 순서대로 돌려준다', () => {
    const list = bodyPositions(new Date('2000-01-01T12:00Z'));
    expect(list.map((b) => b.id)).toEqual([...BODY_IDS]);
    expect(list.find((b) => b.id === 'node')!.retro).toBe(true);
    expect(list.find((b) => b.id === 'sun')!.retro).toBe(false);
  });
});
