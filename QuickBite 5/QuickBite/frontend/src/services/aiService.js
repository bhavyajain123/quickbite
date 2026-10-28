const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

async function sendAIRequest(endpoint, data) {
  const response = await fetch(`${API_URL}/ai/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(result.message || "AI request failed.");
  }

  return result;
}

export function getCravingRecommendations(data) {
  return sendAIRequest("cravings", data);
}

export function optimizeFoodBudget(data) {
  return sendAIRequest("budget-optimizer", data);
}

export function getGroupOrderRecommendations(data) {
  return sendAIRequest("group-order", data);
}

export function analyzeRestaurantReviews(data) {
  return sendAIRequest("review-analysis", data);
}