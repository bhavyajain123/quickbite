
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Restaurant = require("../models/Restaurant");
const Food = require("../models/Food");


const foodImages = {
  "Margherita Pizza": "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
  "Farmhouse Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "Paneer Tikka Pizza": "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80",
  "Mexican Green Wave": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
  "Cheese Burst Pizza": "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
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

const foodImageFor = (name) => {
  if (foodImages[name]) return foodImages[name];

  const n = name.toLowerCase();

  if (n.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("biryani") || n.includes("rice")) {
    return "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("dosa") || n.includes("idli") || n.includes("vada")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("noodle") || n.includes("manchurian") || n.includes("chilli paneer")) {
    return "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("pasta") || n.includes("penne") || n.includes("lasagna")) {
    return "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("cake") || n.includes("brownie") || n.includes("jalebi") || n.includes("sweet") || n.includes("dessert")) {
    return "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("samosa") || n.includes("puri") || n.includes("chaat") || n.includes("pav") || n.includes("pakora")) {
    return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("wrap") || n.includes("roll") || n.includes("frankie") || n.includes("shawarma")) {
    return "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("paneer") || n.includes("tandoori") || n.includes("chicken") || n.includes("kebab")) {
    return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80";
  }
  if (n.includes("salad") || n.includes("bowl") || n.includes("smoothie") || n.includes("avocado")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80";
};

const foodImagePools = {
  pizza: [
    "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
  ],
  burger: [
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
  ],
  biryani: [
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
  ],
  dosa: [
    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1610192244261-3f33de3f72e1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1610192244261-3f33de3f72e1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&q=80",
  ],
  chinese: [
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
  ],
  indian: [
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
  ],
  healthy: [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  ],
  tandoori: [
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80",
  ],
  pasta: [
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
  ],
  dessert: [
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
  ],
  wrap: [
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1530469912745-a215c6b256ea?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1530469912745-a215c6b256ea?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80",
  ],
  street: [
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
  ],
};

const imagePoolForRestaurant = {
  "The Pizza Studio": "pizza",
  "Burger Boulevard": "burger",
  "Royal Biryani House": "biryani",
  "Dosa Junction": "dosa",
  "Wok This Way": "chinese",
  "Punjabi Tadka": "indian",
  "Healthy Harvest": "healthy",
  "Tandoori Trails": "tandoori",
  "Pasta & More": "pasta",
  "Sweet Tooth Cafe": "dessert",
  "Wrap & Roll Co.": "wrap",
  "Street Food Corner": "street",
};


const restaurantsData = [
  {
    name: "The Pizza Studio",
    cuisine: ["Pizza", "Italian"],
    address: "Connaught Place, New Delhi",
    city: "Delhi NCR",
    latitude: 28.6315,
    longitude: 77.2167,
    deliveryTime: 30,
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Margherita Pizza", 249, "Pizza"],
      ["Farmhouse Pizza", 349, "Pizza"],
      ["Paneer Tikka Pizza", 329, "Pizza"],
      ["Mexican Green Wave", 349, "Pizza"],
      ["Cheese Burst Pizza", 399, "Pizza"],
      ["Garlic Bread", 129, "Sides"],
      ["Stuffed Garlic Bread", 179, "Sides"],
      ["Pasta Alfredo", 249, "Pasta"],
      ["Pasta Arrabbiata", 229, "Pasta"],
      ["Chocolate Lava Cake", 129, "Dessert"],
    ],
  },
  {
    name: "Burger Boulevard",
    cuisine: ["Burgers", "American", "Fast Food"],
    address: "Rajouri Garden, New Delhi",
    city: "Delhi NCR",
     latitude: 28.6422,
  longitude: 77.1215,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Classic Veg Burger", 129, "Burgers"],
      ["Crispy Chicken Burger", 179, "Burgers"],
      ["Paneer Crunch Burger", 169, "Burgers"],
      ["Double Cheese Burger", 219, "Burgers"],
      ["Peri Peri Fries", 119, "Sides"],
      ["Cheese Loaded Fries", 159, "Sides"],
      ["Onion Rings", 99, "Sides"],
      ["Veggie Wrap", 149, "Wraps"],
      ["Chocolate Milkshake", 139, "Drinks"],
      ["Brownie Sundae", 149, "Dessert"],
    ],
  },
  {
    name: "Royal Biryani House",
    cuisine: ["Biryani", "Mughlai", "North Indian"],
    address: "Lajpat Nagar, New Delhi",
    city: "Delhi NCR",
     latitude: 28.5677,
    longitude: 77.2433,
    deliveryTime: 40,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Veg Dum Biryani", 229, "Biryani"],
      ["Paneer Biryani", 249, "Biryani"],
      ["Chicken Biryani", 299, "Biryani"],
      ["Hyderabadi Biryani", 319, "Biryani"],
      ["Mutton Biryani", 369, "Biryani"],
      ["Jeera Rice", 129, "Rice"],
      ["Chicken Kebab", 249, "Starters"],
      ["Paneer Tikka", 229, "Starters"],
      ["Boondi Raita", 49, "Sides"],
      ["Shahi Tukda", 99, "Dessert"],
    ],
  },
  {
    name: "Dosa Junction",
    cuisine: ["South Indian", "Dosa"],
    address: "Janakpuri, New Delhi",
    city: "Delhi NCR",
     latitude: 28.6219,
     longitude: 77.0878,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Plain Dosa", 99, "Dosa"],
      ["Masala Dosa", 139, "Dosa"],
      ["Mysore Masala Dosa", 159, "Dosa"],
      ["Paneer Dosa", 179, "Dosa"],
      ["Onion Uttapam", 129, "Uttapam"],
      ["Idli Sambhar", 89, "Breakfast"],
      ["Medu Vada", 89, "Breakfast"],
      ["Ghee Roast Dosa", 169, "Dosa"],
      ["Lemon Rice", 119, "Rice"],
      ["Filter Coffee", 59, "Drinks"],
    ],
  },
  {
    name: "Wok This Way",
    cuisine: ["Chinese", "Asian", "Thai"],
    address: "Dwarka, New Delhi",
    city: "Delhi NCR",
     latitude: 28.5921,
     longitude: 77.0460,
    deliveryTime: 35,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Veg Hakka Noodles", 179, "Noodles"],
      ["Chilli Garlic Noodles", 199, "Noodles"],
      ["Veg Fried Rice", 179, "Rice"],
      ["Schezwan Fried Rice", 209, "Rice"],
      ["Chilli Paneer", 229, "Starters"],
      ["Veg Manchurian", 199, "Starters"],
      ["Spring Rolls", 149, "Starters"],
      ["Thai Green Curry", 279, "Thai"],
      ["Steamed Momos", 129, "Momos"],
      ["Honey Chilli Potato", 169, "Starters"],
    ],
  },
  {
    name: "Punjabi Tadka",
    cuisine: ["North Indian", "Punjabi"],
    address: "Pitampura, New Delhi",
    city: "Delhi NCR",
     latitude: 28.7033,
    longitude: 77.1322,
    deliveryTime: 35,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Dal Makhani", 219, "Main Course"],
      ["Shahi Paneer", 249, "Main Course"],
      ["Kadai Paneer", 239, "Main Course"],
      ["Chole Bhature", 169, "Combos"],
      ["Amritsari Kulcha", 149, "Breads"],
      ["Butter Naan", 49, "Breads"],
      ["Garlic Naan", 59, "Breads"],
      ["Paneer Paratha", 119, "Parathas"],
      ["Jeera Rice", 129, "Rice"],
      ["Gulab Jamun", 79, "Dessert"],
    ],
  },
  {
    name: "Healthy Harvest",
    cuisine: ["Healthy", "Salads", "Continental"],
    address: "Vasant Kunj, New Delhi",
    city: "Noida",
     latitude: 28.5245,
    longitude: 77.1588,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Garden Fresh Salad", 179, "Salads"],
      ["Quinoa Power Bowl", 249, "Bowls"],
      ["Grilled Paneer Bowl", 229, "Bowls"],
      ["Grilled Chicken Salad", 279, "Salads"],
      ["Avocado Toast", 199, "Breakfast"],
      ["Peanut Butter Smoothie", 149, "Drinks"],
      ["Fruit Yogurt Bowl", 169, "Breakfast"],
      ["Veggie Wrap", 179, "Wraps"],
      ["Roasted Vegetable Sandwich", 189, "Sandwiches"],
      ["Fresh Orange Juice", 99, "Drinks"],
    ],
  },
  {
    name: "Tandoori Trails",
    cuisine: ["Tandoori", "North Indian", "Mughlai"],
    address: "Karol Bagh, New Delhi",
    city: "Noida",
     latitude: 28.6514,
    longitude: 77.1907,
    deliveryTime: 40,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Paneer Tikka", 229, "Starters"],
      ["Malai Paneer Tikka", 249, "Starters"],
      ["Tandoori Chicken", 329, "Starters"],
      ["Chicken Tikka", 299, "Starters"],
      ["Hara Bhara Kebab", 179, "Starters"],
      ["Dal Tadka", 179, "Main Course"],
      ["Butter Chicken", 329, "Main Course"],
      ["Kadai Chicken", 319, "Main Course"],
      ["Tandoori Roti", 25, "Breads"],
      ["Laccha Paratha", 49, "Breads"],
    ],
  },
  {
    name: "Pasta & More",
    cuisine: ["Italian", "Pasta", "Continental"],
    address: "Saket, New Delhi",
    city: "Noida",
     latitude: 28.5244,
     longitude: 77.2066,
    deliveryTime: 30,
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Penne Alfredo", 249, "Pasta"],
      ["Penne Arrabbiata", 229, "Pasta"],
      ["Mac and Cheese", 239, "Pasta"],
      ["Lasagna", 299, "Pasta"],
      ["Pesto Pasta", 269, "Pasta"],
      ["Garlic Bread", 99, "Sides"],
      ["Bruschetta", 149, "Starters"],
      ["Margherita Flatbread", 219, "Pizza"],
      ["Mushroom Risotto", 279, "Rice"],
      ["Tiramisu", 159, "Dessert"],
    ],
  },
  {
    name: "Sweet Tooth Cafe",
    cuisine: ["Desserts", "Bakery", "Cafe"],
    address: "Hauz Khas, New Delhi",
    city: "Noida",
     latitude: 28.5494,
     longitude: 77.2201,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Chocolate Brownie", 99, "Dessert"],
      ["Chocolate Lava Cake", 129, "Dessert"],
      ["Blueberry Cheesecake", 179, "Dessert"],
      ["Red Velvet Pastry", 149, "Dessert"],
      ["Chocolate Donut", 79, "Bakery"],
      ["Butter Croissant", 99, "Bakery"],
      ["Chocolate Chip Cookie", 69, "Bakery"],
      ["Strawberry Milkshake", 139, "Drinks"],
      ["Belgian Waffle", 169, "Dessert"],
      ["Chocolate Fudge Sundae", 159, "Dessert"],
    ],
  },
  {
    name: "Wrap & Roll Co.",
    cuisine: ["Wraps", "Rolls", "Fast Food"],
    address: "Noida Sector 18, Noida",
    city: "Noida",
     latitude: 28.5708,
    longitude: 77.3261,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Paneer Kathi Roll", 169, "Rolls"],
      ["Chicken Kathi Roll", 199, "Rolls"],
      ["Veg Frankie", 119, "Wraps"],
      ["Chicken Shawarma Wrap", 219, "Wraps"],
      ["Falafel Wrap", 179, "Wraps"],
      ["Peri Peri Paneer Wrap", 189, "Wraps"],
      ["Egg Roll", 129, "Rolls"],
      ["Cheese Corn Roll", 149, "Rolls"],
      ["Loaded Nachos", 179, "Sides"],
      ["Masala Lemonade", 69, "Drinks"],
    ],
  },
  {
    name: "Street Food Corner",
    cuisine: ["Street Food", "Chaat", "Indian"],
    address: "Chandni Chowk, Old Delhi",
    city: "Delhi NCR",
     latitude: 28.6506,
     longitude: 77.2303,
    deliveryTime: 30,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    dishes: [
      ["Pani Puri", 69, "Chaat"],
      ["Aloo Tikki Chaat", 99, "Chaat"],
      ["Papdi Chaat", 89, "Chaat"],
      ["Dahi Bhalla", 109, "Chaat"],
      ["Pav Bhaji", 129, "Street Food"],
      ["Vada Pav", 69, "Street Food"],
      ["Samosa", 29, "Snacks"],
      ["Bread Pakora", 49, "Snacks"],
      ["Chole Kulche", 119, "Street Food"],
      ["Jalebi", 79, "Dessert"],
    ],
  },
];

