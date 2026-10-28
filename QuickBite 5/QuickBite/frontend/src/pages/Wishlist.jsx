
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

const defaultFoods = [
  {
    id: 1,
    name: "Classic Cheeseburger",
    restaurant: "Burger House",
    price: 199,
    rating: 4.7,
    category: "Burgers",
    emoji: "🍔",
    color: "#fff0df",
    description: "Juicy patty, melted cheese and fresh vegetables.",
  },
  {
    id: 2,
    name: "Margherita Pizza",
    restaurant: "Pizza Studio",
    price: 249,
    rating: 4.6,
    category: "Pizza",
    emoji: "🍕",
    color: "#ffe8d6",
    description: "Classic Italian pizza with cheese and basil.",
  },
  {
    id: 3,
    name: "Creamy White Pasta",
    restaurant: "Pasta Corner",
    price: 229,
    rating: 4.5,
    category: "Pasta",
    emoji: "🍝",
    color: "#fff2c9",
    description: "Creamy sauce tossed with herbs and vegetables.",
  },
  {
    id: 4,
    name: "Chocolate Brownie",
    restaurant: "Sweet Treats",
    price: 129,
    rating: 4.8,
    category: "Desserts",
    emoji: "🍫",
    color: "#f6e2d5",
    description: "Rich chocolate brownie for your sweet cravings.",
  },
  {
    id: 5,
    name: "Crispy French Fries",
    restaurant: "Burger House",
    price: 99,
    rating: 4.4,
    category: "Sides",
    emoji: "🍟",
    color: "#fff0bd",
    description: "Golden fries with a crispy outside and soft centre.",
  },
  {
    id: 6,
    name: "Fresh Veggie Salad",
    restaurant: "Green Bowl",
    price: 179,
    rating: 4.3,
    category: "Healthy",
    emoji: "🥗",
    color: "#e4f3dc",
    description: "Fresh greens, crunchy vegetables and light dressing.",
  },
];

