/**
 * Utility functions for assigning emojis to answer options
 * Emojis are assigned deterministically based on option order
 */

const EMOJI_LIST = ['🎯', '⭐', '🔥', '💎', '🚀', '🎨', '🌟', '🎪', '🎭', '🎲', '🎸', '🎬', '🎮', '🎲', '🎤'];

/**
 * Get emoji for an option at the given index
 * @param index - The zero-based index of the option
 * @returns The emoji string for that option
 */
export function getEmojiForOption(index: number): string {
  return EMOJI_LIST[index % EMOJI_LIST.length];
}

/**
 * Get all emojis for a set of options
 * @param count - Number of options
 * @returns Array of emoji strings
 */
export function getEmojisForOptions(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getEmojiForOption(i));
}
