"use client";

import React from "react";
import { WindowManagerProvider } from "./core/window-manager/window-manager-context";
import { Viewport } from "./components/viewport/viewport";
import { useWindow } from "./lib/hooks/use-window";
import "./styles.css";

// Demo component to test window creation
const DesktopDemo = () => {
  const { createWindow } = useWindow();

  const handleCreateWindow = () => {
    createWindow({
      appId: "demo-app",
      initialBounds: {
        position: {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        },
        size: { width: 400, height: 300 },
      },
      constraints: {
        minWidth: 200,
        minHeight: 150,
        canResize: true,
        canMove: true,
        canMinimize: true,
        canMaximize: true,
        canClose: true,
      },
      metadata: {
        title: "Demo Window",
      },
    });
  };

  return (
    <Viewport className="pete-os-desktop">
      {/* Temporary button to test window creation */}
      <button
        onClick={handleCreateWindow}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 9999,
        }}
      >
        Create Demo Window
      </button>
    </Viewport>
  );
};

export default function PeteOSPage() {
  return (
    <WindowManagerProvider>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          background: "#1e1e1e",
        }}
      >
        <DesktopDemo />
      </div>
    </WindowManagerProvider>
  );
}
