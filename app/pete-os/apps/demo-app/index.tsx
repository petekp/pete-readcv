import React, { useState, useEffect } from "react";
import {
  ApplicationComponent,
  ApplicationRenderProps,
} from "../../core/types/application.types";

const DemoAppComponent: React.FC<ApplicationRenderProps> = ({
  instanceId,
  context,
  sendMessage,
}) => {
  const [counter, setCounter] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Example of sending a broadcast message on mount
    sendMessage({
      from: instanceId,
      to: "*",
      type: "app.mounted",
      payload: { appId: "demo-app", instanceId },
      timestamp: Date.now(),
    });
  }, [instanceId, sendMessage]);

  const handleSendMessage = () => {
    const message = {
      from: instanceId,
      to: "*",
      type: "demo.message",
      payload: { text: `Hello from ${instanceId}! Count: ${counter}` },
      timestamp: Date.now(),
    };
    sendMessage(message);
    setMessages((prev) => [...prev, `Sent: ${message.payload.text}`]);
  };

  return (
    <div
      style={{
        padding: "20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Demo Application</h2>

      <div style={{ marginBottom: "20px" }}>
        <p style={{ margin: "5px 0", color: "#666" }}>
          Instance ID:{" "}
          <code
            style={{
              backgroundColor: "#e0e0e0",
              padding: "2px 6px",
              borderRadius: "3px",
              fontSize: "12px",
            }}
          >
            {instanceId}
          </code>
        </p>
        {context.args && context.args.length > 0 && (
          <p style={{ margin: "5px 0", color: "#666" }}>
            Arguments: {context.args.join(", ")}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setCounter((c) => c + 1)}
          style={{
            padding: "8px 16px",
            marginRight: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Count: {counter}
        </button>

        <button
          onClick={handleSendMessage}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Send Message
        </button>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>
          Message Log
        </h3>
        {messages.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>No messages yet...</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                fontSize: "13px",
                padding: "4px 0",
                borderBottom: "1px solid #f0f0f0",
                color: "#333",
              }}
            >
              {msg}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const DemoApp: ApplicationComponent = {
  render: (props) => <DemoAppComponent {...props} />,

  onMount: async (context) => {
    console.log("Demo app mounted with context:", context);
  },

  onUnmount: async () => {
    console.log("Demo app unmounting");
  },

  onSuspend: async () => {
    console.log("Demo app suspended");
  },

  onResume: async () => {
    console.log("Demo app resumed");
  },
};
