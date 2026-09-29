import { getFontEmbedCSS, toBlob } from 'html-to-image';
import { CARD_H, CARD_W } from '../cards/CardFrame';

export function fileName(index: number, title: string): string {
  return `star-cards-${index + 1}-${title.trim().replace(/\s+/g, '-')}.png`;
}

export function canShareFiles(): boolean {
  try {
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (typeof nav.share !== 'function' || typeof nav.canShare !== 'function') return false;
    const probe = new File([''], 'probe.png', { type: 'image/png' });
    return nav.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

let fontCSS: Promise<string> | null = null;

/** 화면에서 축소돼 있어도 원래 크기(1080×1920)로 캡처한다. 축소 변환은 조상(.scaled-inner)에 있다. */
export async function cardToBlob(node: HTMLElement): Promise<Blob> {
  if (node.closest<HTMLElement>('.scaled-inner')?.style.visibility === 'hidden') {
    throw new Error('카드를 아직 준비하고 있어요');
  }
  await document.fonts.ready;
  if (!fontCSS) {
    fontCSS = getFontEmbedCSS(node);
    fontCSS.catch(() => { fontCSS = null; });
  }
  const blob = await toBlob(node, {
    width: CARD_W,
    height: CARD_H,
    pixelRatio: 1,
    fontEmbedCSS: await fontCSS,
    style: { transform: 'none', visibility: 'visible' },
  });
  if (!blob) throw new Error('이미지를 만들지 못했어요');
  return blob;
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareFiles(files: File[], title: string): Promise<void> {
  await navigator.share({ files, title });
}

export function isAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}
