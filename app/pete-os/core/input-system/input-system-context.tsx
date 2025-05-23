"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { createInputSystem, InputSystemAPI } from "./create-input-system";
import {
  InputEvent,
  InputSystemEvent,
  InputContext,
  InputEventType,
} from "../types/input.types";

interface InputSystemContextValue {
  inputSystem: InputSystemAPI;
}

interface InputSystemProviderProps {
  children: ReactNode;
}

const InputSystemContext = createContext<InputSystemContextValue | undefined>(
  undefined
);

export const useInputSystemContext = (): InputSystemContextValue => {
  const context = useContext(InputSystemContext);
  if (!context) {
    throw new Error(
      "useInputSystemContext must be used within an InputSystemProvider"
    );
  }
  return context;
};

export const InputSystemProvider: React.FC<InputSystemProviderProps> = ({
  children,
}) => {
  const inputSystemRef = useRef<InputSystemAPI | undefined>(undefined);

  if (!inputSystemRef.current) {
    inputSystemRef.current = createInputSystem();
  }

  const inputSystem = inputSystemRef.current;

  useEffect(() => {
    // Set up global event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const inputEvent = inputSystem.createInputEvent("key.down", e);
      inputSystem.processEvent(inputEvent).then((handled) => {
        // Prevent default browser behavior if the event was handled by our system
        if (handled) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const inputEvent = inputSystem.createInputEvent("key.up", e);
      inputSystem.processEvent(inputEvent);
    };

    // Note: Removed keypress handler to avoid duplicate shortcut triggers

    const handleMouseDown = (e: MouseEvent) => {
      const inputEvent = inputSystem.createInputEvent("mouse.down", e);
      inputSystem.processEvent(inputEvent);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const inputEvent = inputSystem.createInputEvent("mouse.up", e);
      inputSystem.processEvent(inputEvent);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const inputEvent = inputSystem.createInputEvent("mouse.move", e);
      inputSystem.processEvent(inputEvent);
    };

    const handleClick = (e: MouseEvent) => {
      const inputEvent = inputSystem.createInputEvent("mouse.click", e);
      inputSystem.processEvent(inputEvent);
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const inputEvent = inputSystem.createInputEvent("mouse.doubleclick", e);
      inputSystem.processEvent(inputEvent);
    };

    const handleWheel = (e: WheelEvent) => {
      const inputEvent = inputSystem.createInputEvent("mouse.wheel", e);
      inputSystem.processEvent(inputEvent);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const inputEvent = inputSystem.createInputEvent("touch.start", e);
      inputSystem.processEvent(inputEvent);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const inputEvent = inputSystem.createInputEvent("touch.move", e);
      inputSystem.processEvent(inputEvent);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const inputEvent = inputSystem.createInputEvent("touch.end", e);
      inputSystem.processEvent(inputEvent);
    };

    // Add event listeners
    if (typeof window !== "undefined") {
      // Keyboard events
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      // Mouse events
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("click", handleClick);
      window.addEventListener("dblclick", handleDoubleClick);
      window.addEventListener("wheel", handleWheel);

      // Touch events
      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }

    // Subscribe to input system events for debugging
    const unsubscribe = inputSystem.subscribe((event: InputSystemEvent) => {
      // Log input system events in development
      if (process.env.NODE_ENV === "development") {
        console.log("Input System Event:", event);
      }
    });

    return () => {
      // Remove event listeners
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("click", handleClick);
        window.removeEventListener("dblclick", handleDoubleClick);
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      }

      unsubscribe();
    };
  }, [inputSystem]);

  return (
    <InputSystemContext.Provider value={{ inputSystem }}>
      {children}
    </InputSystemContext.Provider>
  );
};
