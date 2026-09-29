// Reference values from Swiss Ephemeris (swisseph-wasm, Moshier, mean node, Placidus),
// computed outside the repo; Sun/Moon/Mars of seoul-1990 cross-checked with JPL Horizons
// within 0.0003°; tolerance 1°.

import { describe, it, expect } from 'vitest';
import refs from './fixtures/reference-charts.json';
import { computeChart } from '../src/astro/chart';
import { signedDiff } from '../src/astro/angles';

type Ref = {
  label: string;
  date: string;
  time: string;
  lat: number;
  lon: number;
  tz: string;
  expected: Record<string, number | number[]>;
};

describe.each(refs as Ref[])('$label', (ref) => {
  const c = computeChart({
    date: ref.date,
    time: ref.time,
    lat: ref.lat,
    lon: ref.lon,
    tz: ref.tz,
    system: 'placidus'
  });
  const actual: Record<string, number> = Object.fromEntries(
    c.bodies.map((b) => [b.id, b.lon])
  );
  actual.asc = c.houses!.asc;
  actual.mc = c.houses!.mc;

  for (const [key, want] of Object.entries(ref.expected)) {
    if (key === 'cusps') {
      it('하우스 커스프 12개가 1° 안', () => {
        (want as number[]).forEach((w, i) => {
          expect(Math.abs(signedDiff(c.houses!.cusps[i], w))).toBeLessThan(1);
        });
      });
    } else {
      it(`${key}가 1° 안`, () => {
        expect(Math.abs(signedDiff(actual[key], want as number))).toBeLessThan(1);
      });
    }
  }
});
