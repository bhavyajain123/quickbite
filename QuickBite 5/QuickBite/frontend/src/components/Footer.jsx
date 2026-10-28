
import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#29231f",
        color: "#fff",
        padding: "28px 20px",
        marginTop: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "24px" }}>
            QuickBite<span style={{ color: "#ff6b35" }}>.</span>
          </h2>
          <p style={{ color: "#c7b9b0", fontSize: "13px" }}>
            Good food. Good mood. Made for your cravings. ❤️
          </p>
        </div>

        <p style={{ color: "#c7b9b0", fontSize: "12px" }}>
          © {new Date().getFullYear()} QuickBite · Project Demo
        </p>
      </div>
    </footer>
  );
}

