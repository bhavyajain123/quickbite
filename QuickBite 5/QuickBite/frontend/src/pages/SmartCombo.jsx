import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { getFoods, getRestaurants } from "../api";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { optimizeFoodBudget } from "../services/aiService";



const MOODS = [
  { id: "comfort", label: "Comfort food", emoji: "🫶", note: "Warm and satisfying" },
  { id: "quick", label: "Quick bite", emoji: "⚡", note: "Easy, no-fuss picks" },
  { id: "spicy", label: "Spicy mood", emoji: "🌶️", note: "Bring on the flavour" },
  { id: "treat", label: "Treat myself", emoji: "✨", note: "A little indulgence" },
  { id: "chill", label: "Movie night", emoji: "🎬", note: "Snack and relax" },
];

export default function SmartCombo() {
  const { addToCart } = useCart();
  const [budget, setBudget] = useState(400);
  const [mood, setMood] = useState("comfort");
  const [diet, setDiet] = useState("Any");
  const [people, setPeople] = useState("1");
  const [combo, setCombo] = useState(null);
  const [message, setMessage] = useState("");
  const [quantities, setQuantities] = useState({});
  const [removedItems, setRemovedItems] = useState([]);
const [optimizing, setOptimizing] = useState(false);
const [optimizerError, setOptimizerError] = useState("");
const [availableFoods, setAvailableFoods] = useState([]);
const [foodsLoading, setFoodsLoading] = useState(true);
const [restaurants, setRestaurants] = useState([]);
const [selectedRestaurant, setSelectedRestaurant] = useState("");



useEffect(() => {
  let cancelled = false;

  async function loadRestaurants() {
    try {
      const data = await getRestaurants();

      if (!cancelled) {
        setRestaurants(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedRestaurant(data[0].id || data[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to load restaurants:", error);
    }
  }

  loadRestaurants();

  return () => {
    cancelled = true;
  };
}, []);


const MENU = availableFoods.map((food) => {
  const name = food.name || "";
  const category = food.category || "Popular";
  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();

  const type =
    lowerName.includes("chicken") ||
    lowerName.includes("mutton") ||
    lowerName.includes("fish") ||
    lowerName.includes("prawn") ||
    lowerName.includes("egg") ||
    lowerCategory.includes("non-veg")
      ? "Non-Veg"
      : "Veg";

  let emoji = "🍽️";
  if (lowerCategory.includes("pizza")) emoji = "🍕";
  else if (lowerCategory.includes("burger")) emoji = "🍔";
  else if (lowerCategory.includes("wrap")) emoji = "🌯";
  else if (lowerCategory.includes("dessert")) emoji = "🍰";
  else if (lowerCategory.includes("drink")) emoji = "🥤";
  else if (lowerCategory.includes("side")) emoji = "🍟";

  return {
    ...food,
    id: food._id || food.id,
    name,
    price: Number(food.price),
    category,
    type,
    emoji,
    moods: (() => {
  const text = `${name} ${category} ${food.description || ""}`.toLowerCase();
  const matchedMoods = [];

  if (
    /pizza|bread|pasta|raita|biryani|paneer|dal|rice|thali/.test(text)
  ) matchedMoods.push("comfort");

  if (
    /burger|wrap|sandwich|roll|fries|momos|noodles/.test(text)
  ) matchedMoods.push("quick");

  if (
    /chilli|chili|spicy|masala|schezwan|tikka|peri peri|hot/.test(text)
  ) matchedMoods.push("spicy");

  if (
    /cake|brownie|chocolate|ice cream|lava|shake|sweet|dessert/.test(text)
  ) matchedMoods.push("treat");

  if (
    /coffee|tea|popcorn|fries|chips|cookie|shake|lemonade|drink/.test(text)
  ) matchedMoods.push("chill");

  return matchedMoods.length ? matchedMoods : ["comfort"];
})(),
    description: food.description || name,
  };
});



useEffect(() => {
  let cancelled = false;

  async function loadFoods() {
    if (!selectedRestaurant) {
      setAvailableFoods([]);
      setFoodsLoading(false);
      return;
    }

    try {
      setFoodsLoading(true);

      const foods = await getFoods(selectedRestaurant);

      if (!cancelled) {
        setAvailableFoods(
          foods.filter(
            (food) =>
              food.isAvailable &&
              food.id &&
              Number(food.price) > 0
          )
        );
      }
    } catch (error) {
      console.error("Failed to load foods:", error);
      if (!cancelled) setAvailableFoods([]);
    } finally {
      if (!cancelled) setFoodsLoading(false);
    }
  }

  loadFoods();

  return () => {
    cancelled = true;
  };
}, [selectedRestaurant]);


  const recommendations = useMemo(() => {
    const maxItems = Number(people) === 1 ? 3 : Number(people) === 2 ? 4 : 5;
   const available = MENU
  .filter((item) => diet === "Any" || item.type === diet)
  .map((item) => ({
    ...item,
    score:
      (item.moods.includes(mood) ? 4 : 0) +
      (item.category === "Sides" || item.category === "Drinks" ? 1 : 0),
  }))
      .sort((a, b) => b.score - a.score || a.price - b.price);

    const picked = [];
    let total = 0;
    for (const item of available) {
      if (picked.length >= maxItems) break;
      if (total + item.price <= budget && (picked.length === 0 || item.category !== picked[picked.length - 1].category)) {
        picked.push(item);
        total += item.price;
      }
    }
   
    for (const item of available) {
      if (picked.length >= maxItems) break;
      if (!picked.some((p) => p.id === item.id) && total + item.price <= budget) {
        picked.push(item);
        total += item.price;
      }
    }
    return { items: picked, total, maxItems };
  }, [budget, mood, diet, people]);

async function buildCombo() {
  setOptimizerError("");
  setMessage("");

  setQuantities({});
  setRemovedItems([]);

  const maxItems =
    Number(people) === 1 ? 3 : Number(people) === 2 ? 4 : 5;

  setOptimizing(true);

  try {
    const result = await optimizeFoodBudget({
      budget: Number(budget),
      isVeg: diet === "Any" ? null : diet === "Veg",
      people: Number(people),
      includeDessert: mood === "treat" || mood === "chill",
      maxItems,
    });

    const suggestedCombo =
      result.bestCombination ||
      result.combo ||
      result.data?.bestCombination ||
      result.data?.combo;

    if (suggestedCombo) {
      const items = Array.isArray(suggestedCombo)
        ? suggestedCombo
        : suggestedCombo.items;

      if (Array.isArray(items) && items.length > 0) {
        const normalizedItems = items.map((item) => ({
          ...item,
          id: item.id || item._id || item.name,
          name: item.name || item.title || "Food item",
          price: Number(item.price) || 0,
          category: item.category || "Food",
          type:
            item.type ||
            (item.isVeg === false ? "Non-Veg" : "Veg"),
          emoji: item.emoji || "🍽️",
          description: item.description || "A tasty choice for your combo.",
        }));

        const total = normalizedItems.reduce(
          (sum, item) => sum + item.price,
          0
        );

        if (total <= Number(budget)) {
          setCombo({
            items: normalizedItems,
            total,
            maxItems,
          });

          setMessage("Your budget-optimized combo is ready!");
          return;
        }
      }
    }

    setOptimizerError(
      "Optimizer response unavailable or incompatible. Using local recommendations."
    );

    const fallback = recommendations;

    if (!fallback.items.length) {
      setCombo(null);
      setMessage(
        "No combo fits this budget and preference yet. Try increasing your budget."
      );
      return;
    }

    setCombo(fallback);
    setMessage("Your craving combo is ready using local recommendations.");
  } catch {
    setOptimizerError(
      "Budget optimizer is not connected yet. Using local recommendations."
    );

    if (!recommendations.items.length) {
      setCombo(null);
      setMessage(
        "No combo fits this budget and preference yet. Try increasing your budget."
      );
      return;
    }

    setCombo(recommendations);
    setMessage("Your craving combo is ready using local recommendations.");
  } finally {
    setOptimizing(false);
  }
}

  function updateComboQuantity(itemId, change) {
    setQuantities((previous) => {
      const current = previous[itemId] || 1;
      const next = Math.max(1, Math.min(10, current + change));
      return { ...previous, [itemId]: next };
    });
  }

  function removeComboItem(item) {
    setRemovedItems((previous) => [
      ...previous,
      { item, quantity: quantities[item.id] || 1 },
    ]);
    setMessage(`${item.name} removed from your combo.`);
  }

  function undoRemoveItem() {
    if (!removedItems.length) return;
    const lastRemoved = removedItems[removedItems.length - 1];
    setRemovedItems((previous) => previous.slice(0, -1));
    setQuantities((previous) => ({
      ...previous,
      [lastRemoved.item.id]: lastRemoved.quantity,
    }));
    setMessage(`${lastRemoved.item.name} restored to your combo.`);
  }

  function resetChoices() {
    setBudget(400);
    setMood("comfort");
    setDiet("Any");
    setPeople("1");
    setCombo(null);
    setQuantities({});
    setRemovedItems([]);
    setMessage("");
    setOptimizerError("");
setOptimizing(false);
  }


async function addComboToCart() {
  if (!visibleItems.length) {
    setMessage("Please select at least one food item.");
    return;
  }

  try {
    for (const item of visibleItems) {
      const quantity = quantities[item.id] || 1;

      for (let i = 0; i < quantity; i += 1) {
        await addToCart({
          id: item._id || item.id,
          _id: item._id || item.id,
          name: item.name,
          title: item.name,
          price: Number(item.price),
          quantity: 1,
          category: item.category,
          type: item.type,
          emoji: item.emoji,
          restaurantId: item.restaurantId,
        });
      }
    }

    setMessage("Combo added to your cart!");
    window.setTimeout(() => {
      window.location.href = "/cart";
    }, 600);
  } catch (error) {
    console.error("Failed to add combo to cart:", error);
    setMessage("Could not add the combo. Please try again.");
  }
}


  const visibleCombo = combo || recommendations;
  const visibleItems = visibleCombo.items.filter(
    (item) => !removedItems.some((removed) => removed.item.id === item.id)
  );
  const comboTotal = visibleItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] || 1),
    0
  );
  const budgetSavings = Math.max(0, budget - comboTotal);
  const perPersonCost = Math.ceil(comboTotal / Number(people));



  return (

    
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        .qb-combo-wrap { width: min(1160px, 92%); margin: 0 auto; padding: 42px 0 72px; }
        .qb-combo-hero { border-radius: 28px; padding: clamp(24px, 5vw, 54px); background: radial-gradient(circle at 85% 10%, #ffd8c4 0, transparent 30%), linear-gradient(125deg, #fff1e8, #fffaf6 62%, #fff0e6); display: grid; grid-template-columns: 1.2fr .8fr; gap: 28px; align-items: center; overflow: hidden; }
        .qb-combo-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .qb-combo-card { background: #fff; border: 1px solid #eee4dc; border-radius: 18px; padding: 20px; }
        .qb-mood-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
        .qb-mood { border: 1px solid #eee1d7; border-radius: 14px; background: #fff; padding: 13px 8px; cursor: pointer; text-align: center; color: #332923; min-height: 98px; }
        .qb-mood.active { border-color: #ff6b35; background: #fff3eb; box-shadow: 0 0 0 2px rgba(255,107,53,.1); }
        .qb-combo-items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .qb-combo-item { display: flex; align-items: center; gap: 13px; padding: 15px; border: 1px solid #eee4dc; border-radius: 16px; background: #fff; }
        .qb-combo-emoji { flex: 0 0 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font-size: 26px; background: #fff1e7; }
        .qb-combo-button { border: 0; border-radius: 12px; background: #ff6b35; color: white; padding: 13px 18px; font-weight: 800; cursor: pointer; }
        .qb-combo-secondary { border: 1px solid #eadfd6; border-radius: 12px; background: #fff; color: #4b4039; padding: 12px 16px; font-weight: 700; cursor: pointer; }
        .qb-combo-select { width: 100%; border: 1px solid #e8ddd4; background: #fff; border-radius: 11px; padding: 12px; color: #322922; }
        @media (max-width: 800px) { .qb-combo-hero { grid-template-columns: 1fr; } .qb-mood-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .qb-combo-controls, .qb-combo-items { grid-template-columns: 1fr; } .qb-mood-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      `}</style>
      <Navbar />
      <main className="qb-combo-wrap">
        <section className="qb-combo-hero">
          <div>
            <span style={styles.eyebrow}>QUICKBITE SMART STUDIO</span>
            <h1 style={styles.heroTitle}>Your mood.<br /><span style={{ color: "#ff6b35" }}>Your budget.</span><br />Your perfect combo.</h1>
            <p style={styles.muted}>Tell us what you feel like eating and we’ll build a meal combo around your budget. No endless scrolling.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
             <button
  className="qb-combo-button"
  type="button"
  onClick={buildCombo}
  disabled={optimizing}
  style={{
    opacity: optimizing ? 0.7 : 1,
    cursor: optimizing ? "wait" : "pointer",
  }}
>
  {optimizing ? "Optimizing your combo..." : "Build my combo ✨"}
</button>

              <button className="qb-combo-secondary" onClick={resetChoices}>Reset choices</button>
            </div>
          </div>
          <div style={styles.heroArt}>
            <div style={{ fontSize: 76 }}>🍕</div>
            <div style={styles.floatingEmoji}>🍟</div>
            <div style={{ fontSize: 55, marginTop: -12 }}>🥤</div>
            <p style={{ margin: "8px 0 0", fontWeight: 800 }}>Made for your cravings</p>
            <span style={{ color: "#81766f", fontSize: 13 }}>A little bit of you in every order.</span>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <div style={styles.sectionHeading}>
            <div><span style={styles.eyebrow}>MAKE IT YOURS</span><h2 style={styles.sectionTitle}>Build your craving combo</h2></div>
            <span style={styles.smallPill}>✨ Personalised picks</span>
          </div>
          <div className="qb-combo-card" style={{ marginBottom: 18 }}>
      <label
        htmlFor="combo-restaurant"
        style={{ display: "block", marginBottom: 8, fontWeight: 700 }}
      >
        Choose your restaurant
      </label>

      <select
        id="combo-restaurant"
        value={selectedRestaurant}
        onChange={(event) => {
          setSelectedRestaurant(event.target.value);
          setCombo(null);
          setQuantities({});
          setRemovedItems([]);
          setMessage("");
        }}
        style={{
          width: "100%",
          padding: 12,
          border: "1px solid #eadbd1",
          borderRadius: 10,
          background: "#fff",
        }}
      >
        {restaurants.map((restaurant) => (
          <option
            key={restaurant.id || restaurant._id}
            value={restaurant.id || restaurant._id}
          >
            {restaurant.name}
          </option>
        ))}
      </select>

      {foodsLoading && <p>Loading restaurant menu...</p>}
    </div>

          <div className="qb-combo-card" style={{ marginBottom: 18 }}>
            <h3 style={styles.cardTitle}>What’s your mood today?</h3>
            <div className="qb-mood-grid">
              {MOODS.map((item) => (
                <button key={item.id} className={`qb-mood ${mood === item.id ? "active" : ""}`} onClick={() => { setMood(item.id); setCombo(null); }}>
                  <span style={{ display: "block", fontSize: 25, marginBottom: 7 }}>{item.emoji}</span>
                  <strong style={{ display: "block", fontSize: 12 }}>{item.label}</strong>
                  <span style={{ display: "block", fontSize: 10, color: "#81766f", marginTop: 4 }}>{item.note}</span>
                </button>
              ))}
            </div>

            <div className="qb-combo-controls" style={{ marginTop: 22 }}>
              <div>
                <div style={styles.labelRow}><label htmlFor="qb-budget">Your budget</label><strong style={{ color: "#ff6b35" }}>₹{budget}</strong></div>
                <input id="qb-budget" aria-label="Meal budget" type="range" min="150" max="1000" step="50" value={budget} onChange={(e) => { setBudget(Number(e.target.value)); setCombo(null); }} style={{ width: "100%", accentColor: "#ff6b35", marginTop: 12 }} />
                <div style={styles.rangeLabels}><span>₹150</span><span>₹1,000</span></div>
              </div>
              <div>
                <label style={styles.label} htmlFor="qb-diet">Food preference</label>
                <select id="qb-diet" className="qb-combo-select" value={diet} onChange={(e) => { setDiet(e.target.value); setCombo(null); }}>
                  <option value="Any">Veg or non-veg</option><option value="Veg">Vegetarian only</option><option value="Non-Veg">Non-vegetarian</option>
                </select>
              </div>
              <div>
                <label style={styles.label} htmlFor="qb-people">How many people?</label>
                <select id="qb-people" className="qb-combo-select" value={people} onChange={(e) => { setPeople(e.target.value); setCombo(null); }}>
                  <option value="1">Just me</option><option value="2">Two people</option><option value="3">3+ people</option>
                </select>
              </div>
              <div style={styles.budgetTip}><strong>Smart tip</strong><p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: 1.5 }}>Choose a mood and budget, then build a combo. Picks are selected from this demo menu and stay within your item budget.</p></div>
            </div>
          </div>
        </section>

        <section className="qb-combo-card">
          <div style={styles.sectionHeading}>
            <div><span style={styles.eyebrow}>YOUR MATCH</span><h2 style={styles.sectionTitle}>A combo picked for you</h2></div>
            <span style={styles.totalPill}>{visibleItems.length} items · ₹{comboTotal}</span>
          </div>
          {visibleItems.length ? (
            <>
              <div className="qb-combo-items">
                {visibleItems.map((item) => (
                  <article className="qb-combo-item" key={item.id}>
                    <div className="qb-combo-emoji">{item.emoji}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                        <strong>{item.name}</strong><strong style={{ whiteSpace: "nowrap" }}>₹{item.price * (quantities[item.id] || 1)}</strong>
                      </div>
                      <p style={{ margin: "5px 0 0", color: "#81766f", fontSize: 12, lineHeight: 1.5 }}>{item.description}</p>
                      <span style={styles.typeTag}>{item.type} · {item.category}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                        <button type="button" className="qb-combo-secondary" onClick={() => updateComboQuantity(item.id, -1)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                        <strong>{quantities[item.id] || 1}</strong>
                        <button type="button" className="qb-combo-secondary" onClick={() => updateComboQuantity(item.id, 1)} aria-label={`Increase ${item.name} quantity`}>+</button>
                        <button
                          type="button"
                          onClick={() => removeComboItem(item)}
                          aria-label={`Remove ${item.name} from combo`}
                          style={{ border: "1px solid #f2c8bd", borderRadius: 10, background: "#fff7f4", color: "#c2410c", padding: "9px 12px", fontWeight: 700, cursor: "pointer", marginLeft: "auto" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div style={styles.comboFooter}>
                <div><span style={styles.mutedSmall}>Combo item total</span><strong style={{ display: "block", fontSize: 27, marginTop: 3 }}>₹{comboTotal}</strong><span style={styles.mutedSmall}>Delivery fee/tax are calculated in cart.</span></div>
                <button className="qb-combo-button" onClick={addComboToCart}>Add combo to cart →</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 20 }}>
                <div style={{ padding: 18, background: "#fff6f0", borderRadius: 14 }}>
                  <span style={styles.mutedSmall}>Your budget</span>
                  <strong style={{ display: "block", fontSize: 23, marginTop: 6 }}>₹{budget}</strong>
                </div>
                <div style={{ padding: 18, background: "#eef9f0", borderRadius: 14 }}>
                  <span style={styles.mutedSmall}>Budget remaining</span>
                  <strong style={{ display: "block", fontSize: 23, marginTop: 6, color: comboTotal <= budget ? "#16803d" : "#c2410c" }}>₹{budgetSavings}</strong>
                  {comboTotal > budget && <span style={styles.mutedSmall}>Combo is ₹{comboTotal - budget} over budget</span>}
                </div>
                <div style={{ padding: 18, background: "#f1f3ff", borderRadius: 14 }}>
                  <span style={styles.mutedSmall}>Cost per person</span>
                  <strong style={{ display: "block", fontSize: 23, marginTop: 6 }}>₹{perPersonCost}</strong>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.empty}><span style={{ fontSize: 36 }}>🥹</span><p>No combo fits this budget. Increase the budget and try again.</p></div>
          )}
          {removedItems.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 16, padding: 14, borderRadius: 12, background: "#fff6f0" }}>
              <span style={{ color: "#58483e", fontSize: 13 }}>
                {removedItems.length} item{removedItems.length === 1 ? "" : "s"} removed
              </span>
              <button type="button" className="qb-combo-secondary" onClick={undoRemoveItem}>
                ↶ Undo last removal
              </button>
            </div>
          )}
          {message && <p role="status" style={styles.notice}>{message}</p>}
          {optimizerError && (
  <p role="status" style={styles.notice}>
    {optimizerError}
  </p>
)}
          <p style={{ ...styles.mutedSmall, marginTop: 18 }}>Demo note: recommendations use simple mood, budget and food-preference rules. This is not a connected AI model or live restaurant menu.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#fffdfb", color: "#29231f", fontFamily: "'DM Sans', sans-serif" },
  eyebrow: { color: "#ff6b35", fontSize: 10, fontWeight: 800, letterSpacing: 1.8 },
  heroTitle: { fontSize: "clamp(36px, 5vw, 62px)", lineHeight: 1.04, letterSpacing: "-2.8px", margin: "16px 0" },
  muted: { color: "#81766f", fontSize: 15, lineHeight: 1.75, maxWidth: 520 },
  heroArt: { minHeight: 270, borderRadius: 24, background: "rgba(255,255,255,.75)", border: "1px solid rgba(255,255,255,.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "0 22px 50px rgba(160,91,53,.08)" },
  floatingEmoji: { position: "absolute", top: 48, right: "19%", fontSize: 48, transform: "rotate(12deg)" },
  sectionHeading: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 14, flexWrap: "wrap", marginBottom: 18 },
  sectionTitle: { margin: "5px 0 0", fontSize: "clamp(23px, 3vw, 30px)", letterSpacing: "-1px" },
  smallPill: { padding: "9px 13px", background: "#fff1e8", color: "#e45c2a", borderRadius: 30, fontSize: 12, fontWeight: 800 },
  totalPill: { padding: "10px 14px", background: "#fff1e8", color: "#e45c2a", borderRadius: 30, fontSize: 13, fontWeight: 800 },
  cardTitle: { margin: "0 0 16px", fontSize: 19 },
  labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700 },
  label: { display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 },
  rangeLabels: { display: "flex", justifyContent: "space-between", color: "#81766f", fontSize: 11, marginTop: 4 },
  budgetTip: { borderRadius: 13, padding: 14, background: "#fff6f0", color: "#58483e" },
  typeTag: { display: "inline-block", marginTop: 8, background: "#f8f2ed", color: "#75685f", borderRadius: 6, padding: "4px 7px", fontSize: 10, fontWeight: 700 },
  comboFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap", borderTop: "1px solid #eee4dc", paddingTop: 22, marginTop: 22 },
  mutedSmall: { color: "#81766f", fontSize: 12 },
  empty: { textAlign: "center", padding: "32px 12px", color: "#81766f" },
  notice: { marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#e8f7ed", color: "#167744", fontSize: 13 },
};
