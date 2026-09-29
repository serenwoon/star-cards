import { norm } from './angles';

export const SIGN_IDS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;
export type SignId = (typeof SIGN_IDS)[number];
export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';

const ELEMENTS: Element[] = ['fire', 'earth', 'air', 'water'];
const MODALITIES: Modality[] = ['cardinal', 'fixed', 'mutable'];

export const ELEMENT = Object.fromEntries(
  SIGN_IDS.map((id, i) => [id, ELEMENTS[i % 4]]),
) as Record<SignId, Element>;
export const MODALITY = Object.fromEntries(
  SIGN_IDS.map((id, i) => [id, MODALITIES[i % 3]]),
) as Record<SignId, Modality>;

export function signOf(lon: number): SignId {
  return SIGN_IDS[Math.floor(norm(lon) / 30)];
}

export function degInSign(lon: number): number {
  return norm(lon) % 30;
}
