
import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getRestaurant, getFoods, getRestaurantReviews, createReview, deleteMyReview } from "../api";

const FALLBACK_IMG =
  "https://placehold.co/600x400/f3f4f6/9ca3af?text=QuickBite";


  export default function RestaurantDetails() {
  const { addToCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
const [reviewRating, setReviewRating] = useState(5);
const [reviewComment, setReviewComment] = useState("");
const [reviewLoading, setReviewLoading] = useState(false);
const [reviewError, setReviewError] = useState("");
const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurantData() {
      try {
        setLoading(true);
        setError("");

        const restaurantId = window.location.pathname
          .replace(/\/+$/, "")
          .split("/")
          .pop();

        const [restaurantData, foodData] = await Promise.all([
          getRestaurant(restaurantId),
          getFoods(restaurantId),
        ]);

        if (!cancelled) {
          setRestaurant(restaurantData);
          setMenuItems(foodData);
          loadReviews(restaurantData._id || restaurantData.id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Restaurant data load nahi ho saka.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRestaurantData();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category || "Popular")),
  ];

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter(
          (item) => (item.category || "Popular") === activeCategory
        );

  function handleAdd(item) {
    addToCart(item);
    setMessage(`${item.name} added to your cart!`);
    window.setTimeout(() => setMessage(""), 2200);
  }
  async function loadReviews(restaurantId) {
  try {
    const data = await getRestaurantReviews(restaurantId);
    setReviews(data.reviews || []);
  } catch (err) {
    setReviewError(err.message || "Reviews load nahi ho sake.");
  }
}

async function handleReviewSubmit(event) {
  event.preventDefault();
  setReviewError("");
  setReviewMessage("");

  if (!restaurant?._id) {
    setReviewError("Restaurant ka valid database ID nahi mila.");
    return;
  }

  setReviewLoading(true);

  try {
    await createReview({
      restaurant: restaurant._id,
      rating: Number(reviewRating),
      comment: reviewComment.trim(),
    });

    setReviewComment("");
    setReviewRating(5);
    setReviewMessage("Your review was submitted successfully!");

    await loadReviews(restaurant._id);
  } catch (err) {
    setReviewError(err.message || "Review submit nahi ho saka.");
  } finally {
    setReviewLoading(false);
  }
}

async function handleReviewDelete(reviewId) {
  setReviewError("");
  setReviewMessage("");

  try {
    await deleteMyReview(reviewId);
    setReviewMessage("Your review has been deleted successfully.");

    if (restaurant?._id) {
      await loadReviews(restaurant._id);
    }
  } catch (err) {
    setReviewError(err.message || "Review delete nahi ho saka.");
  }
}
 

  return (
  <div style={styles.page}>
    <Navbar />

    <main style={styles.container}>
      {loading && <p>Restaurant menu load ho raha hai...</p>}

      {!loading && error && (
        <p role="alert" style={{ color: "#d64545" }}>
          {error}
        </p>
      )}

      {!loading && !error && !restaurant && (
        <p>Restaurant nahi mila.</p>
      )}

      {!loading && !error && restaurant && (
        <>
          <button
            type="button"
            onClick={() => window.history.back()}
            style={styles.backButton}
          >
            ← Back
          </button>

          <section style={styles.hero}>
    <img
  src={restaurant.image || FALLBACK_IMG}
  alt={restaurant.name || "Restaurant"}
  style={styles.heroImage}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMG;
  }}
/>

          <div style={styles.heroContent}>
            <span style={styles.eyebrow}>QUICKBITE RESTAURANT</span>
            <h1>{restaurant.name}</h1>
            <p style={styles.cuisine}>{restaurant.cuisine}</p>

            <div style={styles.stats}>
              <span>⭐ {restaurant.rating}</span>
              <span>🛵 {restaurant.deliveryTime}</span>
              <span>₹{restaurant.priceForTwo} for two</span>
            </div>

            <p style={styles.offer}>
              🎉 Special offers available on selected dishes
            </p>
          </div>
        </section>

        <section style={styles.menuSection}>
          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.eyebrow}>MADE FRESH FOR YOU</span>
              <h2>Explore the menu</h2>
              <p>Choose your favourites and add them to your cart.</p>
            </div>
          </div>

          <div style={styles.filters}>
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  ...styles.filterButton,
                  ...(activeCategory === category
                    ? styles.activeFilter
                    : {}),
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div style={styles.menuGrid}>
            {filteredItems.map((item) => (
              <article key={item.id} style={styles.foodCard}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={styles.foodImage}
                />

                <div style={styles.foodContent}>
                  <div style={styles.foodTitleRow}>
                    <span
                      style={{
                        ...styles.vegIndicator,
                        borderColor: item.isVeg ? "#16834a" : "#d64545",
                      }}
                    >
                      <span
                        style={{
                          ...styles.vegDot,
                          background: item.isVeg ? "#16834a" : "#d64545",
                        }}
                      />
                    </span>

                    <span style={styles.categoryTag}>{item.category}</span>
                  </div>

                  <h3 style={styles.foodName}>{item.name}</h3>
                  <p style={styles.foodDescription}>{item.description}</p>

                  <div style={styles.foodBottom}>
                    <strong style={styles.price}>₹{item.price}</strong>

                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      style={styles.addButton}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

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
        </section>
        
        <section style={styles.menuSection}>
          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.eyebrow}>CUSTOMER FEEDBACK</span>
              <h2>Reviews & Ratings</h2>
              <p>Real feedback from QuickBite customers.</p>
            </div>
          </div>

          <form onSubmit={handleReviewSubmit} style={{ marginBottom: 28 }}>
            <label style={{ display: "block", marginBottom: 8 }}>
              Your rating
            </label>

            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(Number(e.target.value))}
              style={{ padding: 10, borderRadius: 8, marginBottom: 12 }}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {"★".repeat(rating)} ({rating}/5)
                </option>
              ))}
            </select>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience..."
              maxLength={1000}
              rows={4}
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #eee0d6",
                marginBottom: 12,
              }}
            />

            <button
              type="submit"
              disabled={reviewLoading}
              style={styles.addButton}
            >
              {reviewLoading ? "Submitting..." : "Submit review"}
            </button>
          </form>

          {reviewError && (
            <p role="alert" style={{ color: "#d64545" }}>
              {reviewError}
            </p>
          )}

          {reviewMessage && (
            <p role="status" style={{ color: "#16834a" }}>
              {reviewMessage}
            </p>
          )}

          {reviews.length === 0 && (
            <p>No reviews yet. Be the first to share your experience!</p>
          )}

          {reviews.map((review) => (
            <article
              key={review._id}
              style={{
                padding: 16,
                marginBottom: 12,
                background: "#fff",
                border: "1px solid #f0e7e0",
                borderRadius: 12,
              }}
            >
              <strong>
                {review.customer?.name || "QuickBite customer"}
              </strong>

              <p style={{ margin: "8px 0", color: "#e95220" }}>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
                <span style={{ color: "#81766f" }}>
                  {" "}({review.rating}/5)
                </span>
              </p>

              <p>{review.comment || "No comment provided."}</p>

              {review.customer?._id && (
                <button
                  type="button"
                  onClick={() => handleReviewDelete(review._id)}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#d64545",
                    cursor: "pointer",
                  }}
                >
                  Delete my review
                </button>
              )}
            </article>
          ))}
        </section>

        </>
      )}
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
    maxWidth: 1180,
    margin: "0 auto",
    padding: "30px 24px 75px",
  },
  backButton: {
    padding: "10px 14px",
    marginBottom: 20,
    border: "1px solid #eee0d6",
    borderRadius: 10,
    background: "#fff",
    color: "#554c46",
    fontWeight: 700,
    cursor: "pointer",
  },
  hero: {
    overflow: "hidden",
    background: "#fff",
    border: "1px solid #f0e7e0",
    borderRadius: 22,
  },
  heroImage: {
    width: "100%",
    height: 270,
    objectFit: "cover",
    display: "block",
  },
  heroContent: {
    padding: "25px 28px",
  },
  eyebrow: {
    color: "#ff6b35",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.8,
  },
  cuisine: {
    color: "#81766f",
    fontSize: 14,
  },
  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 18,
    fontSize: 13,
    fontWeight: 700,
  },
  offer: {
    padding: 13,
    marginTop: 20,
    background: "#fff0e7",
    color: "#d95121",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
  },
  menuSection: {
    paddingTop: 45,
  },
  sectionHeading: {
    marginBottom: 20,
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  filterButton: {
    padding: "10px 16px",
    border: "1px solid #eee0d6",
    borderRadius: 30,
    background: "#fff",
    color: "#554c46",
    fontWeight: 700,
    cursor: "pointer",
  },
  activeFilter: {
    background: "#fff0e7",
    color: "#e95220",
    borderColor: "#ffb28e",
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))",
    gap: 20,
  },
  foodCard: {
    overflow: "hidden",
    border: "1px solid #f0e7e0",
    borderRadius: 18,
    background: "#fff",
  },
  foodImage: {
    display: "block",
    width: "100%",
    height: 175,
    objectFit: "cover",
  },
  foodContent: {
    padding: 17,
  },
  foodTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vegIndicator: {
    width: 16,
    height: 16,
    border: "1px solid",
    display: "grid",
    placeItems: "center",
    borderRadius: 3,
  },
  vegDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
  },
  categoryTag: {
    padding: "5px 9px",
    borderRadius: 20,
    background: "#fff0e7",
    color: "#d95121",
    fontSize: 10,
    fontWeight: 700,
  },
  foodName: {
    fontSize: 16,
    margin: "14px 0 8px",
  },
  foodDescription: {
    minHeight: 38,
    color: "#81766f",
    fontSize: 12,
    lineHeight: 1.6,
  },
  foodBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  price: {
    fontSize: 17,
  },
  addButton: {
    border: "1px solid #ff6b35",
    borderRadius: 9,
    padding: "9px 15px",
    background: "#fff",
    color: "#e95220",
    fontWeight: 800,
    cursor: "pointer",
  },
  toast: {
    position: "fixed",
    bottom: 85,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    padding: "14px 20px",
    borderRadius: 12,
    background: "#29231f",
    color: "#fff",
    fontSize: 13,
  },
  cartButton: {
    position: "fixed",
    bottom: 20,
    right: 20,
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
