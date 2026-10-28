
import React, { useState } from "react";
import {
  Star,
  Clock3,
  MapPin,
  ArrowUpRight,
  Bike,
} from "lucide-react";
import "../styles/RestaurantCard.css";

export default function RestaurantCard({
  restaurant = {},
  onClick,
}) {
  const [imageError, setImageError] = useState(false);

  const {
    _id,
    id,
    name = "The Food Studio",
    image = "",
    cuisines = ["Multi-cuisine"],
    rating = 4.5,
    deliveryTime = "25–35 min",
    deliveryFee = 0,
    offer = "Fresh & delicious",
    priceForTwo = 400,
    isPromoted = false,
  } = restaurant;

  const styles = {
    card: {
      overflow: "hidden",
      border: "1px solid #f0e9e4",
      borderRadius: 22,
      background: "#fff",
      boxShadow: "0 5px 20px rgba(36,25,18,.04)",
      cursor: onClick ? "pointer" : "default",
      transition: "transform .25s ease, box-shadow .25s ease",
    },

    imageWrapper: {
      height: 215,
      position: "relative",
      overflow: "hidden",
      background: "#fff0e9",
    },

    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform .35s ease",
    },

    placeholder: {
      height: "100%",
      display: "grid",
      placeItems: "center",
      fontSize: 75,
      background: "linear-gradient(135deg,#fff0e9,#ffe0ce)",
    },

    promoted: {
      position: "absolute",
      top: 13,
      left: 13,
      padding: "7px 10px",
      borderRadius: 7,
      background: "rgba(255,255,255,.96)",
      color: "#4a4039",
      fontSize: 10,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: ".6px",
    },

    offer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "28px 14px 13px",
      background: "linear-gradient(transparent,rgba(0,0,0,.72))",
      color: "#fff",
      fontSize: 14,
      fontWeight: 800,
    },

    body: {
      padding: 17,
    },

    titleRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },

    name: {
      margin: 0,
      color: "#24211f",
      fontSize: 18,
      lineHeight: 1.4,
      fontWeight: 800,
      letterSpacing: "-.5px",
    },

    rating: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexShrink: 0,
      padding: "6px 8px",
      borderRadius: 8,
      background: "#eaf7ee",
      color: "#16834b",
      fontSize: 12,
      fontWeight: 800,
    },

    cuisines: {
      margin: "8px 0 15px",
      color: "#817872",
      fontSize: 12,
      lineHeight: 1.6,
    },

    divider: {
      height: 1,
      background: "#f2ece7",
      marginBottom: 14,
    },

    meta: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
      color: "#6f6762",
      fontSize: 11,
    },

    metaItem: {
      display: "flex",
      alignItems: "center",
      gap: 5,
    },

    bottom: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 16,
    },

    price: {
      color: "#817872",
      fontSize: 11,
    },

    priceValue: {
      display: "block",
      marginTop: 4,
      color: "#24211f",
      fontSize: 14,
      fontWeight: 800,
    },

    viewButton: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      padding: "11px 13px",
      border: "none",
      borderRadius: 10,
      background: "#fff0e9",
      color: "#e95220",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
    },
  };

  return (
    <article
      style={styles.card}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-5px)";
        event.currentTarget.style.boxShadow =
          "0 14px 34px rgba(36,25,18,.10)";

        const img = event.currentTarget.querySelector("img");
        if (img) img.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow =
          "0 5px 20px rgba(36,25,18,.04)";

        const img = event.currentTarget.querySelector("img");
        if (img) img.style.transform = "scale(1)";
      }}
    >
      <div style={styles.imageWrapper}>
        {image && !imageError ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={styles.placeholder} role="img" aria-label={name}>
            🍽️
          </div>
        )}

        {isPromoted && (
          <span style={styles.promoted}>Featured</span>
        )}

        {offer && <div style={styles.offer}>{offer}</div>}
      </div>

      <div style={styles.body}>
        <div style={styles.titleRow}>
          <h3 style={styles.name}>{name}</h3>

          <span style={styles.rating}>
            <Star size={12} fill="currentColor" />
            {Number(rating).toFixed(1)}
          </span>
        </div>

        <p style={styles.cuisines}>
          {Array.isArray(cuisines)
            ? cuisines.join(" · ")
            : cuisines}
        </p>

        <div style={styles.divider} />

        <div style={styles.meta}>
          <span style={styles.metaItem}>
            <Clock3 size={14} />
            {deliveryTime}
          </span>

          <span style={styles.metaItem}>
            <Bike size={14} />
            {Number(deliveryFee) === 0
              ? "Free delivery"
              : `₹${deliveryFee} delivery`}
          </span>
        </div>

        <div style={styles.bottom}>
          <div style={styles.price}>
            Cost for two
            <span style={styles.priceValue}>
              ₹{Number(priceForTwo).toLocaleString("en-IN")}
            </span>
          </div>

          <button
            type="button"
            style={styles.viewButton}
            onClick={() => onClick?.(restaurant)}
          >
            Explore
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
