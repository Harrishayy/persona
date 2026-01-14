export const ALL_COLORS = [
    '#A78BFA', // purple
    '#F0A4D0', // pink
    '#93C5FD', // blue
    '#86EFAC', // green
    '#FDE68A', // yellow
    '#FDBA74', // orange
    '#67E8F9', // cyan
    '#FCA5A5', // red
  ] as const;
  
  /**
   * Shuffles an array using Fisher-Yates algorithm
   */
  function shuffleArray<T>(array: readonly T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Generates a randomized array of colors
   */
  export function getRandomizedColors(count?: number): string[] {
    const shuffled = shuffleArray(ALL_COLORS);
    return count ? shuffled.slice(0, count) : shuffled;
  }
  
  /**
   * Gets unique colors ensuring no duplicates
   */
  export function getUniqueColors(count: number, exclude: string[] = []): string[] {
    const available = ALL_COLORS.filter(color => !exclude.includes(color));
    const shuffled = shuffleArray(available);
    return shuffled.slice(0, Math.min(count, available.length));
  }

  /**
   * Simple hash function to convert string to number
   */
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Deterministically shuffles an array using a seed
   */
  function seededShuffle<T>(array: readonly T[], seed: number): T[] {
    const shuffled = [...array];
    // Use seed to create a pseudo-random number generator
    let currentSeed = seed;
    const seededRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generates a deterministic array of colors based on a seed string
   * This ensures the same text always gets the same colors (fixes hydration issues)
   */
  export function getDeterministicColors(seed: string, count?: number): string[] {
    const hash = hashString(seed);
    const shuffled = seededShuffle(ALL_COLORS, hash);
    return count ? shuffled.slice(0, count) : shuffled;
  }