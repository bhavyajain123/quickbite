import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { getFoods } from "../api";
import { getCravingRecommendations } from "../services/aiService";

const foodDatabase = [
  {
    id: 101,
    name: "Classic Cheeseburger",
    restaurant: "Burger House",
    price: 199,
    rating: 4.7,
    category: "Fast Food",
    emoji: "🍔",
    color: "#fff0df",
    calories: 420,
    moods: ["comfort", "hungry", "treat"],
    diet: "non-veg",
    spice: "medium",
    description: "Juicy burger with cheese and fresh vegetables.",
    tags: ["Popular", "Comfort Food"],
  },
  {
    id: 102,
    name: "Margherita Pizza",
    restaurant: "Pizza Studio",
    price: 249,
    rating: 4.6,
    category: "Fast Food",
    emoji: "🍕",
    color: "#ffe6d5",
    calories: 380,
    moods: ["comfort", "sharing", "treat"],
    diet: "veg",
    spice: "mild",
    description: "Classic pizza topped with cheese and basil.",
    tags: ["Best Seller", "Cheesy"],
  },
  {
    id: 103,
    name: "Paneer Tikka Wrap",
    restaurant: "Desi Bites",
    price: 179,
    rating: 4.5,
    category: "Indian",
    emoji: "🌯",
    color: "#ffedcf",
    calories: 320,
    moods: ["hungry", "comfort"],
    diet: "veg",
    spice: "medium",
    description: "Grilled paneer, crunchy veggies and mint chutney.",
    tags: ["Protein Rich", "Indian Favourite"],
  },
  {
    id: 104,
    name: "Fresh Green Salad",
    restaurant: "Green Bowl",
    price: 159,
    rating: 4.4,
    category: "Healthy",
    emoji: "🥗",
    color: "#e4f3dc",
    calories: 180,
    moods: ["healthy", "light"],
    diet: "veg",
    spice: "mild",
    description: "Fresh greens with a light and refreshing dressing.",
    tags: ["Fresh", "Light Meal"],
  },
  {
    id: 105,
    name: "Chocolate Brownie",
    restaurant: "Sweet Treats",
    price: 129,
    rating: 4.8,
    category: "Dessert",
    emoji: "🍫",
    color: "#f5e1d6",
    calories: 290,
    moods: ["treat", "comfort"],
    diet: "veg",
    spice: "mild",
    description: "Rich chocolate brownie for a sweet little break.",
    tags: ["Sweet Craving", "Top Rated"],
  },
  {
    id: 106,
    name: "Spicy Chicken Burger",
    restaurant: "Burger House",
    price: 229,
    rating: 4.6,
    category: "Fast Food",
    emoji: "🍔",
    color: "#ffe1d5",
    calories: 460,
    moods: ["hungry", "adventure", "comfort"],
    diet: "non-veg",
    spice: "hot",
    description: "Crispy chicken with a bold and spicy sauce.",
    tags: ["Spicy", "Crispy"],
  },
  {
    id: 107,
    name: "Veg Hakka Noodles",
    restaurant: "Wok Express",
    price: 189,
    rating: 4.3,
    category: "Chinese",
    emoji: "🍜",
    color: "#fff0cb",
    calories: 350,
    moods: ["hungry", "adventure", "comfort"],
    diet: "veg",
    spice: "hot",
    description: "Stir-fried noodles with vegetables and Asian sauces.",
    tags: ["Street Food", "Spicy"],
  },
  {
    id: 108,
    name: "Creamy White Pasta",
    restaurant: "Pasta Corner",
    price: 229,
    rating: 4.5,
    category: "Italian",
    emoji: "🍝",
    color: "#fff0d4",
    calories: 410,
    moods: ["comfort", "treat"],
    diet: "veg",
    spice: "mild",
    description: "Creamy pasta with herbs and a rich sauce.",
    tags: ["Creamy", "Comfort Food"],
  },
  {
    id: 109,
    name: "Dal Makhani & Rice",
    restaurant: "Desi Bites",
    price: 219,
    rating: 4.7,
    category: "Indian",
    emoji: "🍛",
    color: "#f7e5d1",
    calories: 390,
    moods: ["comfort", "hungry"],
    diet: "veg",
    spice: "medium",
    description: "A hearty Indian meal with creamy dal and rice.",
    tags: ["Indian Favourite", "Filling"],
  },
  {
    id: 110,
    name: "Fruit Yogurt Bowl",
    restaurant: "Green Bowl",
    price: 139,
    rating: 4.3,
    category: "Healthy",
    emoji: "🍓",
    color: "#fce5eb",
    calories: 210,
    moods: ["healthy", "light"],
    diet: "veg",
    spice: "mild",
    description: "A refreshing bowl with yogurt and fresh fruits.",
    tags: ["Fresh", "Light Meal"],
  },
  {
    id: 111,
    name: "Chicken Biryani",
    restaurant: "Desi Bites",
    price: 269,
    rating: 4.8,
    category: "Indian",
    emoji: "🍚",
    color: "#f8e4c8",
    calories: 520,
    moods: ["hungry", "adventure", "comfort"],
    diet: "non-veg",
    spice: "hot",
    description: "Aromatic rice with spices and tender chicken.",
    tags: ["Best Seller", "Full Meal"],
  },
  {
    id: 112,
    name: "Chocolate Milkshake",
    restaurant: "Sweet Treats",
    price: 149,
    rating: 4.5,
    category: "Drinks",
    emoji: "🥤",
    color: "#f2e2d7",
    calories: 310,
    moods: ["treat", "comfort"],
    diet: "veg",
    spice: "mild",
    description: "A thick chocolate shake for your sweet cravings.",
    tags: ["Sweet Craving", "Chilled"],
  },
];

