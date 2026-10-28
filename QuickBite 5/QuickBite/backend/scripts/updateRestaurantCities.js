require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Restaurant = require("../models/Restaurant");

const restaurantsData = [
  { name: "The Pizza Studio", city: "Delhi NCR" },
  { name: "Burger Boulevard", city: "Delhi NCR" },
  { name: "Royal Biryani House", city: "Delhi NCR" },
  { name: "Dosa Junction", city: "Delhi NCR" },
  { name: "Wok This Way", city: "Delhi NCR" },
  { name: "Punjabi Tadka", city: "Delhi NCR" },
  { name: "Healthy Harvest", city: "Delhi NCR" },
  { name: "Tandoori Trails", city: "Delhi NCR" },
  { name: "Pasta & More", city: "Delhi NCR" },
  { name: "Sweet Tooth Cafe", city: "Delhi NCR" },
  { name: "Wrap & Roll Co.", city: "Noida" },
  { name: "Street Food Corner", city: "Delhi NCR" },
];

async function main() {
  await connectDB();

  for (const item of restaurantsData) {
    const result = await Restaurant.updateOne(
      { name: item.name },
      { $set: { city: item.city } }
    );

    console.log(
      `${item.name}: ${
        result.matchedCount ? `updated to ${item.city}` : "not found"
      }`
    );
  }
}

main()
  .catch((error) => {
    console.error("City update failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });