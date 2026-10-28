

import React, { useEffect, useMemo, useState } from "react";
import { getRestaurants, getFoods } from "./api";
import Navbar from "./components/Navbar";
import FoodCard from "./components/FoodCard";
import RestaurantCard from "./components/RestaurantCard";
import Cart from "./pages/Cart";
import { useCart } from "./context/CartContext";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageFoods from "./pages/admin/ManageFoods";
import ManageRestaurants from "./pages/admin/ManageRestaurants";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import Restaurants from "./pages/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";
import SearchResults from "./pages/SearchResults";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import AIRecommendations from "./pages/AIRecommendations";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";
import SmartCombo from "./pages/SmartCombo";
import Coupons from "./pages/admin/Coupons";
import Inventory from "./pages/admin/Inventory";
import DeliveryManagement from "./pages/admin/DeliveryManagement";
import GroupOrder from "./pages/GroupOrder";
import ReviewAnalytics from "./pages/admin/ReviewAnalytics";
const adminRoutes = {

  "/admin": AdminDashboard,
  "/admin/foods": ManageFoods,
  "/admin/restaurants": ManageRestaurants,
  "/admin/orders": ManageOrders,
  "/admin/users": ManageUsers,
  "/admin/coupons": Coupons,
  "/admin/inventory": Inventory,
  "/admin/deliveries": DeliveryManagement,
  "/admin/review-analytics": ReviewAnalytics,
};

