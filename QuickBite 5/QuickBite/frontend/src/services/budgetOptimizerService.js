const foodMenu = [
  {
    id: 1,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 199,
    isVeg: true,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Classic Veg Burger",
    category: "Burger",
    price: 129,
    isVeg: true,
    rating: 4.3,
  },
  {
    id: 3,
    name: "Paneer Tikka",
    category: "North Indian",
    price: 179,
    isVeg: true,
    rating: 4.6,
  },
  {
    id: 4,
    name: "Chicken Biryani",
    category: "Biryani",
    price: 229,
    isVeg: false,
    rating: 4.7,
  },
  {
    id: 5,
    name: "Chocolate Brownie",
    category: "Dessert",
    price: 99,
    isVeg: true,
    rating: 4.4,
  },
  {
    id: 6,
    name: "Veg Hakka Noodles",
    category: "Chinese",
    price: 149,
    isVeg: true,
    rating: 4.2,
  },
  {
    id: 7,
    name: "Grilled Chicken Wrap",
    category: "Wrap",
    price: 189,
    isVeg: false,
    rating: 4.5,
  },
  {
    id: 8,
    name: "Fresh Fruit Bowl",
    category: "Healthy",
    price: 119,
    isVeg: true,
    rating: 4.1,
  },
];

function optimizeBudget({
  budget = 300,
  isVeg = null,
  people = 1,
  includeDessert = false,
  maxItems = 5,
} = {}) {
  const safeBudget = Number(budget);
  const safePeople = Math.floor(Number(people));
  const safeMaxItems = Math.floor(Number(maxItems));

  if (!Number.isFinite(safeBudget) || safeBudget <= 0) {
    return {
      success: false,
      message: "Budget must be greater than zero.",
      combinations: [],
    };
  }

  if (!Number.isFinite(safePeople) || safePeople < 1 || safePeople > 20) {
    return {
      success: false,
      message: "People must be between 1 and 20.",
      combinations: [],
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
      combinations: [],
    };
  }

  const availableFoods = foodMenu.filter((food) => {
    const matchesDiet =
      isVeg === null || isVeg === undefined
        ? true
        : food.isVeg === (isVeg === true);

    const matchesDessert = includeDessert
      ? true
      : food.category !== "Dessert";

    return matchesDiet && matchesDessert;
  });

  const combinations = [];

  function generateCombinations(startIndex, selectedFoods, total) {
    if (selectedFoods.length > 0) {
      const count = selectedFoods.length;
      const ratingScore =
        selectedFoods.reduce((sum, food) => sum + food.rating, 0) / count;

      const categoryCount = new Set(
        selectedFoods.map((food) => food.category)
      ).size;

      const remainingBudget = safeBudget - total;

      combinations.push({
        items: selectedFoods.map((food) => ({
          id: food.id,
          name: food.name,
          category: food.category,
          price: food.price,
          quantity: 1,
        })),
        total,
        remainingBudget,
        itemCount: count,
        averageRating: Number(ratingScore.toFixed(1)),
        variety: categoryCount,
        perPersonCost: Number((total / safePeople).toFixed(2)),
      });
    }

    if (selectedFoods.length >= safeMaxItems) {
      return;
    }

    for (let i = startIndex; i < availableFoods.length; i++) {
      const food = availableFoods[i];
      const newTotal = total + food.price;

      if (newTotal <= safeBudget) {
        generateCombinations(
          i + 1,
          [...selectedFoods, food],
          newTotal
        );
      }
    }
  }

  generateCombinations(0, [], 0);

  combinations.sort((a, b) => {
    if (b.itemCount !== a.itemCount) {
      return b.itemCount - a.itemCount;
    }

    if (b.variety !== a.variety) {
      return b.variety - a.variety;
    }

    if (b.averageRating !== a.averageRating) {
      return b.averageRating - a.averageRating;
    }

    return b.total - a.total;
  });

  const uniqueCombinations = [];
  const seen = new Set();

  for (const combination of combinations) {
    const key = combination.items
      .map((item) => item.id)
      .sort((a, b) => a - b)
      .join("-");

    if (!seen.has(key)) {
      seen.add(key);
      uniqueCombinations.push(combination);
    }

    if (uniqueCombinations.length >= 5) {
      break;
    }
  }

  if (uniqueCombinations.length === 0) {
    return {
      success: true,
      message: "No food combination fits the selected budget.",
      budget: safeBudget,
      people: safePeople,
      combinations: [],
    };
  }

  return {
    success: true,
    budget: safeBudget,
    people: safePeople,
    isVeg,
    includeDessert,
    combinations: uniqueCombinations,
    bestCombination: uniqueCombinations[0],
  };
}

module.exports = {
  optimizeBudget,
};