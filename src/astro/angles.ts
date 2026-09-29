export const RAD = Math.PI / 180;
export const DEG = 180 / Math.PI;

export function norm(x: number): number {
  return ((x % 360) + 360) % 360;
}

export function signedDiff(a: number, b: number): number {
  const d = norm(a - b);
  return d > 180 ? d - 360 : d;
}
