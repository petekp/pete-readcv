"use client";

import React, { useEffect } from "react";
import { WindowManagerProvider } from "./core/window-manager/window-manager-context";
import { ApplicationManagerProvider } from "./core/application-manager/application-manager-context";
import { Viewport } from "./components/viewport/viewport";
import { useWindow } from "./lib/hooks/use-window";
import { useApplication } from "./lib/hooks/use-application";
import { useWindowManager } from "./core/window-manager/window-manager-context";

import { BaseWindow } from "./components/window/base-window";

// Import demo app
import { DemoApp } from "./apps/demo-app";
import { demoAppManifest } from "./apps/demo-app/manifest";

import "./styles.css";

// Desktop component with app launcher
const Desktop = () => {
  const { createWindow } = useWindow();
  const { registerApp, launchApp, getAllAppInstances } = useApplication();
  const { windowManager, windows } = useWindowManager();

  // Register demo app on mount
  useEffect(() => {
    registerApp(demoAppManifest, DemoApp);
  }, [registerApp]);

  const handleLaunchApp = async () => {
    try {
      const instance = await launchApp("demo-app", {
        args: ["--test"],
        env: { MODE: "development" },
      });

      // Create a window for the app
      createWindow({
        appId: instance.appId,
        initialBounds: {
          position: {
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
          },
          size: {
            width: demoAppManifest.windowDefaults?.width || 400,
            height: demoAppManifest.windowDefaults?.height || 300,
          },
        },
        constraints: {
          minWidth: demoAppManifest.windowDefaults?.minWidth || 200,
          minHeight: demoAppManifest.windowDefaults?.minHeight || 150,
          canResize: demoAppManifest.windowDefaults?.resizable ?? true,
          canMove: demoAppManifest.windowDefaults?.movable ?? true,
          canMinimize: demoAppManifest.windowDefaults?.minimizable ?? true,
          canMaximize: demoAppManifest.windowDefaults?.maximizable ?? true,
          canClose: demoAppManifest.windowDefaults?.closable ?? true,
        },
        metadata: {
          title: demoAppManifest.metadata.name,
          instanceId: instance.id,
        },
      });
    } catch (error) {
      console.error("Failed to launch app:", error);
    }
  };

  const instances = getAllAppInstances();

  return (
    <Viewport className="pete-os-desktop">
      {/* App launcher button */}
      <button
        onClick={handleLaunchApp}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "10px 20px",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 9999,
        }}
      >
        Launch Demo App
      </button>

      {/* Instance counter */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "10px 20px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          borderRadius: "4px",
          fontSize: "14px",
          zIndex: 9999,
        }}
      >
        Active Instances: {instances.length}
      </div>

      {/* Render windows with app content */}
      {windows.map((window) => {
        const instanceId = window.metadata?.instanceId as string;
        const instance = instances.find((i) => i.id === instanceId);

        return (
          <BaseWindow key={window.id} windowState={window}>
            {instance && window.appId === "demo-app" && (
              <DemoApp.render
                instanceId={instanceId}
                context={instance.context}
                sendMessage={(msg) => {
                  console.log("Message sent:", msg);
                  // Message routing is handled by ApplicationLifecycleManager
                }}
              />
            )}
          </BaseWindow>
        );
      })}
    </Viewport>
  );
};

// Main page component
export default function PeteOSPage() {
  return (
    <WindowManagerProvider>
      <ApplicationManagerProvider>
        <div
          style={{
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
            background: "#1e1e1e",
          }}
        >
          <Desktop />
        </div>
      </ApplicationManagerProvider>
    </WindowManagerProvider>
  );
}
