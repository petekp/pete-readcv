import { WindowManagerAPI } from '../window-manager/create-window-manager';
import { getApplicationLifecycleManager } from './application-lifecycle';
import { getApplicationRegistry } from './application-registry';
import { WindowState } from '../types/window.types';

export function createWindowApplicationBridge(windowManager: WindowManagerAPI) {
  // Private state
  const lifecycleManager = getApplicationLifecycleManager();
  const registry = getApplicationRegistry();
  
  // Track which windows belong to which app instances
  const windowToInstance = new Map<string, string>();

  // Private helpers
  const handleWindowDestroy = (windowId: string) => {
    const instanceId = windowToInstance.get(windowId);
    if (instanceId) {
      windowToInstance.delete(windowId);
      lifecycleManager.removeWindowFromInstance(instanceId, windowId);
    }
  };

  const handleWindowCreate = (windowId: string, initialState: WindowState) => {
    const instanceId = (initialState.metadata?.instanceId as string) || undefined;
    if (instanceId) {
      windowToInstance.set(windowId, instanceId);
      lifecycleManager.addWindowToInstance(instanceId, windowId);
    }
  };

  // Setup event listeners
  const unsubscribe = windowManager.subscribe((event) => {
    switch (event.type) {
      case 'create':
        handleWindowCreate(event.windowId, event.initialState as WindowState);
        break;
      case 'destroy':
        handleWindowDestroy(event.windowId);
        break;
    }
  });

  // Public API
  return {
    async createWindowForApp(
      instanceId: string,
      windowOptions?: {
        title?: string;
        bounds?: { position?: { x: number; y: number }; size?: { width: number; height: number } };
        metadata?: Record<string, unknown>;
      }
    ): Promise<string> {
      const instance = lifecycleManager.getInstance(instanceId);
      if (!instance) {
        throw new Error(`Application instance ${instanceId} not found`);
      }

      const app = registry.getApplication(instance.appId);
      if (!app) {
        throw new Error(`Application ${instance.appId} not found`);
      }

      const { windowDefaults } = app.manifest;
      
      // Generate window ID
      const windowId = `${instanceId}-window-${Date.now()}`;
      
      // Merge defaults with provided options
      const bounds = {
        position: windowOptions?.bounds?.position || { x: 100, y: 100 },
        size: {
          width: windowOptions?.bounds?.size?.width || windowDefaults?.width || 400,
          height: windowOptions?.bounds?.size?.height || windowDefaults?.height || 300
        }
      };

      const constraints = {
        minWidth: windowDefaults?.minWidth,
        minHeight: windowDefaults?.minHeight,
        maxWidth: windowDefaults?.maxWidth,
        maxHeight: windowDefaults?.maxHeight,
        canResize: windowDefaults?.resizable ?? true,
        canMove: windowDefaults?.movable ?? true,
        canMinimize: windowDefaults?.minimizable ?? true,
        canMaximize: windowDefaults?.maximizable ?? true,
        canClose: windowDefaults?.closable ?? true
      };

      // Create window
      windowManager.createWindow(
        windowId,
        instance.appId,
        bounds,
        constraints,
        {
          ...windowOptions?.metadata,
          instanceId,
          title: windowOptions?.title || app.manifest.metadata.name
        }
      );

      // Track associations
      windowToInstance.set(windowId, instanceId);
      lifecycleManager.addWindowToInstance(instanceId, windowId);

      return windowId;
    },

    getInstanceForWindow(windowId: string): string | undefined {
      return windowToInstance.get(windowId);
    },

    getAllWindowsForInstance(instanceId: string): WindowState[] {
      const instance = lifecycleManager.getInstance(instanceId);
      if (!instance) return [];

      return instance.windowIds
        .map(id => windowManager.getAllWindows().find(w => w.id === id))
        .filter((w): w is WindowState => w !== undefined);
    },

    // Cleanup function
    destroy() {
      unsubscribe();
    }
  };
}

export type WindowApplicationBridgeAPI = ReturnType<typeof createWindowApplicationBridge>;

// Singleton management
let bridgeInstance: WindowApplicationBridgeAPI | null = null;

export function getWindowApplicationBridge(): WindowApplicationBridgeAPI | null {
  return bridgeInstance;
}

export function initializeWindowApplicationBridge(windowManager: WindowManagerAPI): WindowApplicationBridgeAPI {
  if (!bridgeInstance) {
    bridgeInstance = createWindowApplicationBridge(windowManager);
  }
  return bridgeInstance;
} 