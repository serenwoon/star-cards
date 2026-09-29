import type { Chart } from '../astro/chart';
import { pointLon, withoutAngles } from '../astro/chart';
import { ASPECT_ANGLE } from '../astro/aspects';
import { SIGN_IDS, ELEMENT } from '../astro/zodiac';
import { SIGNS } from '../content/signs';
import { PLANETS } from '../content/planets';
import { sectorPath, spread, toXY } from '../wheel/geometry';

const Z_OUT = 300;
const Z_IN = 255;
const R_BODY = 215;
const R_ASPECT = 165;

export function StaticWheel({ chart, size }: { chart: Chart; size: number }) {
  const asc = chart.houses?.asc ?? 0;
  const shown = spread(chart.bodies.map((b) => b.lon), 8);
  const lines = withoutAngles(chart.aspects);
  return (
    <svg className="static-wheel" viewBox="-320 -320 640 640" width={size} height={size} aria-hidden="true">
      {SIGN_IDS.map((id, i) => {
        const [x, y] = toXY(i * 30 + 15, (Z_IN + Z_OUT) / 2, asc);
        return (
          <g key={id} className={`zs ${ELEMENT[id]}`}>
            <path d={sectorPath(Z_IN, Z_OUT, i * 30, i * 30 + 30, asc)} />
            <text x={x} y={y}>{SIGNS[id].glyph}</text>
          </g>
        );
      })}
      <circle r={R_ASPECT} className="ring" />
      {chart.houses?.cusps.map((c, i) => {
        const [x0, y0] = toXY(c, R_ASPECT, asc);
        const [x1, y1] = toXY(c, Z_IN, asc);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} className="cusp" />;
      })}
      {lines.map((a, i) => {
        const [x0, y0] = toXY(pointLon(chart, a.a), R_ASPECT, asc);
        const [x1, y1] = toXY(pointLon(chart, a.b), R_ASPECT, asc);
        const ang = ASPECT_ANGLE[a.type];
        const cls = ang === 0 ? 'blend' : ang === 60 || ang === 120 ? 'soft' : 'hard';
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} className={`asp ${cls}`} />;
      })}
      {chart.bodies.map((b, i) => {
        const [x, y] = toXY(shown[i], R_BODY, asc);
        const [tx, ty] = toXY(b.lon, Z_IN, asc);
        return (
          <g key={b.id} className="pl">
            <line x1={tx} y1={ty} x2={x} y2={y} className="tick" />
            <circle cx={x} cy={y} r={15} />
            <text x={x} y={y}>{PLANETS[b.id].glyph}</text>
          </g>
        );
      })}
      {chart.houses && (() => {
        const [ax, ay] = toXY(chart.houses.asc, 306, asc);
        const [mx, my] = toXY(chart.houses.mc, 306, asc);
        return (
          <>
            <text x={ax} y={ay} className="axis">AC</text>
            <text x={mx} y={my} className="axis">MC</text>
          </>
        );
      })()}
    </svg>
  );
}
