"use client";

import { useCallback } from 'react';
import { useApplicationManager } from '../../core/application-manager/application-manager-context';
import { 
  ApplicationManifest, 
  ApplicationComponent,
  ApplicationContext,
  InterAppMessage
} from '../../core/types/application.types';

export function useApplication() {
  const manager = useApplicationManager();

  const registerApp = useCallback((
    manifest: ApplicationManifest, 
    component: ApplicationComponent
  ) => {
    manager.registerApplication(manifest, component);
  }, [manager]);

  const launchApp = useCallback(async (
    appId: string, 
    context?: ApplicationContext
  ) => {
    return await manager.launchApplication(appId, context);
  }, [manager]);

  const terminateApp = useCallback(async (
    instanceId: string, 
    reason?: string
  ) => {
    await manager.terminateApplication(instanceId, reason);
  }, [manager]);

  const sendMessage = useCallback((
    from: string,
    to: string,
    type: string,
    payload?: unknown
  ) => {
    const message: InterAppMessage = {
      from,
      to,
      type,
      payload,
      timestamp: Date.now()
    };
    manager.sendMessage(message);
  }, [manager]);

  return {
    registerApp,
    launchApp,
    terminateApp,
    sendMessage,
    suspendApp: manager.suspendApplication,
    resumeApp: manager.resumeApplication,
    getAppInstance: manager.getApplicationInstance,
    getAllAppInstances: manager.getAllApplicationInstances
  };
} 