const categories = [

  { name: "All", emoji: "🍽️" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Burger", emoji: "🍔" },
  { name: "Biryani", emoji: "🍛" },
  { name: "Chinese", emoji: "🥡" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Healthy", emoji: "🥗" },

];

const restaurants = [

  {

    id: 1,
    name: "The Pizza Studio",
    image:

      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=700&q=80",

    cuisines: ["Pizza", "Italian", "Fast Food"],
    rating: 4.8,
    deliveryTime: "25–35 min",
    deliveryFee: 0,
    offer: "50% OFF up to ₹100",
    priceForTwo: 400,
    isPromoted: true,

  },

  {

    id: 2,
    name: "Burger Boulevard",
    image:

      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80",

    cuisines: ["Burgers", "American", "Fries"],
    rating: 4.6,
    deliveryTime: "20–30 min",
    deliveryFee: 20,
    offer: "Free fries on orders above ₹299",
    priceForTwo: 350,

  },

  {

    id: 3,
    name: "Royal Biryani House",
    image:

      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=700&q=80",

    cuisines: ["Biryani", "North Indian", "Mughlai"],

    rating: 4.7,
    deliveryTime: "30–40 min",
    deliveryFee: 25,
    offer: "20% OFF on selected dishes",
    priceForTwo: 500,

  },

  {

    id: 4,
    name: "Wok This Way",
    image:

      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80",

    cuisines: ["Chinese", "Noodles", "Asian"],
    rating: 4.5,
    deliveryTime: "25–35 min",
    deliveryFee: 0,
    offer: "Free delivery",

    priceForTwo: 400,

  },

  {

    id: 5,
    name: "Green Bowl Co.",
    image:

      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",

    cuisines: ["Healthy", "Salads", "Bowls"],

    rating: 4.6,
    deliveryTime: "15–25 min",
    deliveryFee: 20,

    offer: "Healthy meals from ₹149",
    priceForTwo: 350,

  },

  {

    id: 6,

    name: "Sweet Cravings",
    image:

      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=700&q=80",

    cuisines: ["Desserts", "Cakes", "Bakery"],
    rating: 4.9,
    deliveryTime: "20–30 min",
    deliveryFee: 15,
    offer: "Buy 1 Get 1 on desserts",
    priceForTwo: 300,

  },

];

const foods = [

  {

    id: 101,
    name: "Margherita Pizza",
    description: "Classic cheese, tomato sauce and fresh basil.",
    category: "Pizza",
    price: 249,
    originalPrice: 329,
    rating: 4.8,
    reviews: 284,
    deliveryTime: "25 min",
    image:

      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=700&q=80",

    isVeg: true,
    isBestseller: true,
    discount: "24% OFF",

  },

  {

    id: 102,
    name: "Classic Smash Burger",
    description: "Juicy patty, melted cheese and house sauce.",
    category: "Burger",
    price: 199,
    originalPrice: 259,
    rating: 4.7,
    reviews: 196,
    deliveryTime: "20 min",
    image:

      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",

    isVeg: false,
    isBestseller: true,
    discount: "23% OFF",

  },

  {

    id: 103,

    name: "Hyderabadi Biryani",
    description: "Aromatic basmati rice with authentic spices.",
    category: "Biryani",
    price: 279,
    originalPrice: 349,
    rating: 4.8,
    reviews: 312,
    deliveryTime: "30 min",

    image:

      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=700&q=80",

    isVeg: false,
    isBestseller: true,
    discount: "20% OFF",

  },

  {

    id: 104,
    name: "Veg Hakka Noodles",
    description: "Wok-tossed noodles with crunchy vegetables.",
    category: "Chinese",
    price: 169,
    originalPrice: 219,
    rating: 4.5,
    reviews: 143,
    deliveryTime: "25 min",
    image:

      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80",

    isVeg: true,
    discount: "22% OFF",

  },

  {

    id: 105,

    name: "Garden Fresh Bowl",

    description: "Fresh greens, avocado and a zesty dressing.",

    category: "Healthy",

    price: 189,

    originalPrice: 229,

    rating: 4.6,

    reviews: 98,

    deliveryTime: "15 min",

    image:

      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",

    isVeg: true,

    discount: "17% OFF",

  },

  {

    id: 106,

    name: "Chocolate Lava Cake",

    description: "Warm chocolate cake with a molten centre.",

    category: "Desserts",
    price: 129,
    originalPrice: 159,
    rating: 4.9,
    reviews: 205,

    deliveryTime: "20 min",
    image:

      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80",

    isVeg: true,
    isBestseller: true,
    discount: "19% OFF",

  },

  {

    id: 107,

    name: "Farmhouse Pizza",
    description: "Loaded with peppers, onion, corn and cheese.",
    category: "Pizza",
    price: 299,
    originalPrice: 379,
    rating: 4.7,
    reviews: 177,

    deliveryTime: "30 min",

    image:

      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",

    isVeg: true,
    discount: "21% OFF",

  },

  {

    id: 108,
    name: "Crispy Chicken Burger",
    description: "Crispy chicken, fresh lettuce and creamy mayo.",
    category: "Burger",
    price: 229,
    originalPrice: 279,

    rating: 4.6,
    reviews: 162,

    deliveryTime: "25 min",

    image:

      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=700&q=80",

    isVeg: false,

    discount: "18% OFF",

  },

];


export default function App() {
  const { cart, addToCart, cartCount, cartTotal } = useCart();

  const [apiRestaurants, setApiRestaurants] = useState([]);
  const [apiFoods, setApiFoods] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      try {
        setApiLoading(true);
        setApiError("");

        const [restaurantData, foodData] = await Promise.all([
          getRestaurants(),
          getFoods(),
        ]);

        if (!cancelled) {
          setApiRestaurants(restaurantData);
          setApiFoods(foodData);
        }
      } catch (error) {
        if (!cancelled) {
          setApiError(error.message || "Home data load nahi ho saka.");
        }
      } finally {
        if (!cancelled) {
          setApiLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();

    return apiFoods.filter((food) => {
      const category = String(food.category || "Popular");
      const name = String(food.name || "").toLowerCase();
      const description = String(food.description || "").toLowerCase();

      const matchesCategory =
        activeCategory === "All" || category === activeCategory;

      const matchesSearch =
        !query ||
        name.includes(query) ||
        description.includes(query) ||
        category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [apiFoods, search, activeCategory]);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return apiRestaurants.filter((restaurant) => {
      const name = String(restaurant.name || "").toLowerCase();

      const cuisines = Array.isArray(restaurant.cuisines)
        ? restaurant.cuisines
        : restaurant.cuisines
          ? [restaurant.cuisines]
          : [];

      return (
        !query ||
        name.includes(query) ||
        cuisines.some((cuisine) =>
          String(cuisine).toLowerCase().includes(query)
        )
      );
    });
  }, [apiRestaurants, search]);

  function handleAddToCart(food) {
    addToCart(food);
    setNotice(`${food.name} added to your cart!`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function toggleWishlist(foodId) {
    setWishlist((previous) =>
      previous.includes(foodId)
        ? previous.filter((id) => id !== foodId)
        : [...previous, foodId]
    );
  }

  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (pathname.startsWith("/admin")) {


    const AdminPage = adminRoutes[pathname];

    if (!AdminPage) {

      return (

        <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>

          <h2>Admin page not found</h2>

          <p>The page you are looking for does not exist.</p>

          <a href="/admin">Go to Admin Dashboard</a>

        </div>

      );

    }

    return <AdminPage />;

  }

  if (pathname === "/login") {

    return <Login />;

  }

  if (pathname === "/profile") {

    return (

      <ProtectedRoute>

        <Profile />

      </ProtectedRoute>

    );

  }

  if (pathname === "/cart") {

    return <Cart />;

  }



  if (pathname === "/restaurants") return <Restaurants />;

  if (pathname === "/search") return <SearchResults />;

  if (pathname === "/checkout") return <Checkout />;

  if (pathname === "/order-success") return <OrderSuccess />;

  if (pathname === "/order-tracking") return <OrderTracking />;

  if (pathname === "/my-orders") {

    return (

      <ProtectedRoute>

        <MyOrders />

      </ProtectedRoute>

    );

  }

  if (pathname === "/register") return <Register />;

  if (pathname === "/wishlist") return <Wishlist />;

  if (pathname === "/ai-recommendations") return <AIRecommendations />;
  if (pathname === "/smart-combo") return <SmartCombo />;
  if (pathname === "/group-order") return <GroupOrder />;

  if (/^\/restaurant\/[^/]+$/.test(pathname)) {

  return <RestaurantDetails />;

}

  if (pathname !== "/") return <NotFound />;

  return (

    <div className="qb-app">

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        \* { box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        body { margin: 0; font-family: 'DM Sans', sans-serif; color: #24211f; }

        button, input { font: inherit; }

        button { cursor: pointer; }

        a { color: inherit; }

        .qb-app { min-height: 100vh; background: #fffdfb; overflow: hidden; }

        .qb-container { width: min(1180px, 92%); margin: 0 auto; }

        .qb-hero { padding: 62px 0 52px; background: linear-gradient(115deg,#fff3e9 0%,#fffaf5 48%,#ffe7d5 100%); }

        .qb-hero-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 35px; align-items: center; }

        .qb-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 9px 13px; background: #fff; color: #e85b2a; border: 1px solid #ffe0cd; border-radius: 30px; font-size: 11px; font-weight: 800; letter-spacing: 1px; }

        .qb-hero h1 { margin: 22px 0 15px; font: 800 clamp(38px,5vw,64px)/1.08 'Plus Jakarta Sans',sans-serif; letter-spacing: -2.8px; }

        .qb-hero h1 span { color: #ff6b35; }

        .qb-hero-copy { max-width: 480px; color: #756b65; line-height: 1.8; font-size: 15px; }

        .qb-search { display: flex; align-items: center; gap: 10px; max-width: 500px; margin-top: 25px; padding: 7px 8px 7px 16px; background: #fff; border: 1px solid #f0e5dd; border-radius: 15px; box-shadow: 0 10px 35px #7c3c1710; }

        .qb-search input { width: 100%; min-width: 0; border: 0; outline: none; background: transparent; font-size: 13px; padding: 10px 0; }

        .qb-search button { border: 0; border-radius: 10px; background: #ff6b35; color: #fff; font-size: 12px; font-weight: 800; padding: 13px 19px; }

        .qb-hero-image { position: relative; min-height: 350px; display: grid; place-items: center; }

        .qb-hero-image img { width: 100%; height: 365px; object-fit: cover; border-radius: 30px; box-shadow: 0 24px 65px #6e351b24; }

        .qb-floating-note { position: absolute; left: -18px; bottom: 24px; padding: 15px 18px; background: #fff; border: 1px solid #f3e8e0; border-radius: 15px; box-shadow: 0 12px 32px #57301b18; font-size: 12px; font-weight: 800; }

        .qb-floating-note small { display: block; color: #81766f; font-weight: 500; margin-top: 5px; }

        .qb-offers { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; padding: 28px 0 10px; }

        .qb-offer { display: flex; align-items: center; gap: 14px; padding: 20px; border: 1px solid #f1e7df; border-radius: 17px; background: #fff; }

        .qb-offer-icon { display: grid; place-items: center; width: 45px; height: 45px; flex-shrink: 0; background: #fff0e7; border-radius: 13px; font-size: 22px; }

        .qb-offer strong { display: block; font-size: 13px; }

        .qb-offer span { display: block; color: #837972; font-size: 11px; margin-top: 5px; }

        .qb-section { padding: 50px 0 12px; }

        .qb-section-heading { display: flex; align-items: end; justify-content: space-between; gap: 15px; margin-bottom: 25px; }

        .qb-section-heading h2 { margin: 6px 0 0; font: 800 clamp(23px,3vw,31px)/1.2 'Plus Jakarta Sans',sans-serif; letter-spacing: -1px; }

        .qb-section-heading p { color: #81766f; font-size: 13px; margin: 8px 0 0; }

        .qb-mini-label { color: #ff6b35; font-size: 10px; font-weight: 800; letter-spacing: 1.7px; }

        .qb-link { color: #e85b2a; text-decoration: none; font-size: 12px; font-weight: 800; white-space: nowrap; }

        .qb-categories { display: grid; grid-template-columns: repeat(7,minmax(0,1fr)); gap: 13px; }

        .qb-category { padding: 17px 8px; text-align: center; border: 1px solid #f0e7e0; border-radius: 17px; background: #fff; color: #403a36; transition: .2s; }

        .qb-category:hover, .qb-category.active { background: #fff0e7; border-color: #ffb28e; transform: translateY(-3px); }

        .qb-category span { display: block; font-size: 28px; margin-bottom: 10px; }

        .qb-category strong { font-size: 11px; }

        .qb-restaurant-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 19px; }

        .qb-food-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 19px; }

        .qb-ai { margin-top: 50px; padding: 34px; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 20px; border-radius: 24px; background: linear-gradient(110deg,#28221f,#493128); color: #fff; }

        .qb-ai h2 { margin: 8px 0; font: 800 25px 'Plus Jakarta Sans',sans-serif; letter-spacing: -.8px; }

        .qb-ai p { color: #dfd2cb; font-size: 13px; line-height: 1.7; max-width: 600px; margin-bottom: 0; }

        .qb-ai button { padding: 14px 18px; border: 0; border-radius: 11px; background: #ff6b35; color: #fff; font-size: 12px; font-weight: 800; }

        .qb-benefits { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; padding: 30px 0 55px; }

        .qb-benefit { padding: 21px; border: 1px solid #f0e7e0; background: #fff; border-radius: 16px; }

        .qb-benefit span { font-size: 25px; }

        .qb-benefit strong { display: block; margin: 13px 0 7px; font-size: 13px; }

        .qb-benefit p { margin: 0; color: #81766f; font-size: 11px; line-height: 1.7; }

        .qb-banner { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 30px; margin-bottom: 45px; border-radius: 23px; background: #fff0e6; }

        .qb-banner h2 { margin: 0 0 8px; font: 800 24px 'Plus Jakarta Sans',sans-serif; }

        .qb-banner p { margin: 0; color: #766a62; font-size: 13px; }

        .qb-banner button { border: 0; border-radius: 11px; background: #ff6b35; color: #fff; padding: 14px 18px; font-weight: 800; font-size: 12px; white-space: nowrap; }

        .qb-footer { padding: 35px 0; background: #29231f; color: #fff; }

        .qb-footer-inner { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }

        .qb-footer p { color: #c7b9b0; font-size: 12px; margin: 7px 0 0; }

        .qb-toast { position: fixed; z-index: 1000; bottom: 95px; left: 50%; transform: translateX(-50%); padding: 14px 20px; background: #29231f; color: #fff; border-radius: 12px; box-shadow: 0 10px 30px #0002; font-size: 13px; font-weight: 700; max-width: 90%; text-align: center; }

        .qb-floating-cart { position: fixed; z-index: 999; bottom: 22px; right: 22px; display: flex; align-items: center; gap: 12px; padding: 13px 17px; border: 0; border-radius: 16px; background: #ff6b35; color: #fff; box-shadow: 0 12px 32px #ff6b3545; font-weight: 800; }

        .qb-floating-cart small { display: block; font-size: 10px; font-weight: 500; margin-top: 3px; }

        .qb-floating-cart .qb-cart-icon { font-size: 22px; }

        .qb-empty { grid-column: 1/-1; padding: 35px; text-align: center; color: #81766f; border: 1px dashed #e8d8cc; border-radius: 16px; background: #fff; }

        @media(max-width:900px) {

          .qb-hero-grid { grid-template-columns: 1fr 1fr; gap: 20px; }

          .qb-hero-image img { height: 310px; }

          .qb-categories { grid-template-columns: repeat(4,1fr); }

          .qb-food-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }

          .qb-restaurant-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }

          .qb-benefits { grid-template-columns: repeat(2,1fr); }

        }

        @media(max-width:600px) {

          .qb-hero { padding: 38px 0; }

          .qb-hero-grid { grid-template-columns: 1fr; }

          .qb-hero h1 { letter-spacing: -1.7px; }

          .qb-hero-image { min-height: 240px; margin-top: 10px; }

          .qb-hero-image img { height: 250px; }

          .qb-floating-note { left: 8px; bottom: 12px; }

          .qb-offers { grid-template-columns: 1fr; gap: 10px; }

          .qb-section { padding-top: 36px; }

          .qb-categories { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 9px; }

          .qb-category { padding: 14px 5px; }

          .qb-food-grid { gap: 11px; }

          .qb-restaurant-grid { grid-template-columns: 1fr; }

          .qb-section-heading { align-items: start; }

          .qb-ai { grid-template-columns: 1fr; padding: 25px; }

          .qb-ai button { justify-self: start; }

          .qb-benefits { gap: 10px; }

          .qb-benefit { padding: 15px; }

          .qb-banner { align-items: start; flex-direction: column; padding: 24px; }

          .qb-floating-cart { right: 12px; bottom: 12px; }

        }

      `}</style>

      <Navbar />

      <main>

        <section className="qb-hero">

          <div className="qb-container qb-hero-grid">

            <div>

              <div className="qb-eyebrow">✦ GOOD FOOD, GREAT MOOD</div>

              <h1>

                Cravings called.

                <br />

                <span>We deliver.</span>

              </h1>

              <p className="qb-hero-copy">

                Discover your next favourite meal. From comfort food to

                exciting new flavours, deliciousness is just a few clicks away.

              </p>

              <form

                className="qb-search"

                onSubmit={(event) => {

                  event.preventDefault();

                  document

                    .getElementById("qb-dishes")

                    ?.scrollIntoView({ behavior: "smooth" });

                }}

              >

                <span>⌕</span>

                <input

                  value={search}

                  onChange={(event) => setSearch(event.target.value)}

                  placeholder="Search pizza, burgers, biryani..."

                  aria-label="Search food and restaurants"

                />

                <button type="submit">Search</button>

              </form>

              <p style={{ fontSize: 11, color: "#82766e", marginTop: 15 }}>

                ⭐ 4.8/5 customer rating   ·   🛵 Fast delivery

              </p>

            </div>

            <div className="qb-hero-image">

              <img

                src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85"

                alt="Freshly prepared delicious food"

              />

              <div className="qb-floating-note">

                🍽️ Made for your cravings

                <small>Fresh food, happy moments</small>

              </div>

            </div>

          </div>

        </section>

        <div className="qb-container">

          <section className="qb-offers">

            <div className="qb-offer">

              <div className="qb-offer-icon">🎉</div>

              <div>

                <strong>Deals you'll love</strong>

                <span>Save on selected dishes</span>

              </div>

            </div>

            <div className="qb-offer">

              <div className="qb-offer-icon">🛵</div>

              <div>

                <strong>Quick doorstep delivery</strong>

                <span>Your cravings, delivered</span>

              </div>

            </div>

            <div className="qb-offer">

              <div className="qb-offer-icon">🥗</div>

              <div>

                <strong>Something for everyone</strong>

                <span>Explore a variety of flavours</span>

              </div>

            </div>

          </section>

          <section className="qb-section" id="qb-categories">

            <div className="qb-section-heading">

              <div>

                <span className="qb-mini-label">EXPLORE THE MENU</span>

                <h2>What are you craving?</h2>

                <p>Find the food that makes your day better.</p>

              </div>

            </div>

            <div className="qb-categories">

              {categories.map((category) => (

                <button

                  type="button"

                  key={category.name}

                  className={`qb-category ${

                    activeCategory === category.name ? "active" : ""

                  }`}

                  onClick={() => {

                    setActiveCategory(category.name);

                    document

                      .getElementById("qb-dishes")

                      ?.scrollIntoView({ behavior: "smooth" });

                  }}

                >

                  <span>{category.emoji}</span>

                  <strong>{category.name}</strong>

                </button>

              ))}

            </div>

          </section>

          <section className="qb-section" id="qb-restaurants">

            <div className="qb-section-heading">

              <div>

                <span className="qb-mini-label">HANDPICKED FOR YOU</span>

                <h2>Popular restaurants</h2>

                <p>Explore spots for your next delicious meal.</p>

              </div>

              <a className="qb-link" href="#qb-dishes">

                Explore dishes →

              </a>

            </div>

            <div className="qb-restaurant-grid">

              {filteredRestaurants.length ? (

                filteredRestaurants.map((restaurant) => (

                  <RestaurantCard

                    key={restaurant.id}

                    restaurant={restaurant}

                    onClick={() => {

                      setSearch(restaurant.cuisines[0]);

                      setActiveCategory("All");

                      document

                        .getElementById("qb-dishes")

                        ?.scrollIntoView({ behavior: "smooth" });

                    }}

                  />

                ))

              ) : (

                <div className="qb-empty">

                  No matching restaurants. Try another search.

                </div>

              )}

            </div>

          </section>

          <section className="qb-section" id="qb-dishes">

            <div className="qb-section-heading">

              <div>

                <span className="qb-mini-label">THE CROWD FAVOURITES</span>

                <h2>

                  {activeCategory === "All"

                    ? "Popular dishes"

                    : `${activeCategory} favourites`}

                </h2>

                <p>Good food, great value, and plenty of flavour.</p>

              </div>

              <a

                className="qb-link"

                href="#qb-categories"

                onClick={() => setActiveCategory("All")}

              >

                View all →

              </a>

            </div>

            <div className="qb-food-grid">

              {filteredFoods.length ? (

                filteredFoods.map((food) => (

                  <FoodCard

                    key={food.id}

                    food={food}

                    onAddToCart={handleAddToCart}

                    onToggleWishlist={() => toggleWishlist(food.id)}

                    isWishlisted={wishlist.includes(food.id)}

                  />

                ))

              ) : (

                <div className="qb-empty">

                  No dishes found. Try a different search or category.

                </div>

              )}

            </div>

          </section>

          <section className="qb-ai">

            <div>

              <span className="qb-mini-label">YOUR SMART FOOD COMPANION</span>

              <h2>Not sure what to eat today? 🤔</h2>

              <p>

                QuickBite's AI food assistant is planned to help you discover

                meals based on your cravings, food preferences and budget.

              </p>

            </div>

            
<button
  type="button"
  onClick={() => {
    window.location.href = "/smart-combo";
  }}
>
  Build my smart combo →
</button>


          </section>

          <section className="qb-section">

            <div className="qb-section-heading">

              <div>

                <span className="qb-mini-label">WHY QUICKBITE</span>

                <h2>Little things that matter</h2>

                <p>We're here to make every food order feel easy.</p>

              </div>

            </div>

            <div className="qb-benefits">

              <div className="qb-benefit">

                <span>⚡</span>

                <strong>Fast and convenient</strong>

                <p>Find your favourites and order without the fuss.</p>

              </div>

              <div className="qb-benefit">

                <span>🍽️</span>

                <strong>Plenty of choices</strong>

                <p>Explore a variety of dishes for different cravings.</p>

              </div>

              <div className="qb-benefit">

                <span>💸</span>

                <strong>Value for money</strong>

                <p>Discover offers and options that suit your budget.</p>

              </div>

              <div className="qb-benefit">

                <span>💛</span>

                <strong>Made for food lovers</strong>

                <p>A simple experience focused on the food you love.</p>

              </div>

            </div>

          </section>

          <section className="qb-banner">

            <div>

              <h2>Good food is always a good idea. 🍕</h2>

              <p>Find your favourite dish and add a little joy to your day.</p>

            </div>

            <button

              type="button"

              onClick={() =>

                document

                  .getElementById("qb-dishes")

                  ?.scrollIntoView({ behavior: "smooth" })

              }

            >

              Order something tasty →

            </button>

          </section>

        </div>

      </main>

      <footer className="qb-footer">

        <div className="qb-container qb-footer-inner">

          <div>

            <strong style={{ fontSize: 22, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

              QuickBite<span style={{ color: "#ff6b35" }}>.</span>

            </strong>

            <p>Good food. Good mood. Made for your cravings. ❤️</p>

          </div>

          <p>© {new Date().getFullYear()} QuickBite · Project demo</p>

        </div>

      </footer>

      {notice && (

        <div className="qb-toast" role="status">

          {notice}

        </div>

      )}

      <Chatbot />

      <button

        type="button"

        className="qb-floating-cart"

        onClick={() => {

          window.location.href = "/cart";

        }}

        aria-label={`Open cart with ${cartCount} items`}

      >

        <span className="qb-cart-icon">🛒</span>

        <span>

          View cart · {cartCount}

          <small>

            {cartCount > 0 ? `₹${cartTotal} subtotal` : "Your cart is waiting"}

          </small>

        </span>

      </button>

    </div>

  );

}