const initialPreferences = {
  mood: "hungry",
  diet: "all",
  budget: "300",
  spice: "any",
};

const moodOptions = [
  { value: "hungry", emoji: "🤤", label: "Super hungry" },
  { value: "comfort", emoji: "😌", label: "Comfort food" },
  { value: "healthy", emoji: "🥗", label: "Eat lighter" },
  { value: "treat", emoji: "🍰", label: "Treat myself" },
  { value: "adventure", emoji: "🌶️", label: "Try something new" },
  { value: "light", emoji: "🌿", label: "Something light" },
];

export default function AIRecommendations() {
  const { addToCart } = useCart();
  const [apiFoods, setApiFoods] = useState([]);
const [foodsLoading, setFoodsLoading] = useState(true);
const [foodsError, setFoodsError] = useState("");

useEffect(() => {
  let cancelled = false;

  async function loadFoods() {
    try {
      const foods = await getFoods();

      if (!cancelled) {
        setApiFoods(foods.filter((food) => food.isAvailable !== false));
      }
    } catch (error) {
      if (!cancelled) {
        setFoodsError(error.message || "Menu load nahi ho saka.");
      }
    } finally {
      if (!cancelled) {
        setFoodsLoading(false);
      }
    }
  }

  loadFoods();

  return () => {
    cancelled = true;
  };
}, []);

  const [preferences, setPreferences] = useState(initialPreferences);
  const [submittedPreferences, setSubmittedPreferences] =
    useState(initialPreferences);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [toast, setToast] = useState("");
  const [aiFoods, setAiFoods] = useState([]);
const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState("");


const recommendations = useMemo(() => {
  if (aiFoods.length > 0) {
    return aiFoods;
  }

  const budget = Number(submittedPreferences.budget);
  const sourceFoods = apiFoods.length > 0 ? apiFoods : foodDatabase;

  return sourceFoods
    .map((food) => {
      const rating = Number(food.rating) || 4;
      const price = Number(food.price) || 0;
      const name = food.name || "Food item";

      const details = `${name} ${food.category || ""} ${
        food.description || ""
      }`.toLowerCase();

      let score = rating * 10;
      const reasons = [];

      const hasMoodData = Array.isArray(food.moods);
      const hasDietData = Boolean(food.diet);
      const hasSpiceData = Boolean(food.spice);

      if (hasMoodData) {
        if (food.moods.includes(submittedPreferences.mood)) {
          score += 25;
          reasons.push("Matches your mood");
        } else {
          score -= 10;
        }
      } else if (
        submittedPreferences.mood === "hungry" ||
        submittedPreferences.mood === "comfort"
      ) {
        if (/burger|pizza|biryani|rice|thali|pasta|meal/.test(details)) {
          score += 10;
          reasons.push("Good for your craving");
        }
      }

      if (submittedPreferences.diet !== "all") {
        if (hasDietData) {
          if (food.diet === submittedPreferences.diet) {
            score += 15;
            reasons.push("Matches your food preference");
          } else {
            score -= 100;
          }
        } else {
          const clearlyNonVeg =
            /chicken|mutton|fish|prawn|shrimp|meat|keema|non.?veg/.test(
              details
            );

          const clearlyVeg =
            /paneer|vegetarian|veg\b|dal|lentil|aloo|potato|mushroom/.test(
              details
            );

          if (
            submittedPreferences.diet === "veg" &&
            clearlyNonVeg
          ) {
            score -= 100;
          } else if (
            submittedPreferences.diet === "non-veg" &&
            clearlyVeg &&
            !clearlyNonVeg
          ) {
            score -= 100;
          }
        }
      }

      if (price <= budget) {
        score += 20;
        reasons.push("Within your budget");
      } else {
        score = -100;
      }

      if (
        hasSpiceData &&
        submittedPreferences.spice !== "any"
      ) {
        if (food.spice === submittedPreferences.spice) {
          score += 10;
          reasons.push("Matches your spice preference");
        } else {
          score -= 15;
        }
      }

      return {
        ...food,
        id: food.id || food._id || name,
        rating,
        price,
        score,
        reasons: reasons.slice(0, 2),
      };
    })
    .filter((food) => food.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}, [submittedPreferences, apiFoods, aiFoods]);



function updatePreference(name, value) {
  setPreferences((previous) => ({
    ...previous,
    [name]: value,
  }));
}

async function generateRecommendations(event) {
  event.preventDefault();

  const selectedPreferences = { ...preferences };

  setSubmittedPreferences(selectedPreferences);
  setHasGenerated(true);
  setAiFoods([]);
  setAiError("");
  setAiLoading(true);

  try {
    const result = await getCravingRecommendations({
      mood: selectedPreferences.mood,
      budget: Number(selectedPreferences.budget),
      isVeg:
        selectedPreferences.diet === "all"
          ? null
          : selectedPreferences.diet === "veg",
      favoriteCategories: [],
      previousOrders: [],
      limit: 6,
    });

    const items = Array.isArray(result)
      ? result
      : result.recommendations ||
        result.foods ||
        result.items ||
        result.data?.recommendations ||
        result.data?.foods ||
        result.data?.items ||
        [];

    if (Array.isArray(items) && items.length > 0) {
      const normalizedFoods = items.map((food) => ({
        ...food,
        id: food.id || food._id || food.name,
        name: food.name || food.title || "Food item",
        price: Number(food.price) || 0,
        rating: Number(food.rating) || 4,
        restaurant:
          typeof food.restaurant === "object"
            ? food.restaurant?.name
            : food.restaurant || "QuickBite Restaurant",
        description: food.description || "Recommended for your preferences.",
        emoji: food.emoji || "🍽️",
        tags: Array.isArray(food.tags) ? food.tags : [],
        calories: food.calories || 0,
        reasons: Array.isArray(food.reasons)
          ? food.reasons
          : ["Recommended for your preferences"],
      }));

      setAiFoods(normalizedFoods);
    } else {
      setAiError(
        "Backend returned no recommendations. Showing local recommendations instead."
      );
    }
  } catch (error) {
    setAiError(
      error.message ||
        "AI service unavailable. Showing local recommendations instead."
    );
  } finally {
    setAiLoading(false);
  }
}


  function addFood(food) {
    addToCart({
      ...food,
      id: food.id,
      name: food.name,
      price: Number(food.price),
    });

    setToast(`${food.name} added to your cart!`);
  }

  function toggleWishlist(food) {
    let currentWishlist = [];

    try {
      currentWishlist = JSON.parse(
        localStorage.getItem("quickbite-wishlist") || "[]"
      );

      if (!Array.isArray(currentWishlist)) {
        currentWishlist = [];
      }
    } catch {
      currentWishlist = [];
    }

    const alreadySaved = currentWishlist.some(
      (item) => String(item.id) === String(food.id)
    );

    const updatedWishlist = alreadySaved
      ? currentWishlist.filter(
          (item) => String(item.id) !== String(food.id)
        )
      : [...currentWishlist, food];

    try {
      localStorage.setItem(
        "quickbite-wishlist",
        JSON.stringify(updatedWishlist)
      );

      setSavedIds(
        updatedWishlist.map((item) => String(item.id))
      );

      setToast(
        alreadySaved
          ? "Removed from wishlist."
          : "Saved to your wishlist!"
      );
    } catch {
      setToast("Unable to update wishlist.");
    }
  }

  React.useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("quickbite-wishlist") || "[]"
      );

      if (Array.isArray(saved)) {
        setSavedIds(saved.map((item) => String(item.id)));
      }
    } catch {
      setSavedIds([]);
    }
  }, []);

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <span style={styles.eyebrow}>SMART FOOD DISCOVERY</span>

            <h1>
              Your cravings,
              <br />
              <span>our recommendations.</span>
            </h1>

            <p>
              Tell us what you're in the mood for. We'll find dishes
              that match your taste, budget and preferences.
            </p>

            <div style={styles.heroFeatures}>
              <span>✨ Personalised picks</span>
              <span>🍽️ Your food preferences</span>
              <span>💰 Budget-friendly choices</span>
            </div>
          </div>

          <div style={styles.heroIllustration}>
            <div style={styles.orbit}>✦</div>
            <div style={styles.plate}>🍜</div>
            <span style={styles.floatOne}>🍕</span>
            <span style={styles.floatTwo}>🥗</span>
            <span style={styles.floatThree}>🍔</span>
          </div>
        </section>

        <section style={styles.preferenceSection}>
          <div style={styles.sectionHeading}>
            <span style={styles.stepBadge}>01</span>
            <div>
              <h2>Let's understand your cravings</h2>
              <p>
                Choose your preferences to personalise your food picks.
              </p>
            </div>
          </div>

          <form onSubmit={generateRecommendations}>
            <div style={styles.preferenceBlock}>
              <label style={styles.questionLabel}>
                What's your mood today?
              </label>

              <div style={styles.moodGrid}>
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => {
  console.log("Mood selected:", mood.value);
  updatePreference("mood", mood.value);
}}
                    style={{
                      ...styles.moodButton,
                      ...(preferences.mood === mood.value
                        ? styles.selectedMood
                        : {}),
                    }}
                  >
                    <span style={styles.moodEmoji}>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.preferenceGrid}>
              <div style={styles.preferenceBlock}>
                <label htmlFor="diet" style={styles.questionLabel}>
                  Food preference
                </label>

                <select
                  id="diet"
                  value={preferences.diet}
                  onChange={(event) =>
                    updatePreference("diet", event.target.value)
                  }
                  style={styles.select}
                >
                  <option value="all">Everything</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-vegetarian</option>
                </select>
              </div>

              <div style={styles.preferenceBlock}>
                <label htmlFor="budget" style={styles.questionLabel}>
                  Maximum budget per dish
                </label>

                <select
                  id="budget"
                  value={preferences.budget}
                  onChange={(event) =>
                    updatePreference("budget", event.target.value)
                  }
                  style={styles.select}
                >
                  <option value="150">Up to ₹150</option>
                  <option value="200">Up to ₹200</option>
                  <option value="300">Up to ₹300</option>
                  <option value="500">Up to ₹500</option>
                </select>
              </div>

              <div style={styles.preferenceBlock}>
                <label htmlFor="spice" style={styles.questionLabel}>
                  Spice level
                </label>

                <select
                  id="spice"
                  value={preferences.spice}
                  onChange={(event) =>
                    updatePreference("spice", event.target.value)
                  }
                  style={styles.select}
                >
                  <option value="any">No preference</option>
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="hot">Hot and spicy</option>
                </select>
              </div>
            </div>

            <button type="submit" style={styles.generateButton}>
              ✨ Find my perfect food <span>→</span>
            </button>
          </form>
        </section>

        <section style={styles.resultsSection}>
          {aiLoading && (
  <div style={styles.disclaimer} role="status">
    <span>✨</span>
    <p>Finding food recommendations for your mood and budget...</p>
  </div>
)}

