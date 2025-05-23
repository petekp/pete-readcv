import { useCallback } from 'react';
import { useInputSystemContext } from '../../core/input-system/input-system-context';
import { 
  KeyboardShortcut, 
  InteractionHandler, 
  GestureDefinition,
  InputContext 
} from '../../core/types/input.types';

export function useInput() {
  const { inputSystem } = useInputSystemContext();

  // Keyboard shortcuts
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    return inputSystem.getShortcutRegistry().register(shortcut);
  }, [inputSystem]);

  const unregisterShortcut = useCallback((id: string) => {
    inputSystem.getShortcutRegistry().unregister(id);
  }, [inputSystem]);

  // Interaction handlers
  const registerInteractionHandler = useCallback((handler: InteractionHandler) => {
    return inputSystem.getInteractionRegistry().register(handler);
  }, [inputSystem]);

  const unregisterInteractionHandler = useCallback((id: string) => {
    inputSystem.getInteractionRegistry().unregister(id);
  }, [inputSystem]);

  // Gestures
  const registerGesture = useCallback((gesture: GestureDefinition) => {
    return inputSystem.registerGesture(gesture);
  }, [inputSystem]);

  // Context management
  const setInputContext = useCallback((context: InputContext) => {
    inputSystem.setContext(context);
  }, [inputSystem]);

  const getInputContext = useCallback(() => {
    return inputSystem.getContext();
  }, [inputSystem]);

  // System control
  const enableInput = useCallback(() => {
    inputSystem.enable();
  }, [inputSystem]);

  const disableInput = useCallback(() => {
    inputSystem.disable();
  }, [inputSystem]);

  const isInputEnabled = useCallback(() => {
    return inputSystem.isEnabled();
  }, [inputSystem]);

  // Event subscription
  const subscribeToInputEvents = useCallback((handler: (event: any) => void) => {
    return inputSystem.subscribe(handler);
  }, [inputSystem]);

  return {
    // Shortcuts
    registerShortcut,
    unregisterShortcut,
    
    // Interaction handlers
    registerInteractionHandler,
    unregisterInteractionHandler,
    
    // Gestures
    registerGesture,
    
    // Context
    setInputContext,
    getInputContext,
    
    // System control
    enableInput,
    disableInput,
    isInputEnabled,
    
    // Events
    subscribeToInputEvents,
    
    // Direct access to input system
    inputSystem
  };
} 