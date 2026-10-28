
import React from "react";

export default function CategoryCard({
  category,
  isActive = false,
  onClick,
}) {
  const name =
    typeof category === "string"
      ? category
      : category?.name || "Food";

  const emoji =
    typeof category === "string"
      ? "🍽️"
      : category?.emoji || "🍽️";

  return (
    <button
      type="button"
      onClick={() => onClick?.(name)}
      aria-pressed={isActive}
      style={{
        width: "100%",
        minWidth: 100,
        padding: "20px 12px",
        border: isActive
          ? "1px solid #ff6b35"
          : "1px solid #f0e7e0",
        borderRadius: 18,
        background: isActive ? "#fff0e7" : "#ffffff",
        color: "#332a25",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transition: "all 0.2s ease",
        boxShadow: isActive
          ? "0 5px 18px #ff6b351c"
          : "0 3px 12px #00000005",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span
        style={{
          width: 54,
          height: 54,
          display: "grid",
          placeItems: "center",
          background: isActive ? "#ffe0ce" : "#fff5ed",
          borderRadius: 16,
          fontSize: 29,
        }}
      >
        {emoji}
      </span>

      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {name}
      </span>
    </button>
  );
}
