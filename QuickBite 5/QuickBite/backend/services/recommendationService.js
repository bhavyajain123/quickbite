const Food = require("../models/Food");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function classifyFood(food){
    const explicitType= String(food.foodType || food.type || food.dietaryType||"").toLowerCase();

    if(food.isVeg ===true|| explicitType==="veg"|| explicitType==="vegetarian") return "veg";
     if(food.isVeg ===false|| explicitType==="non-veg"|| explicitType==="non-vegetarian") return "non-veg";

     const text=[food.name,food.description,food.category].filter(Boolean).join("  ").toLowerCase();

       if (/\b(chicken|mutton|fish|prawn|seafood|keema|egg)\b/.test(text)) {
    return "non-veg";
  }
  if (/\b(paneer|tofu|vegetarian|vegan|dal|aloo|gobi|veg)\b/.test(text)) {
    return "veg";
  }
  return "unknown";

}
async function recommendFoods({budget , preference,diet,spice,restaurantId,limit=5}={}){
    const filter={};

    if(budget !==undefined && budget!==null && budget!==""){
        const maxBudget =Number(budget);
        if(!Number.isFinite(maxBudget)|| maxBudget<0){
            throw new Error("budget should be positive");

        }
        filter.price={$lte:maxBudget};
    }

    if(restaurantId){
        if (!/^[a-f\d]{24}$/i.test(restaurantId)) {
      throw new Error("Invalid restaurant ID");
    }
    filter.restaurant= restaurantId;
    }
    if(preference && preference.trim()){
        filter.name={$regex:escapeRegex(preference.trim()),$options:"i"};

    }

    console.log("MongoDB filter:", filter);
    const foods = await Food.find(filter)
    .select("name price description category image restaurant isVeg foodType type dietaryType")
    .lean();
    console.log("Foods from MongoDB:", foods);
    let results =foods;
    console.log("Diet:", diet);
console.log("Classification:", foods.map((food) => classifyFood(food)));

    console.log("Diet:", diet, "Classification:", foods.map(classifyFood));

    if(diet==="veg"|| diet==="non-veg"){
        results=results.filter((food)=>classifyFood(food)===diet);
    }
    if(spice==="spicy" || spice==="mild"){
        const spicyPattern=/\b(spicy|hot|chilli|chili|pepper|schezwan|vindaloo)\b/i;

        results = results.filter((food)=>{
            const text=`${food.name|| ""}${food.description ||""}${food.category ||""}`;
            const seemsSpicy= spicyPattern.test(text);
            return spice ==="spicy"? seemsSpicy :!seemsSpicy;
        });
    }
    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 10);
  return results.slice(0, safeLimit);
}

  async function suggestMealCombo({budget,diet,spice,restaurantId}={}){
    const foods= await recommendFoods({budget,diet,spice,restaurantId,limit:30});
    const mains= foods.filter((food)=>
         /\b(main|meal|biryani|pizza|burger|pasta|rice|thali|dosa|paneer|noodles)\b/i
      .test(`${food.name || ""} ${food.category || ""
    }`)
);
const sides =foods.filter((food)=>
    /\b(drink|beverage|juice|shake|lassi|water|soda|cola)\b/i
      .test(`${food.name || ""} ${food.category || ""}`)
);
const combos=[];
for(const main of mains){
    for(const side of sides){
        if(side._id.equals(main._id)) continue;
        const total = Number(main.price)+ Number(side.price);
        if(budget!==null && total>Number(budget))continue;

        combos.push({items:[main,side],total});
        for(const drink of drinks){
            if(drink._id.equals(main._id)|| drink._id.equals(side._id)){
                continue;
            }
            const fullTotal = total+Number(drink.price);
            if(budget!=null && fullTotal>Number(budget)) continue;
            
            combos.push({
                items:[main,side,drink],
                total:fullTotal
            });
        }
    }
}
return combos.slice(0, 5);
  }



module.exports ={recommendFoods, suggestMealCombo, classifyFood};