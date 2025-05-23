import { 
  WindowState, 
  WindowManagerState, 
  WindowEvent, 
  WindowEventHandler,
  WindowPosition,
  WindowSize,
  WindowBounds,
  WindowConstraints,
  Viewport
} from '../types/window.types';

export const createWindowManager = () => {
  // Private state
  let state: WindowManagerState = {
    windows: new Map(),
    windowOrder: [],
    focusedWindowId: null,
    nextZIndex: 1
  };

  const eventHandlers = new Set<WindowEventHandler>();
  const windowConstraints = new Map<string, WindowConstraints>();
  let viewport: Viewport = { width: 0, height: 0 };

  // Private helpers
  const emit = (event: WindowEvent): void => {
    eventHandlers.forEach(handler => handler(event));
  };

  const updateZIndices = (): void => {
    state.windowOrder.forEach((id, index) => {
      const window = state.windows.get(id);
      if (window) {
        window.zIndex = index + 1;
      }
    });
    state.nextZIndex = state.windowOrder.length + 1;
  };

  const bringToFront = (id: string): void => {
    const window = state.windows.get(id);
    if (!window) return;

    state.windowOrder = state.windowOrder.filter(wId => wId !== id);
    state.windowOrder.push(id);
    updateZIndices();
  };

  const getTopmostWindow = (): WindowState | undefined => {
    for (let i = state.windowOrder.length - 1; i >= 0; i--) {
      const window = state.windows.get(state.windowOrder[i]);
      if (window && !window.isMinimized && window.isVisible) {
        return window;
      }
    }
    return undefined;
  };

  // Public API
  const api = {
    // Event subscription
    subscribe: (handler: WindowEventHandler): (() => void) => {
      eventHandlers.add(handler);
      return () => eventHandlers.delete(handler);
    },

    // Viewport management
    setViewport: (newViewport: Viewport): void => {
      viewport = newViewport;
    },

    getViewport: (): Viewport => viewport,

    // Window lifecycle
    createWindow: (
      id: string, 
      appId: string, 
      initialBounds?: Partial<WindowBounds>,
      constraints?: WindowConstraints,
      metadata?: Record<string, unknown>
    ): WindowState => {
      if (state.windows.has(id)) {
        throw new Error(`Window with id ${id} already exists`);
      }

      const defaultBounds: WindowBounds = {
        position: { x: 50, y: 50 },
        size: { width: 400, height: 300 }
      };

      const bounds = {
        position: initialBounds?.position || defaultBounds.position,
        size: initialBounds?.size || defaultBounds.size
      };

      const windowState: WindowState = {
        id,
        appId,
        bounds,
        zIndex: state.nextZIndex++,
        isFocused: false,
        isMinimized: false,
        isMaximized: false,
        isVisible: true,
        metadata
      };

      state.windows.set(id, windowState);
      state.windowOrder.push(id);
      
      if (constraints) {
        windowConstraints.set(id, constraints);
      }

      emit({ type: 'create', windowId: id, initialState: windowState });
      
      // Auto-focus new window
      setTimeout(() => api.focusWindow(id), 0);

      return windowState;
    },

    destroyWindow: (id: string): void => {
      const window = state.windows.get(id);
      if (!window) return;

      state.windows.delete(id);
      state.windowOrder = state.windowOrder.filter(wId => wId !== id);
      windowConstraints.delete(id);

      if (state.focusedWindowId === id) {
        const nextWindow = getTopmostWindow();
        if (nextWindow) {
          // Use setTimeout to avoid recursion issues
          setTimeout(() => api.focusWindow(nextWindow.id), 0);
        } else {
          state.focusedWindowId = null;
        }
      }

      emit({ type: 'destroy', windowId: id });
    },

    focusWindow: (id: string): void => {
      const window = state.windows.get(id);
      if (!window || window.isMinimized) return;

      if (state.focusedWindowId && state.focusedWindowId !== id) {
        const prevWindow = state.windows.get(state.focusedWindowId);
        if (prevWindow) {
          prevWindow.isFocused = false;
          emit({ type: 'blur', windowId: state.focusedWindowId });
        }
      }

      bringToFront(id);
      window.isFocused = true;
      state.focusedWindowId = id;
      emit({ type: 'focus', windowId: id });
    },

    minimizeWindow: (id: string): void => {
      const window = state.windows.get(id);
      if (!window || window.isMinimized) return;

      window.isMinimized = true;
      window.isFocused = false;
      
      if (state.focusedWindowId === id) {
        const nextWindow = getTopmostWindow();
        if (nextWindow) {
          api.focusWindow(nextWindow.id);
        } else {
          state.focusedWindowId = null;
        }
      }
      
      emit({ type: 'minimize', windowId: id });
    },

    maximizeWindow: (id: string): void => {
      const window = state.windows.get(id);
      if (!window || window.isMaximized) return;

      window.isMaximized = true;
      emit({ type: 'maximize', windowId: id });
    },

    restoreWindow: (id: string): void => {
      const window = state.windows.get(id);
      if (!window) return;

      if (window.isMinimized) {
        window.isMinimized = false;
        window.isVisible = true;
        api.focusWindow(id);
      } else if (window.isMaximized) {
        window.isMaximized = false;
      }
      
      emit({ type: 'restore', windowId: id });
    },

    moveWindow: (id: string, position: WindowPosition): void => {
      const window = state.windows.get(id);
      if (!window) return;

      const constraints = windowConstraints.get(id);
      if (constraints?.canMove === false) return;

      window.bounds.position = position;
      emit({ type: 'move', windowId: id, position });
    },

    resizeWindow: (id: string, size: WindowSize): void => {
      const window = state.windows.get(id);
      if (!window) return;

      const constraints = windowConstraints.get(id);
      if (constraints?.canResize === false) return;

      // Apply size constraints
      let { width, height } = size;
      if (constraints) {
        if (constraints.minWidth) width = Math.max(width, constraints.minWidth);
        if (constraints.maxWidth) width = Math.min(width, constraints.maxWidth);
        if (constraints.minHeight) height = Math.max(height, constraints.minHeight);
        if (constraints.maxHeight) height = Math.min(height, constraints.maxHeight);
      }

      window.bounds.size = { width, height };
      emit({ type: 'resize', windowId: id, size: { width, height } });
    },

    getAllWindows: (): WindowState[] => {
      return Array.from(state.windows.values());
    },

    getFocusedWindow: (): WindowState | undefined => {
      return state.focusedWindowId 
        ? state.windows.get(state.focusedWindowId)
        : undefined;
    },

    getSerializedState: (): string => {
      const serializable = {
        windows: Array.from(state.windows.entries()),
        windowOrder: state.windowOrder,
        focusedWindowId: state.focusedWindowId,
        nextZIndex: state.nextZIndex
      };
      return JSON.stringify(serializable);
    },

    loadSerializedState: (serializedState: string): void => {
      try {
        const parsed = JSON.parse(serializedState);
        state = {
          windows: new Map(parsed.windows),
          windowOrder: parsed.windowOrder,
          focusedWindowId: parsed.focusedWindowId,
          nextZIndex: parsed.nextZIndex
        };
      } catch (error) {
        console.error('Failed to load window manager state:', error);
      }
    }
  };

  return api;
};

export type WindowManagerAPI = ReturnType<typeof createWindowManager>; 