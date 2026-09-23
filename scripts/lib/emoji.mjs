/**
 * 이모지 판정 공용 모듈.
 *
 * 저장소 규칙은 "장식용 이모지 금지" 입니다. 저작권 기호(U+00A9)나 등록 상표(U+00AE)
 * 같은 조판 기호는 허용해야 하므로, 기본 이모지 표시 속성이 있는 문자만 이모지로
 * 봅니다.
 *
 * - \p{Emoji_Presentation} : 기본이 이모지 표시인 문자(예: U+1F41B)
 * - U+FE0F                 : 텍스트 표시 문자를 이모지로 바꾸는 변이 선택자
 *                            (예: U+26A0 U+FE0F)
 */

const EMOJI_PRESENTATION = /\p{Emoji_Presentation}/u;
const VARIATION_SELECTOR_16 = '\uFE0F';

export function findEmoji(text) {
  if (EMOJI_PRESENTATION.test(text) || text.includes(VARIATION_SELECTOR_16)) {
    return text.match(/\p{Emoji_Presentation}|\uFE0F/u)?.[0] ?? 'emoji';
  }
  return null;
}

export function hasEmoji(text) {
  return findEmoji(text) !== null;
}
