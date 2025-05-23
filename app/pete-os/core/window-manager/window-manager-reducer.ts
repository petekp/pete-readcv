import { 
  WindowState, 
  WindowPosition,
  WindowSize,
  WindowBounds,
  WindowConstraints,
  Viewport
} from '../types/window.types';

// State shape
export interface WindowManagerState {
  windows: Map<string, WindowState>;
  windowOrder: string[];
  focusedWindowId: string | null;
  nextZIndex: number;
  constraints: Map<string, WindowConstraints>;
  viewport: Viewport;
}

// Action types
export type WindowManagerAction =
  | { type: 'CREATE_WINDOW'; payload: {
      id: string;
      appId: string;
      initialBounds?: Partial<WindowBounds>;
      constraints?: WindowConstraints;
      metadata?: Record<string, unknown>;
    }}
  | { type: 'DESTROY_WINDOW'; windowId: string }
  | { type: 'FOCUS_WINDOW'; windowId: string }
  | { type: 'MOVE_WINDOW'; windowId: string; position: WindowPosition }
  | { type: 'RESIZE_WINDOW'; windowId: string; size: WindowSize }
  | { type: 'MINIMIZE_WINDOW'; windowId: string }
  | { type: 'MAXIMIZE_WINDOW'; windowId: string }
  | { type: 'RESTORE_WINDOW'; windowId: string }
  | { type: 'SET_VIEWPORT'; viewport: Viewport }
  | { type: 'LOAD_STATE'; state: Partial<WindowManagerState> };

// Initial state
export const initialWindowManagerState: WindowManagerState = {
  windows: new Map(),
  windowOrder: [],
  focusedWindowId: null,
  nextZIndex: 1,
  constraints: new Map(),
  viewport: { width: 0, height: 0 }
};

// Helper functions
const bringToFront = (state: WindowManagerState, windowId: string): void => {
  const index = state.windowOrder.indexOf(windowId);
  if (index > -1) {
    state.windowOrder.splice(index, 1);
    state.windowOrder.push(windowId);
    
    // Update z-indices
    state.windowOrder.forEach((id, idx) => {
      const window = state.windows.get(id);
      if (window) {
        window.zIndex = idx + 1;
      }
    });
    state.nextZIndex = state.windowOrder.length + 1;
  }
};

const getTopmostVisibleWindow = (state: WindowManagerState): WindowState | undefined => {
  for (let i = state.windowOrder.length - 1; i >= 0; i--) {
    const window = state.windows.get(state.windowOrder[i]);
    if (window && !window.isMinimized && window.isVisible) {
      return window;
    }
  }
  return undefined;
};

// Main reducer
export const windowManagerReducer = (
  state: WindowManagerState,
  action: WindowManagerAction
): WindowManagerState => {
  switch (action.type) {
    case 'CREATE_WINDOW': {
      const { id, appId, initialBounds, constraints, metadata } = action.payload;
      
      if (state.windows.has(id)) {
        return state; // Window already exists
      }

      const defaultBounds: WindowBounds = {
        position: { x: 50, y: 50 },
        size: { width: 400, height: 300 }
      };

      const windowState: WindowState = {
        id,
        appId,
        bounds: {
          position: initialBounds?.position || defaultBounds.position,
          size: initialBounds?.size || defaultBounds.size
        },
        zIndex: state.nextZIndex,
        isFocused: false,
        isMinimized: false,
        isMaximized: false,
        isVisible: true,
        metadata
      };

      const newState = {
        ...state,
        windows: new Map(state.windows).set(id, windowState),
        windowOrder: [...state.windowOrder, id],
        nextZIndex: state.nextZIndex + 1
      };

      if (constraints) {
        newState.constraints = new Map(state.constraints).set(id, constraints);
      }

      // Auto-focus the new window
      return windowManagerReducer(newState, { type: 'FOCUS_WINDOW', windowId: id });
    }

    case 'DESTROY_WINDOW': {
      const { windowId } = action;
      const window = state.windows.get(windowId);
      if (!window) return state;

      const newWindows = new Map(state.windows);
      newWindows.delete(windowId);

      const newConstraints = new Map(state.constraints);
      newConstraints.delete(windowId);

      const newState = {
        ...state,
        windows: newWindows,
        windowOrder: state.windowOrder.filter(id => id !== windowId),
        constraints: newConstraints,
        focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId
      };

      // Focus next window if needed
      if (state.focusedWindowId === windowId) {
        const nextWindow = getTopmostVisibleWindow(newState);
        if (nextWindow) {
          return windowManagerReducer(newState, { type: 'FOCUS_WINDOW', windowId: nextWindow.id });
        }
      }

      return newState;
    }

    case 'FOCUS_WINDOW': {
      const { windowId } = action;
      const window = state.windows.get(windowId);
      if (!window || window.isMinimized) return state;

      const newState = { ...state };
      const newWindows = new Map(state.windows);

      // Blur previous window
      if (state.focusedWindowId && state.focusedWindowId !== windowId) {
        const prevWindow = newWindows.get(state.focusedWindowId);
        if (prevWindow) {
          newWindows.set(state.focusedWindowId, { ...prevWindow, isFocused: false });
        }
      }

      // Focus new window
      const targetWindow = newWindows.get(windowId);
      if (targetWindow) {
        newWindows.set(windowId, { ...targetWindow, isFocused: true });
      }

      newState.windows = newWindows;
      newState.focusedWindowId = windowId;
      
      // Bring to front
      bringToFront(newState, windowId);

      return newState;
    }

    case 'MOVE_WINDOW': {
      const { windowId, position } = action;
      const window = state.windows.get(windowId);
      if (!window || window.isMaximized) return state;

      const constraints = state.constraints.get(windowId);
      if (constraints?.canMove === false) return state;

      const newWindows = new Map(state.windows);
      newWindows.set(windowId, {
        ...window,
        bounds: { ...window.bounds, position }
      });

      return { ...state, windows: newWindows };
    }

    case 'SET_VIEWPORT': {
      return { ...state, viewport: action.viewport };
    }

    case 'LOAD_STATE': {
      return { ...state, ...action.state };
    }

    // Add other cases as needed...

    default:
      return state;
  }
}; 