const descriptionFor = (name, category) =>
  `${name} prepared fresh and served in our ${category.toLowerCase()} selection.`;

async function seedRestaurants() {
  await connectDB();

  let restaurantsAdded = 0;
  let foodsAdded = 0;

  for(const item of restaurantsData){
await Restaurant.updateOne(
  { name: item.name },
  {
    $set: {
      latitude: item.latitude,
      longitude: item.longitude,
      city: item.city,
    },
  }
);
    console.log(`coordinates updated:${item.name}`);
  }

  for (const item of restaurantsData) {
    
    let restaurant = await Restaurant.findOne({ name: item.name });

    if (!restaurant) {
      restaurant = await Restaurant.create({
        name: item.name,
        description: `Fresh ${item.cuisine.join(", ")} favourites prepared to order.`,
        image: item.image,
        cuisine: item.cuisine,
        address: item.address,
        deliveryTime: item.deliveryTime,
        rating: 4.5,
        isOpen: true,
        latitude:item.latitude,
        longitude:item.longitude,
      });
      restaurantsAdded++;
      console.log(`Added restaurant: ${item.name}`);
} else {
  restaurant.latitude = item.latitude;
  restaurant.longitude = item.longitude;
  restaurant.city = item.city;

  await restaurant.save();
  console.log(`Updated restaurant coordinates and city: ${item.name}`);
}
 
    
  
    const poolName = imagePoolForRestaurant[item.name];
    const imagePool = foodImagePools[poolName];

    if (!imagePool || imagePool.length === 0) {
      throw new Error(`No image pool configured for ${item.name}`);
    }

    const oldFoods = await Food.deleteMany({
      restaurant: restaurant._id,
    });

    console.log(
      `Removed ${oldFoods.deletedCount} old dishes from ${item.name}`
    );

    for (let i = 0; i < item.dishes.length; i++) {
      const [name, price, category] = item.dishes[i];

      await Food.create({
        name,
        description: `${name}, freshly prepared and served hot.`,
        image: foodImageFor(name),
        price,
        category,
        restaurant: restaurant._id,
        isAvailable: true,
      });

      foodsAdded++;
    }
  }
  console.log("\nSeed completed successfully.");
  console.log(`Restaurants added: ${restaurantsAdded}`);
  console.log(`Dishes added: ${foodsAdded}`);

  const restaurantCount = await Restaurant.countDocuments();
  const foodCount = await Food.countDocuments();

  console.log(`Total restaurants in database: ${restaurantCount}`);
  console.log(`Total food items in database: ${foodCount}`);
}

seedRestaurants()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });