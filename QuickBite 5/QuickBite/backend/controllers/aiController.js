const {chatWithBot}= require("../services/chatbotService");
const{recommendFoods}= require("../services/recommendationService");
const {
  analyzeMultipleReviews,
} = require("../services/reviewAnalysisService");
exports.chat=async(req,res)=>{
    try{
        console.log("AI CHAT ROUTE HIT");
        const{message,history=[], budget,diet,spice,restaurantId}=req.body;
        console.log("Calling chatWithBot...");
        const result = await chatWithBot(message,{budget,diet,spice,restaurantId}, history);

        return res.status(200).json({
            success:true, ...result
        });
    }catch(error){
        return res.status(400).json({
            success:false, message:error.message||" chat request failed"
        });
    }
};

exports.recommend = async(req,res)=>{
    try{
        const{budget , preference,limit,diet,spice,restaurantId}= req.query;
        const foods = await recommendFoods({budget,preference,limit,diet,spice,restaurantId});
        return res.status(200).json({
            success:true,
            count:foods.length,
            recommendations:foods
        });
    } catch (error) {
  console.error("AI chat error:", error.stack || error);

  return res.status(500).json({
    success: false,
    message: error.message || "Chat request failed"
   
  });
}
};

exports.groupOrder = async (req, res) => {
  try {
    const {
      budget,
      members = [],
      diet,
      restaurantId,
    } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one group member.",
      });
    }

    const totalBudget = Number(budget);

    if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid group budget.",
      });
    }

    const foods = await recommendFoods({
      budget: totalBudget,
      diet,
      restaurantId,
      limit: 10,
    });

    if (!foods.length) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        message: "No matching foods found. Try increasing the budget.",
      });
    }

    const recommendations = foods.map((food) => ({
      id: String(food._id),
      _id: String(food._id),
      name: food.name,
      price: Number(food.price),
      category: food.category || "Popular",
      image: food.image || "",
      restaurant: food.restaurant,
    }));

    return res.status(200).json({
      success: true,
      recommendations,
      totalBudget,
      membersCount: members.length,
    });
  } catch (error) {
    console.error("Group order generation failed:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Could not generate group order.",
    });
  }
};


exports.reviewAnalysis = async (req, res) => {
  try {
    const { reviews } = req.body;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one review.",
      });
    }

    const result = analyzeMultipleReviews(reviews);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const aspectAnalysis = {};

    for (const [aspect, data] of Object.entries(result.aspectSummary)) {
      aspectAnalysis[aspect] = {
        mentions: data.mentions,
        positive: data.positive,
        negative: data.negative,
        neutral: data.neutral,
        positivePercentage: data.mentions
          ? Number(((data.positive / data.mentions) * 100).toFixed(2))
          : 0,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        sentiment: {
          positive: result.positive,
          negative: result.negative,
          neutral: result.neutral,
          positivePercentage: result.positivePercentage,
          negativePercentage: result.negativePercentage,
          neutralPercentage: result.neutralPercentage,
        },
        aspects: aspectAnalysis,
      },
    });
  } catch (error) {
    console.error("Review analysis failed:", error);

    return res.status(500).json({
      success: false,
      message: "Review analysis failed.",
    });
  }
};
