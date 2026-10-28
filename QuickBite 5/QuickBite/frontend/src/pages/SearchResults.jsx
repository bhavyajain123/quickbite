
import React, { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FoodCard from "../components/FoodCard";

const foodItems = [
  {
    id: 301,
    name: "Margherita Pizza",
    description: "Classic cheese, tomato sauce and fresh basil.",
    category: "Pizza",
    price: 249,
    originalPrice: 329,
    rating: 4.8,
    reviews: 284,
    deliveryTime: "25 min",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=700&q=80",
    isVeg: true,
    isBestseller: true,
    discount: "24% OFF",
  },
  {
    id: 302,
    name: "Classic Smash Burger",
    description: "Juicy patty, melted cheese and house sauce.",
    category: "Burger",
    price: 199,
    originalPrice: 259,
    rating: 4.7,
    reviews: 196,
    deliveryTime: "20 min",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    isVeg: false,
    discount: "23% OFF",
  },
  {
    id: 303,
    name: "Hyderabadi Biryani",
    description: "Aromatic basmati rice with authentic spices.",
    category: "Biryani",
    price: 279,
    originalPrice: 349,
    rating: 4.8,
    reviews: 312,
    deliveryTime: "30 min",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=700&q=80",
    isVeg: false,
    discount: "20% OFF",
  },
  {
    id: 304,
    name: "Veg Hakka Noodles",
    description: "Wok-tossed noodles with crunchy vegetables.",
    category: "Chinese",
    price: 169,
    originalPrice: 219,
    rating: 4.5,
    reviews: 143,
    deliveryTime: "25 min",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80",
    isVeg: true,
    discount: "22% OFF",
  },
  {
    id: 305,
    name: "Garden Fresh Bowl",
    description: "Fresh greens, avocado and a zesty dressing.",
    category: "Healthy",
    price: 189,
    originalPrice: 229,
    rating: 4.6,
    reviews: 98,
    deliveryTime: "15 min",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
    isVeg: true,
    discount: "17% OFF",
  },
  {
    id: 306,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten centre.",
    category: "Desserts",
    price: 129,
    originalPrice: 159,
    rating: 4.9,
    reviews: 205,
    deliveryTime: "20 min",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80",
    isVeg: true,
    discount: "19% OFF",
  },
];

const categories = [
  "All",
  "Pizza",
  "Burger",
  "Biryani",
  "Chinese",
  "Healthy",
  "Desserts",
];

export default function SearchResults() {
  const { addToCart } = useCart();

  const [query, setQuery] = useState(
    new URLSearchParams(window.location.search).get("q") || ""
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [message, setMessage] = useState("");

  const results = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    let filtered = foodItems.filter((food) => {
      const matchesSearch =
        !searchTerm ||
        food.name.toLowerCase().includes(searchTerm) ||
        food.description.toLowerCase().includes(searchTerm) ||
        food.category.toLowerCase().includes(searchTerm);

      const matchesCategory =
        activeCategory === "All" || food.category === activeCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [query, activeCategory, sortBy]);

  function handleSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());

    window.history.replaceState(
      {},
      "",
      `/search${params.toString() ? `?${params.toString()}` : ""}`
    );
  }

  function handleAddToCart(food) {
    addToCart(food);
    setMessage(`${food.name} added to your cart!`);
    window.setTimeout(() => setMessage(""), 2200);
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.container}>
        <p style={styles.eyebrow}>DISCOVER SOMETHING DELICIOUS</p>
        <h1 style={styles.title}>Search results</h1>
        <p style={styles.subtitle}>
          Find dishes for every craving, mood and budget.
        </p>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <span style={{ fontSize: 20 }}>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try pizza, biryani, burgers..."
            aria-label="Search dishes"
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            Search
          </button>
        </form>

        <div style={styles.categoryList}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              style={{
                ...styles.categoryButton,
                ...(activeCategory === category
                  ? styles.activeCategory
                  : {}),
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div style={styles.resultsToolbar}>
          <div>
            <h2 style={styles.resultsTitle}>
              {query.trim() ? `Results for "${query}"` : "Popular dishes"}
            </h2>
            <p style={styles.resultCount}>
              {results.length} dishes found
            </p>
          </div>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort food results"
            style={styles.sortSelect}
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Highest rated</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>

        <div style={styles.grid}>
          {results.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onAddToCart={handleAddToCart}
              onToggleWishlist={() => {
                setMessage("Wishlist integration will be connected next.");
                window.setTimeout(() => setMessage(""), 2200);
              }}
              isWishlisted={false}
            />
          ))}
        </div>

        {results.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 48 }}>🔎</div>
            <h2>No dishes found</h2>
            <p>Try another keyword or clear your filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory("All");
                setSortBy("recommended");
              }}
              style={styles.searchButton}
            >
              Clear search
            </button>
          </div>
        )}

        {message && (
          <div role="status" style={styles.toast}>
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            window.location.href = "/cart";
          }}
          style={styles.cartButton}
        >
          🛒 View cart
        </button>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fffdfb",
    color: "#29231f",
    fontFamily: "'DM Sans', sans-serif",
  },
  container: {
    width: "min(1180px, 92%)",
    margin: "0 auto",
    padding: "45px 0 80px",
  },
  eyebrow: {
    color: "#ff6b35",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.8,
  },
  title: {
    fontSize: "clamp(32px, 4vw, 44px)",
    letterSpacing: -1.5,
    margin: "10px 0",
  },
  subtitle: {
    color: "#81766f",
    fontSize: 14,
  },
  searchForm: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 9px 8px 16px",
    marginTop: 25,
    maxWidth: 650,
    background: "#fff",
    border: "1px solid #eee0d6",
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    width: 0,
    minWidth: 0,
    padding: "11px 0",
    border: 0,
    outline: "none",
    background: "transparent",
    fontSize: 13,
  },
  searchButton: {
    padding: "12px 17px",
    border: 0,
    borderRadius: 10,
    background: "#ff6b35",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  categoryList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 9,
    margin: "24px 0 32px",
  },
  categoryButton: {
    padding: "10px 15px",
    border: "1px solid #eee0d6",
    borderRadius: 25,
    background: "#fff",
    color: "#554c46",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  activeCategory: {
    background: "#fff0e7",
    color: "#e95220",
    borderColor: "#ffb28e",
  },
  resultsToolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    flexWrap: "wrap",
    marginBottom: 23,
  },
  resultsTitle: {
    margin: 0,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  resultCount: {
    margin: "7px 0 0",
    color: "#81766f",
    fontSize: 12,
  },
  sortSelect: {
    padding: "12px",
    border: "1px solid #eee0d6",
    borderRadius: 10,
    background: "#fff",
    color: "#554c46",
    outlineColor: "#ff6b35",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))",
    gap: 20,
  },
  empty: {
    padding: "50px 20px",
    textAlign: "center",
    background: "#fff",
    border: "1px dashed #e8d8cc",
    borderRadius: 18,
    color: "#81766f",
  },
  toast: {
    position: "fixed",
    zIndex: 1000,
    bottom: 85,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "14px 20px",
    background: "#29231f",
    color: "#fff",
    borderRadius: 12,
    fontSize: 13,
    maxWidth: "90%",
  },
  cartButton: {
    position: "fixed",
    right: 20,
    bottom: 20,
    zIndex: 999,
    padding: "15px 20px",
    border: 0,
    borderRadius: 13,
    background: "#ff6b35",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 25px #ff6b3540",
  },
};
