import { 
  KeyboardShortcut, 
  KeyboardShortcutRegistry, 
  InputEvent, 
  InputContext,
  InputModifiers 
} from '../types/input.types';

export function createKeyboardShortcutRegistry(): KeyboardShortcutRegistry {
  // Private state
  const shortcuts = new Map<string, KeyboardShortcut>();
  
  // Private helpers
  const normalizeKeys = (keys: string[]): string[] => {
    return keys.map(key => key.toLowerCase()).sort();
  };

  const getModifiersFromEvent = (event: InputEvent): InputModifiers => {
    return event.modifiers || {
      ctrl: false,
      alt: false,
      shift: false,
      meta: false
    };
  };

  const keysMatch = (shortcutKeys: string[], eventKeys: string[]): boolean => {
    const normalizedShortcut = normalizeKeys(shortcutKeys);
    const normalizedEvent = normalizeKeys(eventKeys);
    
    if (normalizedShortcut.length !== normalizedEvent.length) {
      return false;
    }
    
    return normalizedShortcut.every(key => normalizedEvent.includes(key));
  };

  const buildEventKeys = (event: InputEvent): string[] => {
    const keys: string[] = [];
    const modifiers = getModifiersFromEvent(event);
    
    // Add modifier keys
    if (modifiers.ctrl) keys.push('ctrl');
    if (modifiers.alt) keys.push('alt');
    if (modifiers.shift) keys.push('shift');
    if (modifiers.meta) keys.push('meta');
    
    // Add the main key from event data
    if (event.data?.key) {
      keys.push(String(event.data.key).toLowerCase());
    }
    
    return keys;
  };

  const contextMatches = (shortcutContext?: InputContext, eventContext?: InputContext): boolean => {
    if (!shortcutContext) return true; // Global shortcut
    if (!eventContext) return false;
    
    // Check window context
    if (shortcutContext.windowId && shortcutContext.windowId !== eventContext.windowId) {
      return false;
    }
    
    // Check app context
    if (shortcutContext.appId && shortcutContext.appId !== eventContext.appId) {
      return false;
    }
    
    // Check interaction mode
    if (shortcutContext.interactionMode && shortcutContext.interactionMode !== eventContext.interactionMode) {
      return false;
    }
    
    return true;
  };

  // Public API
  return {
    register(shortcut: KeyboardShortcut): () => void {
      if (shortcuts.has(shortcut.id)) {
        console.warn(`Keyboard shortcut with id "${shortcut.id}" already exists. Overwriting.`);
      }
      
      shortcuts.set(shortcut.id, { ...shortcut, enabled: shortcut.enabled ?? true });
      
      return () => {
        shortcuts.delete(shortcut.id);
      };
    },

    unregister(id: string): void {
      shortcuts.delete(id);
    },

    getShortcuts(context?: InputContext): KeyboardShortcut[] {
      return Array.from(shortcuts.values()).filter(shortcut => {
        if (!shortcut.enabled) return false;
        return contextMatches(shortcut.context, context);
      });
    },

    handleKeyEvent(event: InputEvent): boolean {
      // Only handle keydown events for shortcuts (avoid duplicates from keyup/keypress)
      if (event.type !== 'key.down') {
        return false;
      }

      const eventKeys = buildEventKeys(event);
      if (eventKeys.length === 0) {
        return false;
      }

      // Find matching shortcuts
      const matchingShortcuts = Array.from(shortcuts.values()).filter(shortcut => {
        if (!shortcut.enabled) return false;
        if (!contextMatches(shortcut.context, event.context)) return false;
        return keysMatch(shortcut.keys, eventKeys);
      });

      // Sort by priority (context priority if available)
      matchingShortcuts.sort((a, b) => {
        const aPriority = a.context?.priority ?? 0;
        const bPriority = b.context?.priority ?? 0;
        return bPriority - aPriority; // Higher priority first
      });

      // Execute the highest priority matching shortcut
      if (matchingShortcuts.length > 0) {
        const shortcut = matchingShortcuts[0];
        try {
          const result = shortcut.handler(event);
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`Error executing keyboard shortcut "${shortcut.id}":`, error);
            });
          }
          return true;
        } catch (error) {
          console.error(`Error executing keyboard shortcut "${shortcut.id}":`, error);
          return false;
        }
      }

      return false;
    }
  };
}

// Singleton instance
let registryInstance: KeyboardShortcutRegistry | undefined;

export function getKeyboardShortcutRegistry(): KeyboardShortcutRegistry {
  if (!registryInstance) {
    registryInstance = createKeyboardShortcutRegistry();
  }
  return registryInstance;
} 