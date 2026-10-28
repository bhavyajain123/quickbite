const positiveWords = [
  "good",
  "great",
  "excellent",
  "amazing",
  "delicious",
  "tasty",
  "fresh",
  "awesome",
  "love",
  "loved",
  "perfect",
  "fast",
  "friendly",
  "wonderful",
  "best",
  "yummy",
  "fantastic",
  "crispy",
  "affordable",
  "recommend",
];

const negativeWords = [
  "bad",
  "worst",
  "terrible",
  "awful",
  "disgusting",
  "cold",
  "stale",
  "late",
  "slow",
  "rude",
  "expensive",
  "overpriced",
  "bland",
  "uncooked",
  "burnt",
  "burned",
  "dirty",
  "poor",
  "disappointing",
  "hate",
];

const aspects = {
  taste: [
    "taste",
    "tasty",
    "delicious",
    "flavor",
    "flavour",
    "spicy",
    "bland",
    "salty",
    "sweet",
  ],
  delivery: [
    "delivery",
    "delivered",
    "driver",
    "rider",
    "late",
    "delay",
    "fast",
    "slow",
    "arrived",
  ],
  packaging: [
    "packaging",
    "packed",
    "package",
    "leaked",
    "spill",
    "spilled",
    "container",
    "sealed",
  ],
  quality: [
    "quality",
    "fresh",
    "stale",
    "cold",
    "hot",
    "burnt",
    "burned",
    "uncooked",
    "raw",
  ],
  price: [
    "price",
    "cost",
    "expensive",
    "overpriced",
    "affordable",
    "cheap",
    "value",
    "worth",
  ],
  service: [
    "service",
    "staff",
    "rude",
    "friendly",
    "polite",
    "support",
    "helpful",
    "response",
  ],
};

const negativePhrases = [
  "not good",
  "not tasty",
  "not fresh",
  "not delicious",
  "not worth",
  "not bad",
  "never again",
  "waste of money",
  "highly disappointed",
  "very poor",
];

const positivePhrases = [
  "very good",
  "really good",
  "very tasty",
  "highly recommend",
  "value for money",
  "worth the money",
  "must try",
  "loved it",
];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countMatches(text, words) {
  return words.reduce((count, word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "g");
    return count + (text.match(regex) || []).length;
  }, 0);
}

function getSentiment(review) {
  const text = normalizeText(review);

  if (!text) {
    return {
      sentiment: "neutral",
      positiveScore: 0,
      negativeScore: 0,
      confidence: 0,
    };
  }

  let positiveScore = countMatches(text, positiveWords);
  let negativeScore = countMatches(text, negativeWords);

  positiveScore += positivePhrases.filter((phrase) =>
    text.includes(phrase)
  ).length * 2;

  negativeScore += negativePhrases.filter((phrase) =>
    text.includes(phrase)
  ).length * 2;

  const negationPattern =
    /\b(not|never|no|hardly|barely)\s+(very\s+|really\s+|too\s+)?(good|great|excellent|amazing|delicious|tasty|fresh|awesome|perfect|wonderful|fantastic|yummy|friendly|fast|bad|worst|terrible|awful|disgusting|cold|stale|late|slow|rude|expensive|overpriced|bland|uncooked|burnt|burned|dirty|poor|disappointing)\b/g;

  const negatedMatches = [...text.matchAll(negationPattern)];

  for (const match of negatedMatches) {
    const word = match[3];

    if (positiveWords.includes(word)) {
      positiveScore = Math.max(0, positiveScore - 1);
      negativeScore += 1;
    } else if (negativeWords.includes(word)) {
      negativeScore = Math.max(0, negativeScore - 1);
      positiveScore += 1;
    }
  }

  const total = positiveScore + negativeScore;

  if (total === 0 || positiveScore === negativeScore) {
    return {
      sentiment: "neutral",
      positiveScore,
      negativeScore,
      confidence: total === 0 ? 0.5 : 0.6,
    };
  }

  const sentiment =
    positiveScore > negativeScore ? "positive" : "negative";

  const confidence = Number(
    (
      Math.max(positiveScore, negativeScore) /
      total
    ).toFixed(2)
  );

  return {
    sentiment,
    positiveScore,
    negativeScore,
    confidence,
  };
}

function analyzeAspects(review) {
  const text = normalizeText(review);
  const results = {};

  for (const [aspect, keywords] of Object.entries(aspects)) {
    const matchedKeywords = keywords.filter((keyword) =>
      text.includes(keyword)
    );

    if (matchedKeywords.length > 0) {
      results[aspect] = {
        mentioned: true,
        keywords: matchedKeywords,
      };
    } else {
      results[aspect] = {
        mentioned: false,
        keywords: [],
      };
    }
  }

  return results;
}

function analyzeReview(review) {
  const text = String(review || "").trim();

  if (!text) {
    return {
      success: false,
      message: "Review text is required.",
    };
  }

  const sentimentResult = getSentiment(text);

  return {
    success: true,
    review: text,
    sentiment: sentimentResult.sentiment,
    positiveScore: sentimentResult.positiveScore,
    negativeScore: sentimentResult.negativeScore,
    confidence: sentimentResult.confidence,
    aspects: analyzeAspects(text),
  };
}

function analyzeMultipleReviews(reviews = []) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return {
      success: false,
      message: "Please provide at least one review.",
    };
  }

  const analyzedReviews = reviews.map((item) => {
    const reviewText =
      typeof item === "string" ? item : item.review;

    return {
      review: reviewText,
      ...(analyzeReview(reviewText)),
    };
  });

  const validReviews = analyzedReviews.filter(
    (review) => review.success
  );

  const positive = validReviews.filter(
    (review) => review.sentiment === "positive"
  ).length;

  const negative = validReviews.filter(
    (review) => review.sentiment === "negative"
  ).length;

  const neutral = validReviews.filter(
    (review) => review.sentiment === "neutral"
  ).length;

  const total = validReviews.length;

  const aspectSummary = {};

  for (const aspect of Object.keys(aspects)) {
    const mentionedReviews = validReviews.filter(
      (review) => review.aspects[aspect].mentioned
    );

    aspectSummary[aspect] = {
      mentions: mentionedReviews.length,
      positive: mentionedReviews.filter(
        (review) => review.sentiment === "positive"
      ).length,
      negative: mentionedReviews.filter(
        (review) => review.sentiment === "negative"
      ).length,
      neutral: mentionedReviews.filter(
        (review) => review.sentiment === "neutral"
      ).length,
    };
  }

  return {
    success: true,
    totalReviews: total,
    positive,
    negative,
    neutral,
    positivePercentage: total
      ? Number(((positive / total) * 100).toFixed(2))
      : 0,
    negativePercentage: total
      ? Number(((negative / total) * 100).toFixed(2))
      : 0,
    neutralPercentage: total
      ? Number(((neutral / total) * 100).toFixed(2))
      : 0,
    aspectSummary,
    reviews: analyzedReviews,
  };
}

module.exports = {
  analyzeReview,
  analyzeMultipleReviews,
  getSentiment,
  analyzeAspects,
};