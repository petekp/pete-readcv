import { 
  ApplicationInstance,
  ApplicationState,
  ApplicationContext,
  ApplicationEvent,
  ApplicationEventHandler,
  InterAppMessage
} from '../types/application.types';
import { getApplicationRegistry } from './application-registry';

export function createApplicationLifecycleManager() {
  // Private state
  const instances = new Map<string, ApplicationInstance>();
  const eventHandlers = new Set<ApplicationEventHandler>();
  const messageHandlers = new Map<string, (message: InterAppMessage) => void>();

  // Private helpers
  const emit = (event: ApplicationEvent): void => {
    eventHandlers.forEach(handler => handler(event));
  };

  const transitionState = async (
    instanceId: string,
    from: ApplicationState,
    to: ApplicationState
  ): Promise<void> => {
    const instance = instances.get(instanceId);
    if (!instance || instance.state !== from) return;

    instance.state = to;
    emit({ type: 'stateChange', instanceId, from, to });
  };

  const focusInstance = (instanceId: string): void => {
    const instance = instances.get(instanceId);
    if (instance) {
      instance.lastActiveTime = Date.now();
      // TODO: Focus first window of instance
    }
  };

  // Public API
  return {
    // Event subscription
    subscribe(handler: ApplicationEventHandler): () => void {
      eventHandlers.add(handler);
      return () => eventHandlers.delete(handler);
    },

    // Application lifecycle
    async launch(
      appId: string, 
      context: ApplicationContext = {}
    ): Promise<ApplicationInstance> {
      const registry = getApplicationRegistry();
      const app = registry.getApplication(appId);
      
      if (!app) {
        throw new Error(`Application "${appId}" not found in registry`);
      }

      const { manifest } = app;
      
      // Check if singleton
      if (manifest.launchOptions?.singleton) {
        const existingInstance = this.findInstanceByAppId(appId);
        if (existingInstance) {
          // Focus existing instance instead of creating new one
          focusInstance(existingInstance.id);
          return existingInstance;
        }
      }

      // Create new instance
      const instanceId = `${appId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const instance: ApplicationInstance = {
        id: instanceId,
        appId,
        state: 'loading',
        windowIds: [],
        startTime: Date.now(),
        lastActiveTime: Date.now(),
        context
      };

      instances.set(instanceId, instance);
      emit({ type: 'launch', appId, instanceId, context });

      // Transition to running state
      await transitionState(instanceId, 'loading', 'running');

      // Call onMount if provided
      if (app.component.onMount) {
        try {
          await app.component.onMount(context);
        } catch (error) {
          console.error(`Error mounting application ${appId}:`, error);
          await transitionState(instanceId, 'running', 'crashed');
          emit({ 
            type: 'error', 
            instanceId, 
            error: error instanceof Error ? error : new Error(String(error))
          });
        }
      }

      return instance;
    },

    async terminate(
      instanceId: string, 
      reason?: string
    ): Promise<void> {
      const instance = instances.get(instanceId);
      if (!instance) return;

      const registry = getApplicationRegistry();
      const app = registry.getApplication(instance.appId);

      await transitionState(instanceId, instance.state, 'stopping');

      // Call onUnmount if provided
      if (app?.component.onUnmount) {
        try {
          await app.component.onUnmount();
        } catch (error) {
          console.error(`Error unmounting application ${instance.appId}:`, error);
        }
      }

      // Clean up
      instances.delete(instanceId);
      messageHandlers.delete(instanceId);
      
      emit({ type: 'terminate', instanceId, reason });
    },

    async suspend(instanceId: string): Promise<void> {
      const instance = instances.get(instanceId);
      if (!instance || instance.state !== 'running') return;

      const registry = getApplicationRegistry();
      const app = registry.getApplication(instance.appId);

      await transitionState(instanceId, 'running', 'suspended');

      // Call onSuspend if provided
      if (app?.component.onSuspend) {
        try {
          await app.component.onSuspend();
        } catch (error) {
          console.error(`Error suspending application ${instance.appId}:`, error);
        }
      }

      emit({ type: 'suspend', instanceId });
    },

    async resume(instanceId: string): Promise<void> {
      const instance = instances.get(instanceId);
      if (!instance || instance.state !== 'suspended') return;

      const registry = getApplicationRegistry();
      const app = registry.getApplication(instance.appId);

      await transitionState(instanceId, 'suspended', 'running');

      // Call onResume if provided
      if (app?.component.onResume) {
        try {
          await app.component.onResume();
        } catch (error) {
          console.error(`Error resuming application ${instance.appId}:`, error);
        }
      }

      instance.lastActiveTime = Date.now();
      emit({ type: 'resume', instanceId });
    },

    // Instance management
    getInstance(instanceId: string): ApplicationInstance | undefined {
      return instances.get(instanceId);
    },

    getAllInstances(): ApplicationInstance[] {
      return Array.from(instances.values());
    },

    getInstancesByAppId(appId: string): ApplicationInstance[] {
      return Array.from(instances.values())
        .filter(instance => instance.appId === appId);
    },

    findInstanceByAppId(appId: string): ApplicationInstance | undefined {
      return Array.from(instances.values())
        .find(instance => instance.appId === appId);
    },

    addWindowToInstance(instanceId: string, windowId: string): void {
      const instance = instances.get(instanceId);
      if (instance && !instance.windowIds.includes(windowId)) {
        instance.windowIds.push(windowId);
        instance.lastActiveTime = Date.now();
      }
    },

    removeWindowFromInstance(instanceId: string, windowId: string): void {
      const instance = instances.get(instanceId);
      if (instance) {
        instance.windowIds = instance.windowIds.filter(id => id !== windowId);
        
        // If no windows left and app doesn't support background mode, terminate
        if (instance.windowIds.length === 0) {
          const registry = getApplicationRegistry();
          const app = registry.getApplication(instance.appId);
          
          if (!app?.manifest.capabilities.supportsBackgroundMode) {
            this.terminate(instanceId, 'No windows remaining');
          }
        }
      }
    },

    // Inter-app communication
    registerMessageHandler(
      instanceId: string, 
      handler: (message: InterAppMessage) => void
    ): void {
      messageHandlers.set(instanceId, handler);
    },

    sendMessage(message: InterAppMessage): void {
      if (message.to === '*') {
        // Broadcast to all instances
        messageHandlers.forEach((handler, instanceId) => {
          if (instanceId !== message.from) {
            handler(message);
          }
        });
      } else {
        // Send to specific instance
        const handler = messageHandlers.get(message.to);
        if (handler) {
          handler(message);
        }
      }
    }
  };
}

export type ApplicationLifecycleManagerAPI = ReturnType<typeof createApplicationLifecycleManager>;

// Singleton instance
let lifecycleInstance: ApplicationLifecycleManagerAPI | null = null;

export function getApplicationLifecycleManager(): ApplicationLifecycleManagerAPI {
  if (!lifecycleInstance) {
    lifecycleInstance = createApplicationLifecycleManager();
  }
  return lifecycleInstance;
}

// For testing purposes
export function resetApplicationLifecycleManager(): void {
  lifecycleInstance = null;
} 