export default function Wishlist() {
  const { addToCart } = useCart();

  const [wishlist, setWishlist] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("quickbite-wishlist") || "[]"
      );

      const validItems = Array.isArray(saved)
        ? saved.filter(
            (item) =>
              item &&
              (typeof item.id === "string" ||
                typeof item.id === "number")
          )
        : [];

      setWishlist(validItems);
    } catch {
      setWishlist([]);
    }
  }, []);

  function saveWishlist(updatedWishlist) {
    setWishlist(updatedWishlist);

    try {
      localStorage.setItem(
        "quickbite-wishlist",
        JSON.stringify(updatedWishlist)
      );
    } catch {
      setToast("Unable to save your wishlist.");
    }
  }

  function removeFromWishlist(foodId) {
    const updated = wishlist.filter(
      (food) => String(food.id) !== String(foodId)
    );

    saveWishlist(updated);
    setToast("Removed from your wishlist.");
  }

  function addFoodToCart(food) {
    addToCart({
      ...food,
      id: food.id,
      name: food.name,
      price: Number(food.price),
    });

    setToast(`${food.name} added to your cart!`);
  }

  function addAllToCart() {
    if (filteredFoods.length === 0) {
      setToast("No food items to add.");
      return;
    }

    filteredFoods.forEach((food) => {
      addToCart({
        ...food,
        id: food.id,
        name: food.name,
        price: Number(food.price),
      });
    });

    setToast(`${filteredFoods.length} items added to your cart!`);
  }

  const enrichedWishlist = wishlist.map((food) => {
    const defaultFood = defaultFoods.find(
      (item) => String(item.id) === String(food.id)
    );

    return {
      ...defaultFood,
      ...food,
      price: Number(food.price ?? defaultFood?.price ?? 0),
    };
  });

  const categories = [
    "All",
    ...new Set(
      enrichedWishlist.map((food) => food.category || "Other")
    ),
  ];

  let filteredFoods = enrichedWishlist.filter((food) => {
    const matchesCategory =
      filter === "All" || (food.category || "Other") === filter;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      food.name?.toLowerCase().includes(query) ||
      food.restaurant?.toLowerCase().includes(query) ||
      food.category?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  if (sortBy === "price-low") {
    filteredFoods = [...filteredFoods].sort(
      (a, b) => a.price - b.price
    );
  } else if (sortBy === "price-high") {
    filteredFoods = [...filteredFoods].sort(
      (a, b) => b.price - a.price
    );
  } else if (sortBy === "rating") {
    filteredFoods = [...filteredFoods].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <section style={styles.hero}>
          <div>
            <span style={styles.eyebrow}>YOUR PERSONAL COLLECTION</span>
            <h1>
              Your Wishlist <span>♡</span>
            </h1>
            <p>
              All your cravings, saved in one delicious place.
            </p>

            <div style={styles.stats}>
              <div style={styles.stat}>
                <strong>{wishlist.length}</strong>
                <span>Saved items</span>
              </div>

              <div style={styles.statDivider} />

              <div style={styles.stat}>
                <strong>
                  ₹
                  {wishlist
                    .reduce(
                      (total, food) =>
                        total + Number(food.price || 0),
                      0
                    )
                    .toLocaleString("en-IN")}
                </strong>
                <span>Total item value</span>
              </div>
            </div>
          </div>

          <div style={styles.heroEmoji}>❤️</div>
        </section>

        <section style={styles.toolbar}>
          <div style={styles.toolbarTop}>
            <div>
              <h2>Saved favourites</h2>
              <p>
                {filteredFoods.length}{" "}
                {filteredFoods.length === 1 ? "item" : "items"} found
              </p>
            </div>

            {wishlist.length > 0 && (
              <button
                type="button"
                onClick={addAllToCart}
                style={styles.addAllButton}
              >
                🛒 Add visible items to cart
              </button>
            )}
          </div>

          <div style={styles.controls}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search saved food..."
              aria-label="Search wishlist"
              style={styles.searchInput}
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter by category"
              style={styles.select}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All categories" : category}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort wishlist"
              style={styles.select}
            >
              <option value="default">Recently saved</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </section>

        {filteredFoods.length > 0 ? (
          <section style={styles.grid}>
            {filteredFoods.map((food) => (
              <article key={food.id} style={styles.card}>
                <div
                  style={{
                    ...styles.foodImage,
                    background: food.color || "#fff0e6",
                  }}
                >
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                      style={styles.image}
                    />
                  ) : (
                    <span style={styles.foodEmoji}>
                      {food.emoji || "🍽️"}
                    </span>
                  )}

                  <span style={styles.categoryBadge}>
                    {food.category || "Favourite"}
                  </span>

                  <button
                    type="button"
                    aria-label={`Remove ${food.name} from wishlist`}
                    title="Remove from wishlist"
                    onClick={() => removeFromWishlist(food.id)}
                    style={styles.heartButton}
                  >
                    ♥
                  </button>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.foodTitleRow}>
                    <h3>{food.name}</h3>
                    <span style={styles.rating}>
                      ★ {food.rating || "4.5"}
                    </span>
                  </div>

                  <p style={styles.restaurant}>
                    📍 {food.restaurant || "QuickBite Restaurant"}
                  </p>

                  <p style={styles.description}>
                    {food.description || "A delicious favourite, saved just for you."}
                  </p>

                  <div style={styles.cardFooter}>
                    <strong style={styles.price}>
                      ₹{food.price.toLocaleString("en-IN")}
                    </strong>

                    <button
                      type="button"
                      onClick={() => addFoodToCart(food)}
                      style={styles.addButton}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section style={styles.emptyState}>
            <div style={styles.emptyEmoji}>
              {wishlist.length === 0 ? "♡" : "🔎"}
            </div>

            <h2>
              {wishlist.length === 0
                ? "Your wishlist is waiting!"
                : "No matching favourites"}
            </h2>

            <p>
              {wishlist.length === 0
                ? "Explore delicious food and tap the heart icon to save your favourites here."
                : "Try another search term or choose a different category."}
            </p>

            <a href="/restaurants" style={styles.exploreButton}>
              Explore restaurants →
            </a>
          </section>
        )}

        <section style={styles.bottomBanner}>
          <div>
            <h2>Something delicious is calling.</h2>
            <p>Find your next favourite meal on QuickBite.</p>
          </div>

          <a href="/restaurants" style={styles.bannerButton}>
            Explore food →
          </a>
        </section>
      </main>

      {toast && (
        <div role="status" style={styles.toast}>
          <span>✓</span> {toast}
          <button
            type="button"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
            style={styles.toastClose}
          >
            ×
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fffaf6",
    color: "#29231f",
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "35px 24px 70px",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    padding: "38px clamp(22px, 5vw, 55px)",
    borderRadius: 22,
    background: "#fff0e6",
  },
  eyebrow: {
    color: "#df5a29",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.5,
  },
  stats: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    marginTop: 28,
  },
  stat: {
    display: "grid",
    gap: 5,
  },
  statDivider: {
    width: 1,
    height: 35,
    background: "#e9d4c6",
  },
  heroEmoji: {
    display: "grid",
    placeItems: "center",
    width: 130,
    height: 130,
    flexShrink: 0,
    borderRadius: "50%",
    background: "#ffe0d0",
    fontSize: 64,
  },
  toolbar: {
    margin: "35px 0 25px",
  },
  toolbarTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 20,
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  searchInput: {
    flex: "1 1 230px",
    minWidth: 0,
    padding: "13px 15px",
    border: "1px solid #e9ded5",
    borderRadius: 10,
    background: "#fff",
    fontSize: 12,
  },
  select: {
    flex: "0 1 175px",
    minWidth: 0,
    padding: "13px 12px",
    border: "1px solid #e9ded5",
    borderRadius: 10,
    background: "#fff",
    color: "#514740",
    fontSize: 12,
  },
  addAllButton: {
    padding: "12px 17px",
    border: 0,
    borderRadius: 10,
    background: "#ff6b35",
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 255px), 1fr))",
    gap: 22,
  },
  card: {
    overflow: "hidden",
    border: "1px solid #f0e6df",
    borderRadius: 17,
    background: "#fff",
    boxShadow: "0 5px 18px rgba(70, 40, 20, 0.035)",
  },
  foodImage: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    height: 185,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  foodEmoji: {
    fontSize: 83,
  },
  categoryBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    padding: "6px 9px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.92)",
    color: "#59473c",
    fontSize: 10,
    fontWeight: 800,
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    display: "grid",
    placeItems: "center",
    width: 36,
    height: 36,
    border: 0,
    borderRadius: "50%",
    background: "#fff",
    color: "#e84c4c",
    fontSize: 20,
    cursor: "pointer",
  },
  cardBody: {
    padding: 17,
  },
  foodTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  rating: {
    flexShrink: 0,
    color: "#b57810",
    fontSize: 11,
    fontWeight: 800,
  },
  restaurant: {
    margin: "9px 0",
    color: "#84776f",
    fontSize: 11,
  },
  description: {
    minHeight: 36,
    color: "#756a63",
    fontSize: 11,
    lineHeight: 1.7,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    paddingTop: 14,
    marginTop: 12,
    borderTop: "1px solid #f3ebe5",
  },
  price: {
    fontSize: 19,
    fontWeight: 900,
  },
  addButton: {
    padding: "10px 17px",
    border: "1px solid #ff6b35",
    borderRadius: 9,
    background: "#fff",
    color: "#e85b2a",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  emptyState: {
    padding: "65px 20px",
    border: "1px dashed #e8d8cc",
    borderRadius: 20,
    background: "#fff",
    textAlign: "center",
  },
  emptyEmoji: {
    marginBottom: 15,
    color: "#ff6b35",
    fontSize: 65,
  },
  exploreButton: {
    display: "inline-block",
    marginTop: 15,
    padding: "13px 20px",
    borderRadius: 10,
    background: "#ff6b35",
    color: "#fff",
    fontSize: 12,
    fontWeight: 900,
    textDecoration: "none",
  },
  bottomBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 40,
    padding: "27px 30px",
    borderRadius: 16,
    background: "#30251f",
    color: "#fff",
  },
  bannerButton: {
    padding: "12px 17px",
    borderRadius: 9,
    background: "#ff6b35",
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
    textDecoration: "none",
  },
  toast: {
    position: "fixed",
    right: 20,
    bottom: 20,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: 10,
    maxWidth: "calc(100vw - 40px)",
    padding: "15px 18px",
    borderRadius: 12,
    background: "#30251f",
    color: "#fff",
    fontSize: 12,
    boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
  },
  toastClose: {
    border: 0,
    background: "transparent",
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
  },
};
