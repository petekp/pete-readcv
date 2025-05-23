export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowBounds {
  position: WindowPosition;
  size: WindowSize;
}

export interface WindowState {
  id: string;
  bounds: WindowBounds;
  zIndex: number;
  isFocused: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isVisible: boolean;
  appId: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface WindowConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  canResize?: boolean;
  canMove?: boolean;
  canMinimize?: boolean;
  canMaximize?: boolean;
  canClose?: boolean;
}

export interface WindowManagerState {
  windows: Map<string, WindowState>;
  windowOrder: string[]; // Array of window IDs in z-order (last = topmost)
  focusedWindowId: string | null;
  nextZIndex: number;
}

export type WindowEvent = 
  | { type: 'create'; windowId: string; initialState: Partial<WindowState> }
  | { type: 'destroy'; windowId: string }
  | { type: 'focus'; windowId: string }
  | { type: 'blur'; windowId: string }
  | { type: 'move'; windowId: string; position: WindowPosition }
  | { type: 'resize'; windowId: string; size: WindowSize }
  | { type: 'minimize'; windowId: string }
  | { type: 'restore'; windowId: string }
  | { type: 'maximize'; windowId: string }
  | { type: 'show'; windowId: string }
  | { type: 'hide'; windowId: string }
  | { type: 'updateMetadata'; windowId: string; metadata: Record<string, unknown> };

export interface WindowEventHandler {
  (event: WindowEvent): void;
}

export interface Viewport {
  width: number;
  height: number;
  safeArea?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
} 