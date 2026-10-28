
import { getGroupOrderRecommendations } from "../services/aiService";
const foodMenu = [
  {
    id: 1,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 199,
    isVeg: true,
    rating: 4.5,
    tags: ["cheesy", "mild"],
  },
  {
    id: 2,
    name: "Classic Veg Burger",
    category: "Burger",
    price: 129,
    isVeg: true,
    rating: 4.3,
    tags: ["crispy", "quick"],
  },
  {
    id: 3,
    name: "Paneer Tikka",
    category: "North Indian",
    price: 179,
    isVeg: true,
    rating: 4.6,
    tags: ["spicy", "protein"],
  },
  {
    id: 4,
    name: "Chicken Biryani",
    category: "Biryani",
    price: 229,
    isVeg: false,
    rating: 4.7,
    tags: ["spicy", "filling"],
  },
  {
    id: 5,
    name: "Chocolate Brownie",
    category: "Dessert",
    price: 99,
    isVeg: true,
    rating: 4.4,
    tags: ["sweet", "chocolate"],
  },
  {
    id: 6,
    name: "Veg Hakka Noodles",
    category: "Chinese",
    price: 149,
    isVeg: true,
    rating: 4.2,
    tags: ["spicy", "noodles"],
  },
  {
    id: 7,
    name: "Grilled Chicken Wrap",
    category: "Wrap",
    price: 189,
    isVeg: false,
    rating: 4.5,
    tags: ["protein", "light"],
  },
  {
    id: 8,
    name: "Fresh Fruit Bowl",
    category: "Healthy",
    price: 119,
    isVeg: true,
    rating: 4.1,
    tags: ["fresh", "light"],
  },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function recommendGroupOrder({
  members = [],
  budget = 1000,
  maxItems = 8,
} = {}) {
  const safeBudget = Number(budget);
  const safeMaxItems = Math.floor(Number(maxItems));

  if (!Array.isArray(members) || members.length === 0) {
    return {
      success: false,
      message: "Please provide at least one group member.",
      recommendations: [],
    };
  }

  if (members.length > 20) {
    return {
      success: false,
      message: "A group can contain at most 20 members.",
      recommendations: [],
    };
  }

  if (!Number.isFinite(safeBudget) || safeBudget <= 0) {
    return {
      success: false,
      message: "Budget must be greater than zero.",
      recommendations: [],
    };
  }

  if (
    !Number.isFinite(safeMaxItems) ||
    safeMaxItems < 1 ||
    safeMaxItems > 8
  ) {
    return {
      success: false,
      message: "Maximum items must be between 1 and 8.",
      recommendations: [],
    };
  }

  const normalizedMembers = members.map((member, index) => ({
    name: String(member.name || `Member ${index + 1}`).trim(),
    isVeg: member.isVeg,
    preferences: Array.isArray(member.preferences)
      ? member.preferences.map(normalize)
      : [],
    budget: Number.isFinite(Number(member.budget))
      ? Number(member.budget)
      : safeBudget,
  }));

  if (
    normalizedMembers.some(
      (member) =>
        !member.name ||
        member.budget <= 0 ||
        (member.isVeg !== undefined &&
          member.isVeg !== null &&
          typeof member.isVeg !== "boolean")
    )
  ) {
    return {
      success: false,
      message: "Please provide valid member names, budgets and food preferences.",
      recommendations: [],
    };
  }

  const groupBudget = Math.min(
    safeBudget,
    normalizedMembers.reduce((sum, member) => sum + member.budget, 0)
  );

  const scoredFoods = foodMenu.map((food) => {
    let score = 0;
    const likedBy = [];

    normalizedMembers.forEach((member) => {
      const canEatFood =
        member.isVeg === undefined ||
        member.isVeg === null ||
        food.isVeg === member.isVeg;

      const matchesPreference = member.preferences.some(
        (preference) =>
          preference === normalize(food.category) ||
          preference === normalize(food.name) ||
          preference === normalize(food.tags.join(" "))
      );

      if (canEatFood && matchesPreference) {
        score += 3;
        likedBy.push(member.name);
      } else if (canEatFood) {
        score += 1;
      }
    });

    return {
      ...food,
      score,
      likedBy,
    };
  });

  const candidates = scoredFoods
    .filter((food) => food.price <= groupBudget)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }

      return a.price - b.price;
    });

  const selectedFoods = [];
  let total = 0;

  for (const food of candidates) {
    if (selectedFoods.length >= safeMaxItems) {
      break;
    }

    if (total + food.price <= groupBudget) {
      selectedFoods.push({
        id: food.id,
        name: food.name,
        category: food.category,
        price: food.price,
        isVeg: food.isVeg,
        rating: food.rating,
        likedBy: food.likedBy,
        quantity: 1,
      });

      total += food.price;
    }
  }

  const memberSuggestions = normalizedMembers.map((member) => {
    const suitableFoods = selectedFoods.filter((food) => {
      const matchesDiet =
        member.isVeg === undefined ||
        member.isVeg === null ||
        food.isVeg === member.isVeg;

      const matchesPreference = member.preferences.some(
        (preference) =>
          preference === normalize(food.category) ||
          preference === normalize(food.name)
      );

      return matchesDiet && matchesPreference;
    });

    return {
      name: member.name,
      suggestions: suitableFoods.map((food) => food.name),
    };
  });

  return {
    success: true,
    groupSize: normalizedMembers.length,
    budget: groupBudget,
    total,
    remainingBudget: Number((groupBudget - total).toFixed(2)),
    perPersonCost: Number(
      (total / normalizedMembers.length).toFixed(2)
    ),
    items: selectedFoods,
    memberSuggestions,
    message:
      selectedFoods.length > 0
        ? "Group food recommendations generated successfully."
        : "No suitable food combination fits the group budget.",
  };
}

module.exports = {
  recommendGroupOrder,
};