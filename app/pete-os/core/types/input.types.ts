// Input & Interaction System Types

export interface InputPosition {
  x: number;
  y: number;
}

export interface InputEvent {
  id: string;
  type: InputEventType;
  timestamp: number;
  position?: InputPosition;
  target?: string; // Element ID or window ID
  context?: InputContext;
  modifiers?: InputModifiers;
  data?: Record<string, unknown>;
}

export type InputEventType = 
  | 'mouse.down'
  | 'mouse.up'
  | 'mouse.move'
  | 'mouse.click'
  | 'mouse.doubleclick'
  | 'mouse.wheel'
  | 'key.down'
  | 'key.up'
  | 'key.press'
  | 'touch.start'
  | 'touch.move'
  | 'touch.end'
  | 'gesture.start'
  | 'gesture.update'
  | 'gesture.end';

export interface InputModifiers {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
}

export interface InputContext {
  windowId?: string;
  appId?: string;
  elementType?: string;
  interactionMode?: 'window' | 'app' | 'system';
  priority?: number;
}

// Keyboard Shortcuts
export interface KeyboardShortcut {
  id: string;
  keys: string[]; // e.g., ['ctrl', 'c'] or ['cmd', 'shift', 'n']
  description: string;
  context?: InputContext;
  handler: (event: InputEvent) => void | Promise<void>;
  enabled?: boolean;
}

export interface KeyboardShortcutRegistry {
  register(shortcut: KeyboardShortcut): () => void;
  unregister(id: string): void;
  getShortcuts(context?: InputContext): KeyboardShortcut[];
  handleKeyEvent(event: InputEvent): boolean; // Returns true if handled
}

// Gestures
export interface GestureDefinition {
  id: string;
  type: GestureType;
  description: string;
  recognizer: GestureRecognizer;
  context?: InputContext;
  handler: (event: GestureEvent) => void | Promise<void>;
  enabled?: boolean;
}

export type GestureType = 
  | 'swipe'
  | 'pinch'
  | 'rotate'
  | 'tap'
  | 'long-press'
  | 'drag'
  | 'custom';

export interface GestureEvent {
  id: string;
  type: GestureType;
  state: 'start' | 'update' | 'end' | 'cancel';
  timestamp: number;
  position: InputPosition;
  data: Record<string, unknown>;
  context?: InputContext;
}

export interface GestureRecognizer {
  recognize(events: InputEvent[]): GestureEvent | null;
  reset(): void;
}

// Interaction Handling
export interface InteractionHandler {
  id: string;
  priority: number;
  context: InputContext;
  canHandle(event: InputEvent): boolean;
  handle(event: InputEvent): boolean | Promise<boolean>; // Returns true if event was consumed
}

export interface InteractionRegistry {
  register(handler: InteractionHandler): () => void;
  unregister(id: string): void;
  getHandlers(context?: InputContext): InteractionHandler[];
  handleEvent(event: InputEvent): Promise<boolean>; // Returns true if handled
}

// Input System Events
export type InputSystemEvent = 
  | { type: 'input.received'; event: InputEvent }
  | { type: 'shortcut.triggered'; shortcut: KeyboardShortcut; event: InputEvent }
  | { type: 'gesture.recognized'; gesture: GestureEvent }
  | { type: 'interaction.handled'; handler: InteractionHandler; event: InputEvent }
  | { type: 'context.changed'; from?: InputContext; to: InputContext };

export interface InputSystemEventHandler {
  (event: InputSystemEvent): void;
}

// Main Input System Interface
export interface InputSystemAPI {
  // Event subscription
  subscribe(handler: InputSystemEventHandler): () => void;
  
  // Input event processing
  processEvent(event: InputEvent): Promise<boolean>;
  
  // Context management
  setContext(context: InputContext): void;
  getContext(): InputContext;
  
  // Component registries
  getShortcutRegistry(): KeyboardShortcutRegistry;
  getInteractionRegistry(): InteractionRegistry;
  
  // Gesture system
  registerGesture(gesture: GestureDefinition): () => void;
  recognizeGestures(events: InputEvent[]): GestureEvent[];
  
  // Utility methods
  createInputEvent(
    type: InputEventType, 
    nativeEvent: Event, 
    context?: InputContext
  ): InputEvent;
  
  // State
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
}

// Input System State
export interface InputSystemState {
  enabled: boolean;
  currentContext: InputContext;
  recentEvents: InputEvent[];
  activeGestures: Map<string, GestureEvent>;
  eventHistory: InputEvent[];
} 