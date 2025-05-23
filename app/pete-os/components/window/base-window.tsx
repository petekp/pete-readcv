"use client";

import React, { useRef, useEffect, ReactNode } from "react";
import { WindowState } from "../../core/types/window.types";
import { useWindowManager } from "../../core/window-manager/window-manager-context";

export interface BaseWindowProps {
  windowState: WindowState;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export const BaseWindow: React.FC<BaseWindowProps> = ({
  windowState,
  children,
  className = "",
  style = {},
  onMouseDown,
}) => {
  const { windowManager } = useWindowManager();
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle focus on mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!windowState.isFocused) {
      windowManager.focusWindow(windowState.id);
    }
    onMouseDown?.(e);
  };

  // Base styles for positioning and visibility
  const baseStyles: React.CSSProperties = {
    position: "absolute",
    left: windowState.bounds.position.x,
    top: windowState.bounds.position.y,
    width: windowState.bounds.size.width,
    height: windowState.bounds.size.height,
    zIndex: windowState.zIndex,
    display: windowState.isVisible ? "block" : "none",
    ...style,
  };

  // Handle maximized state
  if (windowState.isMaximized) {
    const viewport = windowManager.getViewport();
    baseStyles.left = 0;
    baseStyles.top = 0;
    baseStyles.width = viewport.width;
    baseStyles.height = viewport.height;
  }

  return (
    <div
      ref={windowRef}
      className={`pete-os-window ${className}`}
      style={baseStyles}
      onMouseDown={handleMouseDown}
      data-window-id={windowState.id}
      data-window-focused={windowState.isFocused}
      data-window-minimized={windowState.isMinimized}
      data-window-maximized={windowState.isMaximized}
    >
      {children}
    </div>
  );
};
