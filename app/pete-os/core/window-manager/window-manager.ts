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

export class WindowManager {
  private state: WindowManagerState;
  private eventHandlers: Set<WindowEventHandler> = new Set();
  private windowConstraints: Map<string, WindowConstraints> = new Map();
  private viewport: Viewport = { width: 0, height: 0 };

  constructor() {
    this.state = {
      windows: new Map(),
      windowOrder: [],
      focusedWindowId: null,
      nextZIndex: 1
    };
  }

  // Event subscription
  subscribe(handler: WindowEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  private emit(event: WindowEvent): void {
    this.eventHandlers.forEach(handler => handler(event));
  }

  // Viewport management
  setViewport(viewport: Viewport): void {
    this.viewport = viewport;
  }

  getViewport(): Viewport {
    return this.viewport;
  }

  // Window lifecycle methods
  createWindow(
    id: string, 
    appId: string, 
    initialBounds?: Partial<WindowBounds>,
    constraints?: WindowConstraints,
    metadata?: Record<string, unknown>
  ): WindowState {
    if (this.state.windows.has(id)) {
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
      zIndex: this.state.nextZIndex++,
      isFocused: false,
      isMinimized: false,
      isMaximized: false,
      isVisible: true,
      metadata
    };

    this.state.windows.set(id, windowState);
    this.state.windowOrder.push(id);
    
    if (constraints) {
      this.windowConstraints.set(id, constraints);
    }

    this.emit({ type: 'create', windowId: id, initialState: windowState });
    
    // Auto-focus new window
    this.focusWindow(id);

    return windowState;
  }

  destroyWindow(id: string): void {
    const window = this.state.windows.get(id);
    if (!window) return;

    this.state.windows.delete(id);
    this.state.windowOrder = this.state.windowOrder.filter(wId => wId !== id);
    this.windowConstraints.delete(id);

    if (this.state.focusedWindowId === id) {
      // Focus the next topmost window
      const nextWindow = this.getTopmostWindow();
      if (nextWindow) {
        this.focusWindow(nextWindow.id);
      } else {
        this.state.focusedWindowId = null;
      }
    }

    this.emit({ type: 'destroy', windowId: id });
  }

  // Focus management
  focusWindow(id: string): void {
    const window = this.state.windows.get(id);
    if (!window || window.isMinimized) return;

    // Blur previously focused window
    if (this.state.focusedWindowId && this.state.focusedWindowId !== id) {
      const prevWindow = this.state.windows.get(this.state.focusedWindowId);
      if (prevWindow) {
        prevWindow.isFocused = false;
        this.emit({ type: 'blur', windowId: this.state.focusedWindowId });
      }
    }

    // Bring to front in z-order
    this.bringToFront(id);
    
    // Focus new window
    window.isFocused = true;
    this.state.focusedWindowId = id;
    this.emit({ type: 'focus', windowId: id });
  }

  // Z-order management
  private bringToFront(id: string): void {
    const window = this.state.windows.get(id);
    if (!window) return;

    // Remove from current position
    this.state.windowOrder = this.state.windowOrder.filter(wId => wId !== id);
    
    // Add to end (top)
    this.state.windowOrder.push(id);
    
    // Update z-indices
    this.updateZIndices();
  }

  private updateZIndices(): void {
    this.state.windowOrder.forEach((id, index) => {
      const window = this.state.windows.get(id);
      if (window) {
        window.zIndex = index + 1;
      }
    });
    this.state.nextZIndex = this.state.windowOrder.length + 1;
  }

  // Window state modifications
  moveWindow(id: string, position: WindowPosition): void {
    const window = this.state.windows.get(id);
    if (!window || window.isMaximized) return;

    const constraints = this.windowConstraints.get(id);
    if (constraints?.canMove === false) return;

    window.bounds.position = position;
    this.emit({ type: 'move', windowId: id, position });
  }

  resizeWindow(id: string, size: WindowSize): void {
    const window = this.state.windows.get(id);
    if (!window || window.isMaximized) return;

    const constraints = this.windowConstraints.get(id);
    if (constraints?.canResize === false) return;

    // Apply size constraints
    const constrainedSize = this.applyConstraints(size, constraints);
    
    window.bounds.size = constrainedSize;
    this.emit({ type: 'resize', windowId: id, size: constrainedSize });
  }

  private applyConstraints(size: WindowSize, constraints?: WindowConstraints): WindowSize {
    if (!constraints) return size;

    return {
      width: Math.max(
        constraints.minWidth || 0,
        Math.min(size.width, constraints.maxWidth || Infinity)
      ),
      height: Math.max(
        constraints.minHeight || 0,
        Math.min(size.height, constraints.maxHeight || Infinity)
      )
    };
  }

  minimizeWindow(id: string): void {
    const window = this.state.windows.get(id);
    if (!window) return;

    const constraints = this.windowConstraints.get(id);
    if (constraints?.canMinimize === false) return;

    window.isMinimized = true;
    window.isVisible = false;
    
    if (window.isFocused) {
      const nextWindow = this.getTopmostWindow();
      if (nextWindow) {
        this.focusWindow(nextWindow.id);
      }
    }

    this.emit({ type: 'minimize', windowId: id });
  }

  restoreWindow(id: string): void {
    const window = this.state.windows.get(id);
    if (!window) return;

    window.isMinimized = false;
    window.isMaximized = false;
    window.isVisible = true;

    this.focusWindow(id);
    this.emit({ type: 'restore', windowId: id });
  }

  maximizeWindow(id: string): void {
    const window = this.state.windows.get(id);
    if (!window) return;

    const constraints = this.windowConstraints.get(id);
    if (constraints?.canMaximize === false) return;

    window.isMaximized = true;
    window.isMinimized = false;
    
    this.focusWindow(id);
    this.emit({ type: 'maximize', windowId: id });
  }

  // Window queries
  getWindow(id: string): WindowState | undefined {
    return this.state.windows.get(id);
  }

  getAllWindows(): WindowState[] {
    return Array.from(this.state.windows.values());
  }

  getWindowsInZOrder(): WindowState[] {
    return this.state.windowOrder
      .map(id => this.state.windows.get(id))
      .filter((w): w is WindowState => !!w);
  }

  private getTopmostWindow(): WindowState | undefined {
    for (let i = this.state.windowOrder.length - 1; i >= 0; i--) {
      const window = this.state.windows.get(this.state.windowOrder[i]);
      if (window && !window.isMinimized && window.isVisible) {
        return window;
      }
    }
    return undefined;
  }

  getFocusedWindow(): WindowState | undefined {
    return this.state.focusedWindowId 
      ? this.state.windows.get(this.state.focusedWindowId)
      : undefined;
  }

  // Window visibility
  showWindow(id: string): void {
    const window = this.state.windows.get(id);
    if (!window) return;

    window.isVisible = true;
    this.emit({ type: 'show', windowId: id });
  }

  hideWindow(id: string): void {
    const window = this.state.windows.get(id);
    if (!window) return;

    window.isVisible = false;
    this.emit({ type: 'hide', windowId: id });
  }

  // Metadata management
  updateWindowMetadata(id: string, metadata: Record<string, unknown>): void {
    const window = this.state.windows.get(id);
    if (!window) return;

    window.metadata = { ...window.metadata, ...metadata };
    this.emit({ type: 'updateMetadata', windowId: id, metadata });
  }

  // State persistence
  getSerializedState(): string {
    const serializable = {
      windows: Array.from(this.state.windows.entries()),
      windowOrder: this.state.windowOrder,
      focusedWindowId: this.state.focusedWindowId,
      nextZIndex: this.state.nextZIndex
    };
    return JSON.stringify(serializable);
  }

  loadSerializedState(serializedState: string): void {
    try {
      const parsed = JSON.parse(serializedState);
      this.state = {
        windows: new Map(parsed.windows),
        windowOrder: parsed.windowOrder,
        focusedWindowId: parsed.focusedWindowId,
        nextZIndex: parsed.nextZIndex
      };
    } catch (error) {
      console.error('Failed to load window manager state:', error);
    }
  }
} 