{aiError && (
  <div style={styles.disclaimer} role="status">
    <span>ℹ️</span>
    <p>{aiError}</p>
  </div>
)}
          <div style={styles.resultsHeader}>
            <div>
              <span style={styles.eyebrow}>MADE FOR YOUR TASTE</span>
              <h2>
                {hasGenerated
                  ? "Your personalised picks"
                  : "Popular picks to get you started"}
              </h2>
              <p>
                {hasGenerated
                  ? "Ranked using your selected preferences."
                  : "Explore some favourites or personalise your recommendations above."}
              </p>
            </div>

            <span style={styles.resultsCount}>
              {recommendations.length} dishes
            </span>
          </div>

          {recommendations.length > 0 ? (
            <div style={styles.foodGrid}>
              {recommendations.map((food, index) => (
                <article key={food.id} style={styles.foodCard}>
                  
<div
  style={{
    ...styles.foodVisual,
    background: food.color || "#fff3e8",
    overflow: "hidden",
  }}
>
  {food.image ? (
    <img
      src={food.image}
      alt={food.name}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        position: "absolute",
        inset: 0,
      }}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <span style={styles.foodEmoji}>{food.emoji || "🍽️"}</span>
  )}


                    <button
                      type="button"
                      aria-label={
                        savedIds.includes(String(food.id))
                          ? `Remove ${food.name} from wishlist`
                          : `Save ${food.name} to wishlist`
                      }
                      title="Toggle wishlist"
                      onClick={() => toggleWishlist(food)}
                      style={{
                        ...styles.heartButton,
                        color: savedIds.includes(String(food.id))
                          ? "#e64c4c"
                          : "#6e625b",
                      }}
                    >
                      {savedIds.includes(String(food.id)) ? "♥" : "♡"}
                    </button>
                  </div>

                  <div style={styles.foodBody}>
                    <div style={styles.foodTitleRow}>
                      <h3>{food.name}</h3>
                      <span style={styles.rating}>★ {food.rating}</span>
                    </div>

                   <p style={styles.restaurant}>
  📍 {typeof food.restaurant === "object"
    ? food.restaurant?.name
    : food.restaurant || "QuickBite Restaurant"}
</p>

                    <p style={styles.description}>{food.description}</p>
<div style={styles.tags}>
  {(Array.isArray(food.tags) ? food.tags : []).map((tag) => (
    <span key={tag} style={styles.tag}>
      {tag}
    </span>
  ))}
</div>

                    <div style={styles.reasonBox}>
                      <span>✨</span>
                      <span>
                        {food.reasons[0] || "Popular customer choice"}
                      </span>
                    </div>

                    <div style={styles.foodFooter}>
                      <div>
                        <strong style={styles.price}>₹{food.price}</strong>
                        <p style={styles.calories}>
                          Approx. {food.calories} kcal
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => addFood(food)}
                        style={styles.addButton}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <span>🍽️</span>
              <h3>No dishes match all your preferences</h3>
              <p>
                Try increasing your budget or choosing a different
                food or spice preference.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPreferences(initialPreferences);
                  setSubmittedPreferences(initialPreferences);
                  setHasGenerated(false);
                }}
                style={styles.resetButton}
              >
                Reset preferences
              </button>
            </div>
          )}
        </section>

