"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { WindowManager } from "./window-manager";
import { WindowState, WindowEvent, Viewport } from "../types/window.types";

interface WindowManagerContextValue {
  windowManager: WindowManager;
  windows: WindowState[];
  focusedWindowId: string | null;
  viewport: Viewport;
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(
  null
);

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error(
      "useWindowManager must be used within WindowManagerProvider"
    );
  }
  return context;
};

interface WindowManagerProviderProps {
  children: React.ReactNode;
  persistenceKey?: string;
}

export const WindowManagerProvider: React.FC<WindowManagerProviderProps> = ({
  children,
  persistenceKey = "pete-os-windows",
}) => {
  const windowManagerRef = useRef<WindowManager | undefined>(undefined);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });

  if (!windowManagerRef.current) {
    windowManagerRef.current = new WindowManager();
  }

  const windowManager = windowManagerRef.current;

  useEffect(() => {
    if (typeof window !== "undefined" && persistenceKey) {
      const saved = localStorage.getItem(persistenceKey);
      if (saved) {
        try {
          windowManager.loadSerializedState(saved);
          setWindows(windowManager.getAllWindows());
          setFocusedWindowId(windowManager.getFocusedWindow()?.id || null);
        } catch (error) {
          console.error("Failed to load persisted window state:", error);
        }
      }
    }

    const updateViewport = () => {
      if (typeof window !== "undefined") {
        const newViewport = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
        windowManager.setViewport(newViewport);
        setViewport(newViewport);
      }
    };

    updateViewport();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateViewport);
    }

    const unsubscribe = windowManager.subscribe((event: WindowEvent) => {
      setWindows([...windowManager.getAllWindows()]);
      setFocusedWindowId(windowManager.getFocusedWindow()?.id || null);

      if (persistenceKey) {
        localStorage.setItem(
          persistenceKey,
          windowManager.getSerializedState()
        );
      }
    });

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateViewport);
      }
      unsubscribe();
    };
  }, [windowManager, persistenceKey]);

  const contextValue: WindowManagerContextValue = {
    windowManager,
    windows,
    focusedWindowId,
    viewport,
  };

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
    </WindowManagerContext.Provider>
  );
};
