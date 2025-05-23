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
  const {
    registerApplication,
    unregisterApplication,
    launchApplication,
    terminateApplication,
    suspendApplication,
    resumeApplication,
    getApplicationInstance,
    applicationInstances,
    sendMessage,
  } = useApplicationManager();

  const registerApp = useCallback((
    manifest: ApplicationManifest, 
    component: ApplicationComponent
  ) => {
    registerApplication(manifest, component);
  }, [registerApplication]);

  const launchApp = useCallback(async (
    appId: string, 
    context?: ApplicationContext
  ) => {
    return launchApplication(appId, context);
  }, [launchApplication]);

  const terminateApp = useCallback(async (
    instanceId: string, 
    reason?: string
  ) => {
    terminateApplication(instanceId, reason);
  }, [terminateApplication]);

  const sendMessageApp = useCallback((
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
    sendMessage(message);
  }, [sendMessage]);

  return {
    registerApp,
    unregisterApp: unregisterApplication,
    launchApp,
    terminateApp,
    suspendApp: suspendApplication,
    resumeApp: resumeApplication,
    getAppInstance: getApplicationInstance,
    getAllAppInstances: () => applicationInstances,
    applicationInstances,
    sendAppMessage: sendMessageApp,
  };
} 