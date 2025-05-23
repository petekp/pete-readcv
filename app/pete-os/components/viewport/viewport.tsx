"use client";

import React, { ReactNode } from "react";
import { useWindowManager } from "../../core/window-manager/window-manager-context";
import { BaseWindow } from "../window/base-window";

export interface ViewportProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  renderWindow?: (windowState: any) => ReactNode;
}

export const Viewport: React.FC<ViewportProps> = ({
  children,
  className = "",
  style = {},
  renderWindow,
}) => {
  const { windows } = useWindowManager();

  const baseStyles: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    ...style,
  };

  return (
    <div className={`pete-os-viewport ${className}`} style={baseStyles}>
      {/* Render windows in z-order */}
      {windows
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((windowState) => (
          <BaseWindow key={windowState.id} windowState={windowState}>
            {renderWindow ? (
              renderWindow(windowState)
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#f0f0f0",
                  border: "1px solid #ccc",
                }}
              >
                Window: {windowState.id}
              </div>
            )}
          </BaseWindow>
        ))}

      {/* Additional UI elements can be rendered as children */}
      {children}
    </div>
  );
};
