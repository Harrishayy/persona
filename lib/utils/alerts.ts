/**
 * Modular alert utility functions
 * Provides a consistent interface for showing user notifications
 * Uses the toast system under the hood
 */

import { useToast } from '@/lib/hooks/useToast';

/**
 * Hook that provides alert methods
 * Use this in components to show alerts
 * 
 * @example
 * const alerts = useAlerts();
 * alerts.error('Something went wrong');
 * alerts.warning('Please check your input');
 * alerts.success('Saved successfully');
 */
export function useAlerts() {
  const { showToast } = useToast();

  return {
    /**
     * Show an error alert
     */
    error: (message: string) => showToast(message, 'error'),
    
    /**
     * Show a warning alert
     */
    warning: (message: string) => showToast(message, 'warning'),
    
    /**
     * Show a success alert
     */
    success: (message: string) => showToast(message, 'success'),
    
    /**
     * Show an info alert
     */
    info: (message: string) => showToast(message, 'info'),
    
    /**
     * Show a toast with custom type
     */
    show: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => 
      showToast(message, type),
  };
}
