
import React from "react";

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}) {
  if (!item) return null;

  const quantity = Number(item.quantity) || 1;
  const price = Number(item.price) || 0;

  return (
    <article
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 16,
        background: "#fff",
        border: "1px solid #f0e7e0",
        borderRadius: 16,
        marginBottom: 14,
        flexWrap: "wrap",
      }}
    >
      <img
        src={item.image || "https://placehold.co/100x100?text=Food"}
        alt={item.name || "Food item"}
        style={{
          width: 95,
          height: 95,
          objectFit: "cover",
          borderRadius: 12,
          background: "#fff3e9",
        }}
      />

      <div style={{ flex: 1, minWidth: 130 }}>
        <h3
          style={{
            margin: "0 0 7px",
            color: "#29231f",
            fontSize: 16,
          }}
        >
          {item.name || "Food Item"}
        </h3>

        <p
          style={{
            margin: "0 0 10px",
            color: "#ff6b35",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          ₹{price} each
        </p>

        <strong style={{ fontSize: 14, color: "#29231f" }}>
          Subtotal: ₹{price * quantity}
        </strong>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={() =>
            onUpdateQuantity?.(item.id, quantity - 1)
          }
          disabled={quantity <= 1}
          aria-label={`Decrease ${item.name} quantity`}
          style={{
            width: 34,
            height: 34,
            border: "1px solid #eee0d6",
            borderRadius: 9,
            background: quantity <= 1 ? "#f5f5f5" : "#fff7f1",
            cursor: quantity <= 1 ? "not-allowed" : "pointer",
          }}
        >
          −
        </button>

        <span
          style={{
            minWidth: 20,
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          {quantity}
        </span>

        <button
          type="button"
          onClick={() =>
            onUpdateQuantity?.(item.id, quantity + 1)
          }
          aria-label={`Increase ${item.name} quantity`}
          style={{
            width: 34,
            height: 34,
            border: "none",
            borderRadius: 9,
            background: "#ff6b35",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => onRemove?.(item.id)}
        style={{
          border: "none",
          background: "transparent",
          color: "#d94343",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          padding: 8,
        }}
      >
        🗑 Remove
      </button>
    </article>
  );
}
