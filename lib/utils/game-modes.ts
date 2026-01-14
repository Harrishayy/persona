/**
 * Game mode definitions and metadata
 */

export type GameMode = 'standard' | 'quiplash' | 'fibbage' | 'rate_favourite_drawings' | 'custom';

export interface GameModeMetadata {
  id: GameMode;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Color variant from color system
}

export const GAME_MODES: Record<GameMode, GameModeMetadata> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Traditional quiz format with multiple choice questions',
    icon: 'Gamepad2',
    color: 'purple',
  },
  quiplash: {
    id: 'quiplash',
    name: 'Quiplash',
    description: 'Players submit funny answers to prompts',
    icon: 'Laugh',
    color: 'yellow',
  },
  fibbage: {
    id: 'fibbage',
    name: 'Fibbage',
    description: 'Players guess which answer is true among lies',
    icon: 'Lies',
    color: 'orange',
  },
  rate_favourite_drawings: {
    id: 'rate_favourite_drawings',
    name: 'Rate Favourite Drawings',
    description: 'Players rate and vote on drawings',
    icon: 'Palette',
    color: 'pink',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    description: 'Create your own custom game mode',
    icon: 'Settings',
    color: 'blue',
  },
};

export const GAME_MODE_LIST = Object.values(GAME_MODES);
