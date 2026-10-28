const foodMenu = [
  {
    id: 1,
    name: "Margherita Pizza",
    category: "Pizza",
    cuisine: "Italian",
    price: 199,
    isVeg: true,
    tags: ["cheesy", "comfort", "popular"],
    moods: ["happy", "tired", "comfort"],
    mealTimes: ["lunch", "dinner"],
  },
  {
    id: 2,
    name: "Classic Veg Burger",
    category: "Burger",
    cuisine: "American",
    price: 129,
    isVeg: true,
    tags: ["crispy", "quick", "comfort"],
    moods: ["happy", "hungry", "comfort"],
    mealTimes: ["lunch", "dinner", "evening"],
  },
  {
    id: 3,
    name: "Paneer Tikka",
    category: "North Indian",
    cuisine: "Indian",
    price: 179,
    isVeg: true,
    tags: ["spicy", "protein", "indian"],
    moods: ["happy", "hungry", "spicy"],
    mealTimes: ["lunch", "dinner"],
  },
  {
    id: 4,
    name: "Chicken Biryani",
    category: "Biryani",
    cuisine: "Indian",
    price: 229,
    isVeg: false,
    tags: ["spicy", "filling", "popular"],
    moods: ["hungry", "comfort", "spicy"],
    mealTimes: ["lunch", "dinner"],
  },
  {
    id: 5,
    name: "Chocolate Brownie",
    category: "Dessert",
    cuisine: "Dessert",
    price: 99,
    isVeg: true,
    tags: ["sweet", "chocolate", "treat"],
    moods: ["happy", "sad", "tired"],
    mealTimes: ["afternoon", "evening", "dinner"],
  },
  {
    id: 6,
    name: "Veg Hakka Noodles",
    category: "Chinese",
    cuisine: "Chinese",
    price: 149,
    isVeg: true,
    tags: ["spicy", "quick", "noodles"],
    moods: ["hungry", "spicy", "comfort"],
    mealTimes: ["lunch", "dinner"],
  },
  {
    id: 7,
    name: "Grilled Chicken Wrap",
    category: "Wrap",
    cuisine: "Healthy",
    price: 189,
    isVeg: false,
    tags: ["protein", "quick", "light"],
    moods: ["tired", "hungry"],
    mealTimes: ["lunch", "dinner", "evening"],
  },
  {
    id: 8,
    name: "Fresh Fruit Bowl",
    category: "Healthy",
    cuisine: "Healthy",
    price: 119,
    isVeg: true,
    tags: ["fresh", "light", "healthy"],
    moods: ["tired", "happy"],
    mealTimes: ["breakfast", "afternoon"],
  },
];

function getMealTime(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 19) return "evening";

  return "dinner";
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function predictCravings({
  mood = "hungry",
  budget = 300,
  isVeg = null,
  favoriteCategories = [],
  previousOrders = [],
  limit = 4,
  currentTime = new Date(),
} = {}) {
  const selectedMood = normalize(mood);
  const mealTime = getMealTime(new Date(currentTime));
  const safeBudget = Number(budget);
  const safeLimit = Math.min(
    10,
    Math.max(1, Math.floor(Number(limit) || 4))
  );

  if (!Number.isFinite(safeBudget) || safeBudget <= 0) {
    return {
      success: false,
      message: "Please provide a valid budget greater than zero.",
      recommendations: [],
    };
  }

  const categories = Array.isArray(favoriteCategories)
    ? favoriteCategories.map(normalize)
    : [];

  const orderedFoodIds = new Set(
    Array.isArray(previousOrders)
      ? previousOrders.map((order) => {
          if (typeof order === "object" && order !== null) {
            return Number(order.id ?? order.foodId);
          }

          return Number(order);
        })
      : []
  );

  const candidates = foodMenu.filter((food) => {
    const withinBudget = food.price <= safeBudget;

    const matchesDiet =
      isVeg === null || isVeg === undefined
        ? true
        : food.isVeg === (isVeg === true);

    return withinBudget && matchesDiet;
  });

  const recommendations = candidates.map((food) => {
    let score = 0;
    const reasons = [];

    if (food.moods.includes(selectedMood)) {
      score += 3;
      reasons.push(`Matches your ${selectedMood} mood`);
    }

    if (food.mealTimes.includes(mealTime)) {
      score += 2;
      reasons.push(`Suitable for ${mealTime}`);
    }

    if (
      categories.includes(normalize(food.category)) ||
      categories.includes(normalize(food.cuisine))
    ) {
      score += 4;
      reasons.push("Matches your food preferences");
    }

    if (orderedFoodIds.has(food.id)) {
      score += 2;
      reasons.push("You have ordered this before");
    }

    if (food.tags.includes("popular")) {
      score += 1;
    }

    if (food.price <= safeBudget * 0.6) {
      score += 1;
      reasons.push("Leaves room in your budget");
    }

    return {
      ...food,
      score,
      reasons:
        reasons.length > 0
          ? reasons
          : ["A food option within your budget"],
    };
  });

  recommendations.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.price - b.price;
  });

  return {
    success: true,
    mealTime,
    mood: selectedMood,
    budget: safeBudget,
    recommendations: recommendations.slice(0, safeLimit),
  };
}

module.exports = {
  predictCravings,
  getMealTime,
};