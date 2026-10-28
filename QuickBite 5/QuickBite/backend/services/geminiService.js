const {GoogleGenAI} = require("@google/genai");

if(!process.env.GEMINI_API_KEY){
    throw new Error("GEMINI_API_KEY is missing from env");
}
const ai= new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

async function askGemini(message, foods=[],history=[]){
    if(typeof message !=="string"|| !message.trim()){
        throw new Error("please provide a message");
    }
    const menu =foods.map((food)=>({
        name:food.name,
        price:food.price,
        category:food.category,
        description:food.description,
        restaurant:String(food.restaurant||"")
    }));

    const safeHistory=Array.isArray(history)
    ?history
    .filter((item)=>
    item &&
["user","model"].includes(item.role)&& typeof item.text ==="string")
.slice(-8)
.map((item) => ({
          role: item.role,
          parts: [{ text: item.text.slice(0, 1500) }]
        }))
    : [];
console.log("Gemini call starting");
console.log("Model:", process.env.GEMINI_MODEL);
console.log("API key exists:", !!process.env.GEMINI_API_KEY);
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
    contents: [
      ...safeHistory,
      {
        role: "user",
        parts: [{
        text:`
        You are QuickBite's friendly food assistant.
Reply in the user's language, using Hindi or Hinglish when appropriate.
Recommend only foods in the supplied database menu.
Never invent food names, prices, availability, or restaurant details.
For combos, use only supplied items and their prices.
The backend calculates combo totals; don't claim a total unless the exact items and prices are provided.
If dietary or spice information is unknown, say so instead of guessing.

Available menu:
${JSON.stringify(menu)}

User's latest message:
${message.trim()}
`
        }]
      }
    ]
  });
  console.log("Gemini response received");
    return response.text || "sorry, cant generate response,";
}
module.exports={askGemini};