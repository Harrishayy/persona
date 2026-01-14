import { useState } from 'react';

interface UseColorblockRotationOptions {
  /**
   * Initial rotation angle in degrees (default: -3deg)
   */
  initialRotation?: number;
  /**
   * Hover rotation angle in degrees (default: 3deg)
   */
  hoverRotation?: number;
  /**
   * Whether to enable rotation (default: true)
   */
  enabled?: boolean;
}

/**
 * Hook for colorblock-style rotation effects
 * Returns transform string and state handlers
 */
export function useColorblockRotation(options: UseColorblockRotationOptions = {}) {
  const {
    initialRotation = -3,
    hoverRotation = 3,
    enabled = true,
  } = options;

  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getTransform = (): string => {
    if (!enabled) {
      return '';
    }

    if (isActive) {
      return `rotate(${hoverRotation}deg) translate(2px, 2px)`;
    } else if (isHovered) {
      return `rotate(${hoverRotation}deg) scale(1.1)`;
    }
    return `rotate(${initialRotation}deg)`;
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };
  const handleMouseDown = () => setIsActive(true);
  const handleMouseUp = () => setIsActive(false);

  return {
    transform: getTransform(),
    isHovered,
    isActive,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
  };
}
