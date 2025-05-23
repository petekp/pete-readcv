'use client';

import { useCallback } from 'react';
import { useWindowManager } from '../../core/window-manager/window-manager-context';
import { WindowBounds, WindowConstraints } from '../../core/types/window.types';

export interface UseWindowOptions {
  appId: string;
  initialBounds?: Partial<WindowBounds>;
  constraints?: WindowConstraints;
  metadata?: Record<string, unknown>;
}

export const useWindow = () => {
  const { windowManager } = useWindowManager();

  const createWindow = useCallback((options: UseWindowOptions) => {
    const windowId = `${options.appId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return windowManager.createWindow(
      windowId,
      options.appId,
      options.initialBounds,
      options.constraints,
      options.metadata
    );
  }, [windowManager]);

  const closeWindow = useCallback((windowId: string) => {
    windowManager.destroyWindow(windowId);
  }, [windowManager]);

  const minimizeWindow = useCallback((windowId: string) => {
    windowManager.minimizeWindow(windowId);
  }, [windowManager]);

  const maximizeWindow = useCallback((windowId: string) => {
    windowManager.maximizeWindow(windowId);
  }, [windowManager]);

  const restoreWindow = useCallback((windowId: string) => {
    windowManager.restoreWindow(windowId);
  }, [windowManager]);

  const focusWindow = useCallback((windowId: string) => {
    windowManager.focusWindow(windowId);
  }, [windowManager]);

  const moveWindow = useCallback((windowId: string, x: number, y: number) => {
    windowManager.moveWindow(windowId, { x, y });
  }, [windowManager]);

  const resizeWindow = useCallback((windowId: string, width: number, height: number) => {
    windowManager.resizeWindow(windowId, { width, height });
  }, [windowManager]);

  return {
    createWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    moveWindow,
    resizeWindow
  };
}; 