<section style={styles.disclaimer}>
  <span>💡</span>
  <p>
    <strong>How it works:</strong> QuickBite uses your selected mood,
    food preference and budget to generate personalised recommendations.
    If the recommendation service is unavailable, local recommendations
    are shown as a fallback.
  </p>
</section>
      </main>

      {toast && (
        <div role="status" style={styles.toast}>
          ✓ {toast}
          <button
            type="button"
            onClick={() => setToast("")}
            style={styles.toastClose}
            aria-label="Dismiss notification"
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
    color: "#2d241f",
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "35px 24px 70px",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.3fr) minmax(220px, 0.7fr)",
    alignItems: "center",
    gap: 25,
    overflow: "hidden",
    padding: "45px clamp(22px, 5vw, 60px)",
    borderRadius: 24,
    background: "#fff0e6",
  },
  heroContent: {
    maxWidth: 590,
  },
  eyebrow: {
    color: "#e85b2a",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.6,
  },
  heroFeatures: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 25,
  },
  heroIllustration: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    minHeight: 220,
  },
  orbit: {
    position: "absolute",
    top: 10,
    right: "20%",
    color: "#ed8d55",
    fontSize: 38,
  },
  plate: {
    display: "grid",
    placeItems: "center",
    width: 175,
    height: 175,
    border: "10px solid #fff",
    borderRadius: "50%",
    background: "#ffe1cb",
    fontSize: 90,
    boxShadow: "0 15px 40px rgba(120, 60, 30, 0.12)",
  },
  floatOne: {
    position: "absolute",
    top: 15,
    left: "12%",
    fontSize: 35,
  },
  floatTwo: {
    position: "absolute",
    right: 0,
    bottom: 25,
    fontSize: 35,
  },
  floatThree: {
    position: "absolute",
    left: 5,
    bottom: 15,
    fontSize: 35,
  },
  heroFeaturesItem: {
    padding: 10,
  },
  preferenceSection: {
    padding: "35px clamp(18px, 4vw, 40px)",
    marginTop: 32,
    border: "1px solid #f0e5dd",
    borderRadius: 20,
    background: "#fff",
  },
  sectionHeading: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 32,
  },
  stepBadge: {
    display: "grid",
    placeItems: "center",
    width: 43,
    height: 43,
    flexShrink: 0,
    borderRadius: 12,
    background: "#fff0e6",
    color: "#e85b2a",
    fontWeight: 900,
  },
  preferenceBlock: {
    marginBottom: 25,
  },
  questionLabel: {
    display: "block",
    marginBottom: 13,
    color: "#4c4038",
    fontSize: 13,
    fontWeight: 900,
  },
  moodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
    gap: 12,
  },
  moodButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    minHeight: 105,
    padding: 15,
    border: "1px solid #eee3db",
    borderRadius: 13,
    background: "#fff",
    color: "#5e5148",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },
  selectedMood: {
    border: "2px solid #ff6b35",
    background: "#fff5ed",
    color: "#d95222",
  },
  moodEmoji: {
    fontSize: 27,
  },
  preferenceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
    gap: 20,
  },
  select: {
    boxSizing: "border-box",
    width: "100%",
    padding: 14,
    border: "1px solid #e9ded5",
    borderRadius: 10,
    background: "#fff",
    color: "#54473f",
    fontSize: 12,
  },
  generateButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    width: "100%",
    padding: 16,
    border: 0,
    borderRadius: 11,
    background: "#ff6b35",
    color: "#fff",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
  },
  resultsSection: {
    marginTop: 45,
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 24,
  },
  resultsCount: {
    padding: "9px 13px",
    borderRadius: 20,
    background: "#fff0e6",
    color: "#d95222",
    fontSize: 11,
    fontWeight: 900,
  },
  foodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    gap: 22,
  },
  foodCard: {
    overflow: "hidden",
    border: "1px solid #f0e6df",
    borderRadius: 17,
    background: "#fff",
    boxShadow: "0 5px 20px rgba(70, 40, 20, 0.035)",
  },
  foodVisual: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    height: 185,
  },
  foodEmoji: {
    fontSize: 85,
  },
  topPick: {
    position: "absolute",
    top: 13,
    left: 13,
    padding: "7px 10px",
    borderRadius: 20,
    background: "#fff",
    color: "#e85b2a",
    fontSize: 9,
    fontWeight: 900,
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    display: "grid",
    placeItems: "center",
    width: 37,
    height: 37,
    border: 0,
    borderRadius: "50%",
    background: "#fff",
    fontSize: 23,
    cursor: "pointer",
  },
  foodBody: {
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
    color: "#b57912",
    fontSize: 11,
    fontWeight: 900,
  },
  restaurant: {
    margin: "8px 0",
    color: "#81746c",
    fontSize: 11,
  },
  description: {
    minHeight: 36,
    color: "#756a63",
    fontSize: 11,
    lineHeight: 1.7,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },
  tag: {
    padding: "6px 8px",
    borderRadius: 6,
    background: "#f8f2ed",
    color: "#716057",
    fontSize: 9,
    fontWeight: 800,
  },
  reasonBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 10,
    marginTop: 14,
    borderRadius: 8,
    background: "#fff8ed",
    color: "#b66a25",
    fontSize: 10,
    fontWeight: 800,
  },
  foodFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    paddingTop: 15,
    marginTop: 15,
    borderTop: "1px solid #f2e9e2",
  },
  price: {
    fontSize: 20,
    fontWeight: 900,
  },
  calories: {
    marginTop: 5,
    color: "#92857d",
    fontSize: 10,
  },
  addButton: {
    padding: "10px 17px",
    border: 0,
    borderRadius: 9,
    background: "#ff6b35",
    color: "#fff",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  emptyState: {
    padding: 45,
    border: "1px dashed #e9d8cb",
    borderRadius: 18,
    background: "#fff",
    textAlign: "center",
  },
  resetButton: {
    padding: "11px 17px",
    border: 0,
    borderRadius: 9,
    background: "#ff6b35",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  disclaimer: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: 20,
    marginTop: 35,
    borderRadius: 13,
    background: "#fff0e6",
    color: "#75645a",
    fontSize: 12,
    lineHeight: 1.8,
  },
  toast: {
    position: "fixed",
    right: 20,
    bottom: 20,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: 12,
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
