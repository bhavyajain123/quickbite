
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const mongoose = require("mongoose");
const Food = require("../models/Food");

const foodImages = {
  "Margherita Pizza": "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
  "Farmhouse Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "Paneer Tikka Pizza": "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80",
  "Mexican Green Wave": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
  "Cheese Burst Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "Garlic Bread": "https://images.unsplash.com/photo-1619531040576-f9416740661b?auto=format&fit=crop&w=800&q=80",
  "Stuffed Garlic Bread": "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80",
  "Pasta Alfredo": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80",
  "Pasta Arrabbiata": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  "Chocolate Lava Cake": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
  "Classic Veg Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  "Crispy Chicken Burger": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",
  "Paneer Crunch Burger": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
  "Double Cheese Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  "Peri Peri Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
  "Pani Puri": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  "Samosa": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=800&q=80",
  "Jalebi": "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80"
};

function getImage(name) {
  if (foodImages[name]) return foodImages[name];

  const n = name.toLowerCase();

  if (n.includes("pizza")) return foodImages["Farmhouse Pizza"];
  if (n.includes("burger")) return foodImages["Classic Veg Burger"];
  if (n.includes("fries")) return foodImages["Peri Peri Fries"];
  if (n.includes("pasta") || n.includes("lasagna")) return foodImages["Pasta Alfredo"];
  if (n.includes("garlic bread")) return foodImages["Garlic Bread"];
  if (n.includes("cake") || n.includes("brownie") || n.includes("lava") || n.includes("jalebi")) return foodImages["Chocolate Lava Cake"];
  if (n.includes("samosa") || n.includes("pani puri") || n.includes("chaat")) return foodImages["Pani Puri"];
  if (n.includes("roll") || n.includes("wrap") || n.includes("frankie") || n.includes("shawarma")) return "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80";
  if (n.includes("biryani") || n.includes("rice")) return "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=800&q=80";
  if (n.includes("dosa") || n.includes("idli") || n.includes("vada")) return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80";
  if (n.includes("noodle") || n.includes("manchurian") || n.includes("spring roll")) return "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80";
  if (n.includes("salad") || n.includes("bowl") || n.includes("smoothie") || n.includes("avocado")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80";
  if (n.includes("paneer") || n.includes("tandoori") || n.includes("chicken") || n.includes("kebab")) return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80";

  return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80";
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const foods = await Food.find().select("_id name image").lean();
  let updated = 0;

  for (const food of foods) {
    // Preserve existing manually added items that already have non-Lorem images.
    if (
      food.image &&
      !food.image.includes("loremflickr.com") &&
      !food.image.includes("loremflickr")
    ) {
      continue;
    }

    await Food.updateOne(
      { _id: food._id },
      { $set: { image: getImage(food.name) } }
    );

    updated++;
  }

  console.log(`Finished. Food images updated: ${updated}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Image update failed:", error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
