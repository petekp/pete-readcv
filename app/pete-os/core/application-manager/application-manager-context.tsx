"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import {
  ApplicationManifest,
  ApplicationComponent,
  ApplicationInstance,
  ApplicationContext as AppContext,
  InterAppMessage,
} from "../types/application.types";
import { getApplicationRegistry } from "./application-registry";
import { getApplicationLifecycleManager } from "./application-lifecycle";

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
  getAllApplicationInstances: () => ApplicationInstance[];

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
  const registry = useMemo(() => getApplicationRegistry(), []);
  const lifecycle = useMemo(() => getApplicationLifecycleManager(), []);

  const value: ApplicationManagerContextValue = useMemo(
    () => ({
      // Registry operations
      registerApplication: (manifest, component) => {
        registry.register(manifest, component);
      },

      unregisterApplication: (appId) => {
        return registry.unregister(appId);
      },

      // Lifecycle operations
      launchApplication: async (appId, context) => {
        return await lifecycle.launch(appId, context);
      },

      terminateApplication: async (instanceId, reason) => {
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

      getAllApplicationInstances: () => {
        return lifecycle.getAllInstances();
      },

      // Inter-app communication
      sendMessage: (message) => {
        lifecycle.sendMessage(message);
      },
    }),
    [registry, lifecycle]
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
