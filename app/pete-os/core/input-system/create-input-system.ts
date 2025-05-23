import { 
  InputSystemAPI,
  InputSystemState,
  InputEvent,
  InputEventType,
  InputContext,
  InputSystemEvent,
  InputSystemEventHandler,
  GestureDefinition,
  GestureEvent,
  GestureRecognizer,
  InputModifiers,
  InputPosition
} from '../types/input.types';

export type { InputSystemAPI };

import { createKeyboardShortcutRegistry } from './keyboard-shortcut-registry';
import { createInteractionRegistry } from './interaction-registry';
import { 
  createTapGestureRecognizer,
  createDragGestureRecognizer,
  createSwipeGestureRecognizer,
  createLongPressGestureRecognizer
} from './gesture-recognizers';

export function createInputSystem(): InputSystemAPI {
  // Private state
  let state: InputSystemState = {
    enabled: true,
    currentContext: { interactionMode: 'system' },
    recentEvents: [],
    activeGestures: new Map(),
    eventHistory: []
  };

  const eventHandlers = new Set<InputSystemEventHandler>();
  const shortcutRegistry = createKeyboardShortcutRegistry();
  const interactionRegistry = createInteractionRegistry();
  const gestureDefinitions = new Map<string, GestureDefinition>();
  
  // Initialize default gesture recognizers
  const defaultGestureRecognizers = new Map<string, GestureRecognizer>([
    ['tap', createTapGestureRecognizer()],
    ['drag', createDragGestureRecognizer()],
    ['swipe', createSwipeGestureRecognizer()],
    ['long-press', createLongPressGestureRecognizer()]
  ]);

  // Private helpers
  const emit = (event: InputSystemEvent): void => {
    eventHandlers.forEach(handler => handler(event));
  };

  const generateEventId = (): string => {
    return `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getModifiersFromNativeEvent = (nativeEvent: Event): InputModifiers => {
    const keyEvent = nativeEvent as KeyboardEvent;
    const mouseEvent = nativeEvent as MouseEvent;
    
    return {
      ctrl: keyEvent.ctrlKey || mouseEvent.ctrlKey || false,
      alt: keyEvent.altKey || mouseEvent.altKey || false,
      shift: keyEvent.shiftKey || mouseEvent.shiftKey || false,
      meta: keyEvent.metaKey || mouseEvent.metaKey || false
    };
  };

  const getPositionFromNativeEvent = (nativeEvent: Event): InputPosition | undefined => {
    const mouseEvent = nativeEvent as MouseEvent;
    const touchEvent = nativeEvent as TouchEvent;
    
    if (mouseEvent.clientX !== undefined && mouseEvent.clientY !== undefined) {
      return { x: mouseEvent.clientX, y: mouseEvent.clientY };
    }
    
    if (touchEvent.touches && touchEvent.touches.length > 0) {
      const touch = touchEvent.touches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    
    return undefined;
  };

  const getTargetFromNativeEvent = (nativeEvent: Event): string | undefined => {
    const target = nativeEvent.target as HTMLElement;
    if (!target) return undefined;
    
    // Look for window ID in data attributes
    const windowElement = target.closest('[data-window-id]');
    if (windowElement) {
      return windowElement.getAttribute('data-window-id') || undefined;
    }
    
    // Fall back to element ID
    return target.id || undefined;
  };

  const addToHistory = (event: InputEvent): void => {
    state.eventHistory.push(event);
    state.recentEvents.push(event);
    
    // Keep only recent events (last 10)
    if (state.recentEvents.length > 10) {
      state.recentEvents.shift();
    }
    
    // Keep history limited (last 100)
    if (state.eventHistory.length > 100) {
      state.eventHistory.shift();
    }
  };

  const recognizeGestures = (events: InputEvent[]): GestureEvent[] => {
    const recognizedGestures: GestureEvent[] = [];
    
    // Try default recognizers
    for (const [type, recognizer] of defaultGestureRecognizers) {
      const gesture = recognizer.recognize(events);
      if (gesture) {
        recognizedGestures.push(gesture);
      }
    }
    
    // Try custom gesture definitions
    for (const [id, definition] of gestureDefinitions) {
      if (!definition.enabled) continue;
      
      const gesture = definition.recognizer.recognize(events);
      if (gesture) {
        recognizedGestures.push(gesture);
        
        // Execute gesture handler
        try {
          const result = definition.handler(gesture);
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`Error executing gesture handler "${id}":`, error);
            });
          }
        } catch (error) {
          console.error(`Error executing gesture handler "${id}":`, error);
        }
      }
    }
    
    return recognizedGestures;
  };

  // Public API
  return {
    subscribe(handler: InputSystemEventHandler): () => void {
      eventHandlers.add(handler);
      return () => eventHandlers.delete(handler);
    },

    async processEvent(event: InputEvent): Promise<boolean> {
      if (!state.enabled) return false;
      
      // Add to history
      addToHistory(event);
      
      // Emit input received event
      emit({ type: 'input.received', event });
      
      let handled = false;
      
      // Try keyboard shortcuts first (highest priority)
      if (event.type.startsWith('key.')) {
        const shortcutHandled = shortcutRegistry.handleKeyEvent(event);
        if (shortcutHandled) {
          handled = true;
        }
      }
      
      // Try gesture recognition
      const gestures = recognizeGestures(state.recentEvents);
      for (const gesture of gestures) {
        emit({ type: 'gesture.recognized', gesture });
      }
      
      // Try interaction handlers if not already handled
      if (!handled) {
        handled = await interactionRegistry.handleEvent(event);
      }
      
      return handled;
    },

    setContext(context: InputContext): void {
      const previousContext = state.currentContext;
      state.currentContext = { ...context };
      emit({ 
        type: 'context.changed', 
        from: previousContext, 
        to: state.currentContext 
      });
    },

    getContext(): InputContext {
      return { ...state.currentContext };
    },

    getShortcutRegistry() {
      return shortcutRegistry;
    },

    getInteractionRegistry() {
      return interactionRegistry;
    },

    registerGesture(gesture: GestureDefinition): () => void {
      gestureDefinitions.set(gesture.id, { ...gesture, enabled: gesture.enabled ?? true });
      
      return () => {
        gestureDefinitions.delete(gesture.id);
      };
    },

    recognizeGestures(events: InputEvent[]): GestureEvent[] {
      return recognizeGestures(events);
    },

    createInputEvent(
      type: InputEventType, 
      nativeEvent: Event, 
      context?: InputContext
    ): InputEvent {
      return {
        id: generateEventId(),
        type,
        timestamp: Date.now(),
        position: getPositionFromNativeEvent(nativeEvent),
        target: getTargetFromNativeEvent(nativeEvent),
        context: context || state.currentContext,
        modifiers: getModifiersFromNativeEvent(nativeEvent),
        data: {
          key: (nativeEvent as KeyboardEvent).key,
          code: (nativeEvent as KeyboardEvent).code,
          button: (nativeEvent as MouseEvent).button,
          buttons: (nativeEvent as MouseEvent).buttons,
          deltaX: (nativeEvent as WheelEvent).deltaX,
          deltaY: (nativeEvent as WheelEvent).deltaY,
          deltaZ: (nativeEvent as WheelEvent).deltaZ
        }
      };
    },

    isEnabled(): boolean {
      return state.enabled;
    },

    enable(): void {
      state.enabled = true;
    },

    disable(): void {
      state.enabled = false;
    }
  };
}

// Singleton instance
let inputSystemInstance: InputSystemAPI | undefined;

export function getInputSystem(): InputSystemAPI {
  if (!inputSystemInstance) {
    inputSystemInstance = createInputSystem();
  }
  return inputSystemInstance;
} 