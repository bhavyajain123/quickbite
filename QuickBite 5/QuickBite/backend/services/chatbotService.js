const {recommendFoods,suggestMealCombo}= require("./recommendationService");
const{askGemini}= require("./geminiService");
async function chatWithBot(message,options={}, history=[]) {
    if(typeof message !=="string" || !message.trim()){
        throw new Error("please enter a message");
    }
    const text = message.trim();
    const lower =text.toLowerCase();
    const budgetMatch = text.match(/(?:under|below|within|budget|₹|rs\.?)\s*₹?\s*(\d+)/i);
    const budget = budgetMatch? Number(budgetMatch[1]):undefined;
    const foodKeywords=["paneer","pizza","burger","biryani","dosa","sandwich","pasta","tikka","noodles"];


    const preference = foodKeywords.find((food) =>
    text.toLowerCase().includes(food)
  );
   const diet = /\b(non[- ]?veg|nonvegetarian|chicken|mutton|fish)\b/i.test(text)
    ? "non-veg"
    : /\b(veg|vegetarian|vegan)\b/i.test(text)
      ? "veg"
      : options.diet;

     const spice = /\b(spicy|spicy food|hot food|teekha|teekhi)\b/i.test(text)
    ? "spicy"
    : /\b(mild|less spicy|not spicy|kam teekha)\b/i.test(text)
      ? "mild"
      : options.spice;

      const restaurantId =options.restaurantId;
      const wantsCombo=/\b(combo|meal deal|with a drink|with drink|side dish|meal combination)\b/i.test(text);
 let foods;
 let  combos=[];
 if(wantsCombo){
    combos=await suggestMealCombo({budget, diet,spice,restaurantId});

    foods=[ ...new Map(
        combos.flatMap((combo) => combo.items)
          .map((food) => [String(food._id), food])
      ).values()];
 }else{
    foods =await recommendFoods({budget,preference,diet,spice,restaurantId, limit:5});
    console.log("After recommendFoods:", foods);
 }

 console.log("Foods:", foods);
console.log("History:", history);
    const reply =await askGemini(text,foods,history);
    
    return { reply, recommendations: foods, combos };
}
module.exports={chatWithBot};