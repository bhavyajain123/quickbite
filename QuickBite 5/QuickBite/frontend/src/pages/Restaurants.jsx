import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import Loader from "../components/Loader";
import { getRestaurants } from "../api";
import "../styles/Restaurants.css";

const cuisines = [
"All",
"Pizza",
"Burgers",
"Biryani",
"Chinese",
"Healthy",
"Desserts",
];

export default function Restaurants() {
const [search, setSearch] = useState("");
const [activeCuisine, setActiveCuisine] = useState("All");
const [restaurants, setRestaurants] = useState([]);
const [selectedCity, setSelectedCity] = useState(
  localStorage.getItem("quickbite-city") || "Delhi NCR"
);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
let cancelled = false;

async function loadRestaurants() {
  try {
    setIsLoading(true);
    setError("");

    const data = await getRestaurants();

    if (!cancelled) {
      setRestaurants(data);
    }
  } catch (err) {
    if (!cancelled) {
      setError(err.message || "Restaurants load nahi ho sake.");
    }
  } finally {
    if (!cancelled) {
      setIsLoading(false);
    }
  }
}

loadRestaurants();

return () => {
  cancelled = true;
};

}, []);

useEffect(() => {
  const syncCity = () => {
    setSelectedCity(
      localStorage.getItem("quickbite-city") || "Delhi NCR"
    );
  };

  window.addEventListener("focus", syncCity);
  window.addEventListener("quickbite-city-change", syncCity);

  return () => {
    window.removeEventListener("focus", syncCity);
    window.removeEventListener("quickbite-city-change", syncCity);
  };
}, []);
console.log("Selected city:", selectedCity);
console.log("Restaurant cities:", restaurants.map((r) => ({
  name: r.name,
  city: r.city
})));
const filteredRestaurants = useMemo(() => {
const query = search.trim().toLowerCase();

return restaurants.filter((restaurant) => {
  const restaurantCity = (restaurant.city || "").trim().toLowerCase();
const city = selectedCity.trim().toLowerCase();
const matchesCity = restaurantCity === city;
  const name = (restaurant.name || "").toLowerCase();

  const restaurantCuisines = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine
    : restaurant.cuisine
      ? [restaurant.cuisine]
      : [];

  const matchesSearch =
    name.includes(query) ||
    restaurantCuisines.some((cuisine) =>
      String(cuisine).toLowerCase().includes(query)
    );

  const matchesCuisine =
    activeCuisine === "All" ||
    restaurantCuisines.some((cuisine) =>
      String(cuisine).toLowerCase() === activeCuisine.toLowerCase()
    );

  return matchesCity && matchesSearch && matchesCuisine;
});

}, [restaurants, search, activeCuisine, selectedCity]);

const clearFilters = () => {
setSearch("");
setActiveCuisine("All");
};

return (
<div className="restaurants-page">
<Navbar />

  <main
    style={{
      minHeight: "70vh",
      padding: "48px 5% 70px",
      background: "#fffdfb",
      color: "#29231f",
    }}
  >
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <p
        style={{
          color: "#ff6b35",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 2,
        }}
      >
        FIND YOUR FAVOURITE
      </p>

      <h1
        style={{
          fontSize: "clamp(30px, 4vw, 44px)",
          letterSpacing: -1.5,
          margin: "8px 0",
        }}
      >
        Explore restaurants
      </h1>

      <p style={{ color: "#81766f", marginBottom: 28 }}>
        Discover great food from places you'll love.
      </p>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search restaurants or cuisines..."
        aria-label="Search restaurants"
        style={{
          width: "100%",
          maxWidth: 550,
          padding: "15px 17px",
          border: "1px solid #eee0d6",
          borderRadius: 12,
          outlineColor: "#ff6b35",
          marginBottom: 22,
          background: "#fff",
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 30,
        }}
      >
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            type="button"
            onClick={() => setActiveCuisine(cuisine)}
            aria-pressed={activeCuisine === cuisine}
            style={{
              padding: "10px 16px",
              borderRadius: 30,
              border: "1px solid",
              borderColor:
                activeCuisine === cuisine ? "#ff6b35" : "#eee0d6",
              background:
                activeCuisine === cuisine ? "#fff0e7" : "#fff",
              color:
                activeCuisine === cuisine ? "#e95220" : "#554c46",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader message="Finding restaurants..." />
      ) : error ? (
        <div role="alert" style={{ color: "#c62828", padding: 20 }}>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              border: 0,
              background: "#ff6b35",
              color: "#fff",
              padding: "11px 16px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <p
            style={{
              color: "#81766f",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {filteredRestaurants.length} restaurants found
          </p>

          {filteredRestaurants.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(270px, 1fr))",
                gap: 22,
              }}
            >
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id || restaurant._id}
                  restaurant={restaurant}
                  onClick={() => {
                    const id = restaurant._id || restaurant.id;
                    window.location.href = `/restaurant/${id}`;
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: 45,
                border: "1px dashed #e8d8cc",
                borderRadius: 16,
                color: "#81766f",
              }}
            >
              <div style={{ fontSize: 40 }}>🔎</div>
              <h3>No restaurants found</h3>
              <p>
                {restaurants.length === 0
                  ? "Abhi database mein koi restaurant available nahi hai."
                  : "Try another restaurant name or cuisine."}
              </p>

              <button
                type="button"
                onClick={clearFilters}
                style={{
                  border: 0,
                  background: "#ff6b35",
                  color: "#fff",
                  padding: "12px 17px",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </main>

  <Footer />
</div>

);
}