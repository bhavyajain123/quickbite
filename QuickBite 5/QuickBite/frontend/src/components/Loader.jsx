
import React from "react";

export default function Loader({
  message = "Loading delicious food...",
  fullScreen = false,
  size = 44,
}) {
  return (
    <div
      style={{
        minHeight: fullScreen ? "100vh" : "220px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: fullScreen ? "#fffaf6" : "transparent",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <style>
        {`
          @keyframes quickBiteSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes quickBitePulse {
            0%, 100% {
              opacity: 0.5;
              transform: scale(0.95);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }
        `}
      </style>

      <div
        style={{
          width: size,
          height: size,
          border: "4px solid #ffe1d1",
          borderTop: "4px solid #ff6b35",
          borderRadius: "50%",
          animation: "quickBiteSpin 0.8s linear infinite",
        }}
        role="status"
        aria-label="Loading"
      />

      <div style={{ textAlign: "center" }}>
        <h3
          style={{
            margin: "0 0 6px",
            color: "#262626",
            fontSize: "17px",
            fontWeight: 700,
            animation: "quickBitePulse 1.5s ease-in-out infinite",
          }}
        >
          QuickBite
        </h3>

        <p
          style={{
            margin: 0,
            color: "#777",
            fontSize: "14px",
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
