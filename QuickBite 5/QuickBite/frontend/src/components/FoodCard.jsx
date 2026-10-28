
import React, { useState } from "react";
import {
  Star,
  Plus,
  Minus,
  Clock3,
  Flame,
  Heart,
  ShoppingBag,
  Check,
} from "lucide-react";

export default function FoodCard({
  food = {},
  onAddToCart = () => {},
  onToggleWishlist = () => {},
  isWishlisted = false,
}) {
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    _id,
    id,
    name = "Delicious Food",
    description = "Freshly prepared with quality ingredients.",
    image = "",
    price = 199,
    originalPrice,
    rating = 4.5,
    reviews = 120,
    deliveryTime = "25–30 min",
    category = "Popular",
    isVeg = true,
    isBestseller = false,
    discount,
    spiceLevel,
  } = food;

  const foodId = _id || id || name;
  const hasDiscount =
    originalPrice > price ||
    (typeof discount === "number" && discount > 0);

  const discountPercent =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : discount || 0;

  const handleAdd = () => {
    onAddToCart(food);

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  const styles = {
    card: {
      position: "relative",
      minWidth: 0,
      overflow: "hidden",
      background: "#fff",
      border: "1px solid #f0e9e4",
      borderRadius: 22,
      boxShadow: "0 5px 20px rgba(36,25,18,.04)",
      transition: "transform .25s ease, box-shadow .25s ease",
    },

    imageWrapper: {
      position: "relative",
      height: 205,
      overflow: "hidden",
      background: "#fff0e9",
    },

    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform .4s ease",
    },

    placeholder: {
      height: "100%",
      display: "grid",
      placeItems: "center",
      fontSize: 75,
      background: "linear-gradient(135deg, #fff1e7, #ffe0ce)",
    },

    badge: {
      position: "absolute",
      left: 12,
      top: 12,
      padding: "7px 10px",
      borderRadius: 8,
      color: "#fff",
      background: "#e95220",
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: ".4px",
      boxShadow: "0 3px 10px rgba(0,0,0,.1)",
    },

    wishlist: {
      position: "absolute",
      top: 12,
      right: 12,
      display: "grid",
      placeItems: "center",
      width: 37,
      height: 37,
      border: "none",
      borderRadius: "50%",
      background: "#fff",
      color: isWishlisted ? "#e94e64" : "#6f6762",
      boxShadow: "0 4px 12px rgba(0,0,0,.08)",
      cursor: "pointer",
    },

    vegBadge: {
      position: "absolute",
      bottom: 12,
      right: 12,
      display: "grid",
      placeItems: "center",
      width: 21,
      height: 21,
      border: `1px solid ${isVeg ? "#18864b" : "#d94343"}`,
      borderRadius: 5,
      background: "#fff",
    },

    vegDot: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: isVeg ? "#18864b" : "#d94343",
    },

    body: {
      padding: 17,
    },

    category: {
      marginBottom: 8,
      color: "#e95220",
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "1.2px",
      textTransform: "uppercase",
    },

    titleRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },

    name: {
      margin: 0,
      color: "#24211f",
      fontSize: 17,
      lineHeight: 1.4,
      fontWeight: 800,
      letterSpacing: "-.4px",
    },

    rating: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      padding: "5px 7px",
      borderRadius: 7,
      background: "#eaf7ee",
      color: "#16834b",
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: "nowrap",
    },

    description: {
      minHeight: 38,
      margin: "9px 0 12px",
      color: "#817872",
      fontSize: 12,
      lineHeight: 1.65,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },

    meta: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      paddingBottom: 14,
      borderBottom: "1px solid #f2ece7",
      color: "#77716d",
      fontSize: 11,
    },

    delivery: {
      display: "flex",
      alignItems: "center",
      gap: 5,
    },

    priceRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      paddingTop: 15,
    },

    priceGroup: {
      display: "flex",
      alignItems: "baseline",
      flexWrap: "wrap",
      gap: 6,
    },

    price: {
      color: "#24211f",
      fontSize: 21,
      fontWeight: 800,
      letterSpacing: "-.7px",
    },

    originalPrice: {
      color: "#aaa19a",
      fontSize: 12,
      textDecoration: "line-through",
    },

    addButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      minWidth: 95,
      padding: "11px 13px",
      border: added ? "1px solid #16834b" : "1px solid #ff6b35",
      borderRadius: 10,
      background: added ? "#eaf7ee" : "#fff0e9",
      color: added ? "#16834b" : "#e95220",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      transition: "all .2s ease",
    },
  };

  return (
    <article
      style={styles.card}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-5px)";
        event.currentTarget.style.boxShadow =
          "0 14px 34px rgba(36,25,18,.10)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow =
          "0 5px 20px rgba(36,25,18,.04)";
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

        {isBestseller && (
          <span style={styles.badge}>
            <Flame
              size={12}
              style={{ display: "inline", marginRight: 4 }}
            />
            BESTSELLER
          </span>
        )}

        {!isBestseller && hasDiscount && (
          <span style={styles.badge}>{discountPercent}% OFF</span>
        )}

        <button
          type="button"
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          aria-pressed={isWishlisted}
          style={styles.wishlist}
          onClick={() => onToggleWishlist(food)}
        >
          <Heart
            size={18}
            fill={isWishlisted ? "#e94e64" : "none"}
          />
        </button>

        <span
          style={styles.vegBadge}
          title={isVeg ? "Vegetarian" : "Non-vegetarian"}
          aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
        >
          <span style={styles.vegDot} />
        </span>
      </div>

      <div style={styles.body}>
        <div style={styles.category}>{category}</div>

        <div style={styles.titleRow}>
          <h3 style={styles.name}>{name}</h3>

          <span style={styles.rating}>
            <Star size={12} fill="currentColor" />
            {Number(rating).toFixed(1)}
          </span>
        </div>

        <p style={styles.description}>{description}</p>

        <div style={styles.meta}>
          <span style={styles.delivery}>
            <Clock3 size={13} />
            {deliveryTime}
          </span>

          <span>{Number(reviews).toLocaleString()} reviews</span>
        </div>

        <div style={styles.priceRow}>
          <div style={styles.priceGroup}>
            <span style={styles.price}>
              ₹{Number(price).toFixed(0)}
            </span>

            {originalPrice > price && (
              <span style={styles.originalPrice}>
                ₹{Number(originalPrice).toFixed(0)}
              </span>
            )}
          </div>

          <button
            type="button"
            style={styles.addButton}
            onClick={handleAdd}
            aria-label={`Add ${name} to cart`}
          >
            {added ? (
              <>
                <Check size={15} />
                Added
              </>
            ) : (
              <>
                <Plus size={15} />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
