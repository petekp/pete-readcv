import { 
  InteractionHandler, 
  InteractionRegistry, 
  InputEvent, 
  InputContext 
} from '../types/input.types';

export function createInteractionRegistry(): InteractionRegistry {
  // Private state
  const handlers = new Map<string, InteractionHandler>();
  
  // Private helpers
  const contextMatches = (handlerContext: InputContext, eventContext?: InputContext): boolean => {
    if (!eventContext) return false;
    
    // Check window context
    if (handlerContext.windowId && handlerContext.windowId !== eventContext.windowId) {
      return false;
    }
    
    // Check app context
    if (handlerContext.appId && handlerContext.appId !== eventContext.appId) {
      return false;
    }
    
    // Check element type
    if (handlerContext.elementType && handlerContext.elementType !== eventContext.elementType) {
      return false;
    }
    
    // Check interaction mode
    if (handlerContext.interactionMode && handlerContext.interactionMode !== eventContext.interactionMode) {
      return false;
    }
    
    return true;
  };

  const getMatchingHandlers = (event: InputEvent): InteractionHandler[] => {
    return Array.from(handlers.values()).filter(handler => {
      // Check if handler can handle this event type
      if (!handler.canHandle(event)) {
        return false;
      }
      
      // Check if context matches
      return contextMatches(handler.context, event.context);
    });
  };

  // Public API
  return {
    register(handler: InteractionHandler): () => void {
      if (handlers.has(handler.id)) {
        console.warn(`Interaction handler with id "${handler.id}" already exists. Overwriting.`);
      }
      
      handlers.set(handler.id, handler);
      
      return () => {
        handlers.delete(handler.id);
      };
    },

    unregister(id: string): void {
      handlers.delete(id);
    },

    getHandlers(context?: InputContext): InteractionHandler[] {
      if (!context) {
        return Array.from(handlers.values());
      }
      
      return Array.from(handlers.values()).filter(handler => 
        contextMatches(handler.context, context)
      );
    },

    async handleEvent(event: InputEvent): Promise<boolean> {
      const matchingHandlers = getMatchingHandlers(event);
      
      if (matchingHandlers.length === 0) {
        return false;
      }
      
      // Sort by priority (higher priority first)
      matchingHandlers.sort((a, b) => b.priority - a.priority);
      
      // Try handlers in priority order until one consumes the event
      for (const handler of matchingHandlers) {
        try {
          const result = await handler.handle(event);
          if (result) {
            // Event was consumed by this handler
            return true;
          }
        } catch (error) {
          console.error(`Error in interaction handler "${handler.id}":`, error);
          // Continue to next handler on error
        }
      }
      
      return false;
    }
  };
}

// Singleton instance
let registryInstance: InteractionRegistry | undefined;

export function getInteractionRegistry(): InteractionRegistry {
  if (!registryInstance) {
    registryInstance = createInteractionRegistry();
  }
  return registryInstance;
} 