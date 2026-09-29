/**
 * 마지막 글자 받침에 맞춰 조사를 고른다. 한글이 아니면 「이(가)」꼴.
 * 끝에 붙은 괄호 부분(「상승궁(ASC)」)과 닫는 따옴표·공백은 떼고 판정한다.
 */
export function josa(word: string, withFinal: string, withoutFinal: string): string {
  const core = word.trim().replace(/\([^)]*\)$/, '').replace(/[」』"'\s]+$/, '');
  const last = core.slice(-1);
  const code = last.charCodeAt(0) - 0xac00;
  if (!last || code < 0 || code > 11171) return `${withFinal}(${withoutFinal})`;
  return code % 28 === 0 ? withoutFinal : withFinal;
}
