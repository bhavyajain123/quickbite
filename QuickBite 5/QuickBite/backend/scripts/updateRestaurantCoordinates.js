require("dotenv").config();
const connectDB = require("../config/db");
const Restaurant = require("../models/Restaurant");
const restaurantsData = [
  { name: "The Pizza Studio", latitude: 28.6315, longitude: 77.2167 },
  { name: "Burger Boulevard", latitude: 28.6422, longitude: 77.1215 },
  { name: "Royal Biryani House", latitude: 28.5677, longitude: 77.2433 },
  { name: "Dosa Junction", latitude: 28.6219, longitude: 77.0878 },
  { name: "Wok This Way", latitude: 28.5921, longitude: 77.0460 },
  { name: "Punjabi Tadka", latitude: 28.7033, longitude: 77.1322 },
  { name: "Healthy Harvest", latitude: 28.5245, longitude: 77.1588 },
  { name: "Tandoori Trails", latitude: 28.6514, longitude: 77.1907 },
  { name: "Pasta & More", latitude: 28.5244, longitude: 77.2066 },
  { name: "Sweet Tooth Cafe", latitude: 28.5494, longitude: 77.2201 },
  { name: "Wrap & Roll Co.", latitude: 28.5708, longitude: 77.3261 },
  { name: "Street Food Corner", latitude: 28.6506, longitude: 77.2303 },
];
async function updateCoordinates() {
  try {
    await connectDB();

    for (const item of restaurantsData) {
      const result = await Restaurant.updateOne(
        { name: item.name },
        {
          $set: {
            latitude: item.latitude,
            longitude: item.longitude,
          },
        }
      );

      if(result.matchedCount === 0) {
        console.log(`Restaurant not found: ${item.name}`);
      } else{
        console.log(`Coordinates updated: ${item.name}`);
      }
    }
    console.log("Restaurant coordinate update finished.");
  } catch (error){
    console.error("Coordinate update failed:", error.message);
    process.exitCode = 1;
  } finally {
    await require("mongoose").disconnect();
  }
}
updateCoordinates();