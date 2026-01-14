/**
 * Centralized Color System
 * 
 * This file contains all color definitions for the application.
 * To add a new color:
 * 1. Add the hex value to COLOR_DEFINITIONS
 * 2. The variant name will automatically be available in all components
 * 3. Colors will automatically be available in all components
 */

// Color definitions with hex values and metadata
export const COLOR_DEFINITIONS = {
  purple: {
    hex: '#A78BFA',
    hover: '#8B5CF6',
    name: 'purple',
  },
  pink: {
    hex: '#F0A4D0',
    hover: '#E879F9',
    name: 'pink',
  },
  blue: {
    hex: '#93C5FD',
    hover: '#60A5FA',
    name: 'blue',
  },
  green: {
    hex: '#86EFAC',
    hover: '#4ADE80',
    name: 'green',
  },
  yellow: {
    hex: '#FDE68A',
    hover: '#FCD34D',
    name: 'yellow',
  },
  orange: {
    hex: '#FDBA74',
    hover: '#FB923C',
    name: 'orange',
  },
  red: {
    hex: '#FCA5A5',
    hover: '#F87171',
    name: 'red',
  },
  cyan: {
    hex: '#67E8F9',
    hover: '#22D3EE',
    name: 'cyan',
  },
  // New muted colors
  lavender: {
    hex: '#C4B5FD',
    hover: '#A78BFA',
    name: 'lavender',
  },
  rose: {
    hex: '#F9A8D4',
    hover: '#F472B6',
    name: 'rose',
  },
  sky: {
    hex: '#BAE6FD',
    hover: '#7DD3FC',
    name: 'sky',
  },
  mint: {
    hex: '#A7F3D0',
    hover: '#6EE7B7',
    name: 'mint',
  },
  peach: {
    hex: '#FED7AA',
    hover: '#FDBA74',
    name: 'peach',
  },
  coral: {
    hex: '#FECACA',
    hover: '#FCA5A5',
    name: 'coral',
  },
  teal: {
    hex: '#99F6E4',
    hover: '#5EEAD4',
    name: 'teal',
  },
  lilac: {
    hex: '#E9D5FF',
    hover: '#DDD6FE',
    name: 'lilac',
  },
  sage: {
    hex: '#B8E6B8',
    hover: '#9AE6B4',
    name: 'sage',
  },
  cream: {
    hex: '#FEF3C7',
    hover: '#FDE68A',
    name: 'cream',
  },
} as const;

// Type-safe color variant type
export type ColorVariant = keyof typeof COLOR_DEFINITIONS;

// Array of all color hex values (for randomization functions)
export const ALL_COLORS = Object.values(COLOR_DEFINITIONS).map(c => c.hex) as readonly string[];

// Array of all variant names
export const ALL_VARIANTS = Object.keys(COLOR_DEFINITIONS) as ColorVariant[];

/**
 * Get color hex value by variant name
 */
export function getColorHex(variant: ColorVariant | string | undefined): string {
  if (!variant || !COLOR_DEFINITIONS[variant as ColorVariant]) {
    // Default to purple if variant is invalid or undefined
    return COLOR_DEFINITIONS.purple.hex;
  }
  return COLOR_DEFINITIONS[variant as ColorVariant].hex;
}

/**
 * Get hover color hex value by variant name
 */
export function getColorHover(variant: ColorVariant | string | undefined): string {
  if (!variant || !COLOR_DEFINITIONS[variant as ColorVariant]) {
    // Default to purple if variant is invalid or undefined
    return COLOR_DEFINITIONS.purple.hover;
  }
  return COLOR_DEFINITIONS[variant as ColorVariant].hover;
}

/**
 * Convert hex color to variant name
 */
export function hexToVariant(hex: string): ColorVariant | null {
  const entry = Object.entries(COLOR_DEFINITIONS).find(
    ([_, def]) => def.hex.toLowerCase() === hex.toLowerCase()
  );
  return entry ? (entry[0] as ColorVariant) : null;
}

/**
 * Get Tailwind background class for a variant
 */
export function getBgClass(variant: ColorVariant): string {
  return `bg-[${COLOR_DEFINITIONS[variant].hex}]`;
}

/**
 * Get Tailwind hover background class for a variant
 */
export function getHoverBgClass(variant: ColorVariant): string {
  return `hover:bg-[${COLOR_DEFINITIONS[variant].hover}]`;
}

/**
 * Get complete Tailwind classes for Card component
 */
export function getCardClasses(variant: ColorVariant): string {
  return `bg-[${COLOR_DEFINITIONS[variant].hex}] border-4 border-[#1F2937] text-[#1F2937]`;
}

/**
 * Get complete Tailwind classes for Button component
 */
export function getButtonClasses(variant: ColorVariant): string {
  const color = COLOR_DEFINITIONS[variant];
  return `bg-[${color.hex}] text-[#1F2937] hover:bg-[${color.hover}] colorblock-shadow hover:shadow-lg`;
}

/**
 * Get complete Tailwind classes for Modal component
 */
export function getModalClasses(variant: ColorVariant): string {
  return `bg-[${COLOR_DEFINITIONS[variant].hex}] text-[#1F2937]`;
}
  
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

/**
 * Convert array of hex colors to variant names
 */
export function hexColorsToVariants(hexColors: string[]): ColorVariant[] {
  return hexColors
    .map(hex => hexToVariant(hex))
    .filter((v): v is ColorVariant => v !== null);
}
