"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import {
  ApplicationManifest,
  ApplicationComponent,
  ApplicationInstance,
  ApplicationContext as AppContext,
  InterAppMessage,
  ApplicationEvent,
} from "../types/application.types";
import { getApplicationRegistry } from "./application-registry";
import { getApplicationLifecycleManager } from "./application-lifecycle";
import { initializeWindowApplicationBridge } from "./window-application-bridge";
import { useWindowManager } from "../window-manager/window-manager-context";

interface ApplicationManagerContextValue {
  // Registry operations
  registerApplication: (
    manifest: ApplicationManifest,
    component: ApplicationComponent
  ) => void;
  unregisterApplication: (appId: string) => boolean;

  // Lifecycle operations
  launchApplication: (
    appId: string,
    context?: AppContext
  ) => Promise<ApplicationInstance>;
  terminateApplication: (instanceId: string, reason?: string) => Promise<void>;
  suspendApplication: (instanceId: string) => Promise<void>;
  resumeApplication: (instanceId: string) => Promise<void>;

  // Queries
  getApplicationInstance: (
    instanceId: string
  ) => ApplicationInstance | undefined;
  applicationInstances: ApplicationInstance[];

  // Inter-app communication
  sendMessage: (message: InterAppMessage) => void;
}

const ApplicationManagerContext =
  createContext<ApplicationManagerContextValue | null>(null);

export function ApplicationManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { windowManager } = useWindowManager();
  const registry = useMemo(() => getApplicationRegistry(), []);
  const lifecycle = useMemo(() => getApplicationLifecycleManager(), []);

  // Add state for application instances
  const [applicationInstances, setApplicationInstances] = React.useState<
    ApplicationInstance[]
  >(() => lifecycle.getAllInstances());

  // Initialize the window-application bridge
  useEffect(() => {
    const bridge = initializeWindowApplicationBridge(windowManager);

    return () => {
      bridge.destroy();
    };
  }, [windowManager]);

  // Subscribe to application lifecycle events
  useEffect(() => {
    const handleApplicationEvent = (event: ApplicationEvent) => {
      // Update instances list on relevant events
      if (
        event.type === "launch" ||
        event.type === "terminate" ||
        event.type === "register" ||
        event.type === "unregister"
      ) {
        setApplicationInstances([...lifecycle.getAllInstances()]);
      }
    };

    const unsubscribe = lifecycle.subscribe(handleApplicationEvent);

    // Initial sync in case of race condition or if events fired before subscription
    setApplicationInstances([...lifecycle.getAllInstances()]);

    return () => {
      unsubscribe();
    };
  }, [lifecycle]); // Dependency: lifecycle manager

  const value: ApplicationManagerContextValue = useMemo(
    () => ({
      // Registry operations
      registerApplication: (manifest, component) => {
        registry.register(manifest, component);
        // Note: 'register' event handled by useEffect above will update instances
      },

      unregisterApplication: (appId) => {
        const success = registry.unregister(appId);
        // Note: 'unregister' event handled by useEffect above will update instances
        return success;
      },

      // Lifecycle operations
      launchApplication: async (appId, context) => {
        // 'launch' event handled by useEffect above will update instances
        return await lifecycle.launch(appId, context);
      },

      terminateApplication: async (instanceId, reason) => {
        // 'terminate' event handled by useEffect above will update instances
        await lifecycle.terminate(instanceId, reason);
      },

      suspendApplication: async (instanceId) => {
        await lifecycle.suspend(instanceId);
      },

      resumeApplication: async (instanceId) => {
        await lifecycle.resume(instanceId);
      },

      // Queries
      getApplicationInstance: (instanceId) => {
        return lifecycle.getInstance(instanceId);
      },
      // Provide the stateful array
      applicationInstances: applicationInstances,

      // Inter-app communication
      sendMessage: (message) => {
        lifecycle.sendMessage(message);
      },
    }),
    [registry, lifecycle, applicationInstances] // Added applicationInstances to dependencies
  );

  return (
    <ApplicationManagerContext.Provider value={value}>
      {children}
    </ApplicationManagerContext.Provider>
  );
}

export function useApplicationManager() {
  const context = useContext(ApplicationManagerContext);
  if (!context) {
    throw new Error(
      "useApplicationManager must be used within ApplicationManagerProvider"
    );
  }
  return context;
}
