// Main input system
export { createInputSystem, getInputSystem } from './create-input-system';
export type { InputSystemAPI } from './create-input-system';

// React integration
export { InputSystemProvider, useInputSystemContext } from './input-system-context';

// Component registries
export { createKeyboardShortcutRegistry, getKeyboardShortcutRegistry } from './keyboard-shortcut-registry';
export { createInteractionRegistry, getInteractionRegistry } from './interaction-registry';

// Gesture recognizers
export {
  createTapGestureRecognizer,
  createDragGestureRecognizer,
  createSwipeGestureRecognizer,
  createLongPressGestureRecognizer
} from './gesture-recognizers';

// Types (re-export from types)
export type {
  InputEvent,
  InputEventType,
  InputContext,
  InputPosition,
  InputModifiers,
  KeyboardShortcut,
  KeyboardShortcutRegistry,
  InteractionHandler,
  InteractionRegistry,
  GestureDefinition,
  GestureEvent,
  GestureType,
  GestureRecognizer,
  InputSystemEvent,
  InputSystemEventHandler,
  InputSystemState
} from '../types/input.types'; 