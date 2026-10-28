
import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getRestaurants, updateRestaurant } from "../../api";



const formatDeliveryTime = (minutes) => {
  const value = Number(minutes) || 30;
  return `${value}–${value + 10} min`;
};

const toAdminRestaurant = (restaurant) => ({
  ...restaurant,
  id: restaurant._id || restaurant.id,
  cuisine: Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.join(", ")
    : restaurant.cuisine || "",
  deliveryTime: formatDeliveryTime(restaurant.deliveryTime),
  active: restaurant.isOpen ?? true,
});


const emptyForm = {
  name: "",
  cuisine: "",
  rating: "4.5",
  deliveryTime: "25–35 min",
  image: "",
  active: true,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1px solid #e8ddd5",
  borderRadius: 9,
  fontSize: 14,
  outlineColor: "#ff6b35",
};

export default function ManageRestaurants() {
  const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [showForm, setShowForm] = useState(false);
const [editingId, setEditingId] = useState(null);
const [message, setMessage] = useState("");
const [form, setForm] = useState(emptyForm);
const [restaurants, setRestaurants] = useState([]);
const [loading, setLoading] = useState(true);
const [apiError, setApiError] = useState("");

useEffect(() => {
  let cancelled = false;

  async function loadRestaurants() {
    try {
      setLoading(true);
      setApiError("");

      const data = await getRestaurants();

      if (!cancelled) {
        setRestaurants(data.map(toAdminRestaurant));
      }
    } catch (error) {
      if (!cancelled) {
        setApiError(error.message || "Restaurants load nahi ho sake.");
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  loadRestaurants();

  return () => {
    cancelled = true;
  };
}, []);


  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };
const filteredRestaurants = restaurants.filter((restaurant) => {
  const matchesSearch =
    restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    (statusFilter === "Active" && restaurant.active) ||
    (statusFilter === "Inactive" && !restaurant.active);

  return matchesSearch && matchesStatus;
});

const handleSubmit = async (event) => {
  event.preventDefault();
  setMessage("");
  setApiError("");

  if (editingId === null) {
    setMessage("Abhi sirf existing restaurants edit kar sakte hain.");
    return;
  }

  const name = form.name.trim();
  const cuisine = form.cuisine
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const rating = Number(form.rating);

  if (!name || cuisine.length === 0 || rating < 0 || rating > 5) {
    setMessage("Restaurant details check karo.");
    return;
  }

  try {
    const updated = await updateRestaurant(editingId, {
      name,
      cuisine,
      rating,
      deliveryTime: Number.parseInt(form.deliveryTime, 10),
      image: form.image.trim(),
      isOpen: form.active,
    });

    const savedRestaurant = toAdminRestaurant(
      updated.restaurant || updated
    );

    setRestaurants((previous) =>
      previous.map((item) =>
        String(item.id) === String(editingId)
          ? savedRestaurant
          : item
      )
    );

    setMessage("Restaurant database mein update ho gaya!");
    resetForm();
  } catch (error) {
    setApiError(
      error.message || "Restaurant update nahi ho saka."
    );
  }
};


  const handleEdit = (restaurant) => {
    setForm({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: String(restaurant.rating),
      deliveryTime: restaurant.deliveryTime,
      image: restaurant.image,
      active: restaurant.active,
    });

    setEditingId(restaurant.id);
    setShowForm(true);
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this restaurant?")) return;

    setRestaurants((previous) =>
      previous.filter((restaurant) => restaurant.id !== id)
    );

    setMessage("Restaurant deleted successfully!");
  };

  const toggleStatus = (id) => {
    setRestaurants((previous) =>
      previous.map((restaurant) =>
        restaurant.id === id
          ? { ...restaurant, active: !restaurant.active }
          : restaurant
      )
    );

    setMessage("Restaurant status updated.");
  };

  return (
    <AdminLayout>
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 15,
            marginBottom: 25,
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 7px", fontSize: 24 }}>
              Manage Restaurants
            </h2>
            <p style={{ margin: 0, color: "#81766f", fontSize: 14 }}>
              Manage restaurant details and availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm && editingId === null) {
                resetForm();
              } else {
                setForm(emptyForm);
                setEditingId(null);
                setShowForm(true);
                setMessage("");
              }
            }}
            style={{
              background: "#ff6b35",
              color: "#fff",
              border: 0,
              padding: "12px 18px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Add Restaurant
          </button>
        </div>

        {message && (
          <p
            role="status"
            style={{
              padding: 13,
              background: "#fff0e7",
              color: "#a94420",
              borderRadius: 9,
              fontSize: 14,
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <input
            type="search"
            placeholder="Search restaurants or cuisines..."
            aria-label="Search restaurants"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ ...inputStyle, flex: "1 1 250px", maxWidth: 450 }}
          />

          <select
            aria-label="Filter restaurant status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={{ ...inputStyle, width: "auto", minWidth: 145 }}
          >
            <option value="All">All Restaurants</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#fff",
              border: "1px solid #f0e7e0",
              borderRadius: 15,
              padding: 22,
              marginBottom: 25,
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              {editingId !== null ? "Edit Restaurant" : "Add Restaurant"}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 16,
              }}
            >
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Restaurant Name *
                <input
                  required
                  maxLength={100}
                  style={{ ...inputStyle, marginTop: 8 }}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="The Pizza Studio"
                />
              </label>

              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Cuisines *
                <input
                  required
                  maxLength={100}
                  style={{ ...inputStyle, marginTop: 8 }}
                  value={form.cuisine}
                  onChange={(event) =>
                    setForm({ ...form, cuisine: event.target.value })
                  }
                  placeholder="Italian, Pizza"
                />
              </label>

              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Rating (1–5)
                <input
                  required
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  style={{ ...inputStyle, marginTop: 8 }}
                  value={form.rating}
                  onChange={(event) =>
                    setForm({ ...form, rating: event.target.value })
                  }
                />
              </label>

              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Delivery Time
                <select
                  style={{ ...inputStyle, marginTop: 8 }}
                  value={form.deliveryTime}
                  onChange={(event) =>
                    setForm({ ...form, deliveryTime: event.target.value })
                  }
                >
                  <option>15–25 min</option>
                  <option>20–30 min</option>
                  <option>25–35 min</option>
                  <option>30–40 min</option>
                  <option>40–50 min</option>
                </select>
              </label>

              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  gridColumn: "1 / -1",
                }}
              >
                Image URL
                <input
                  type="url"
                  style={{ ...inputStyle, marginTop: 8 }}
                  value={form.image}
                  onChange={(event) =>
                    setForm({ ...form, image: event.target.value })
                  }
                  placeholder="https://example.com/restaurant.jpg"
                />
              </label>
            </div>

            <label
              style={{
                display: "flex",
                gap: 9,
                alignItems: "center",
                marginTop: 18,
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm({ ...form, active: event.target.checked })
                }
              />
              Restaurant is active
            </label>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                type="submit"
                style={{
                  background: "#ff6b35",
                  color: "#fff",
                  border: 0,
                  borderRadius: 9,
                  padding: "11px 18px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {editingId !== null ? "Save Changes" : "Add Restaurant"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "#f4eee9",
                  border: 0,
                  borderRadius: 9,
                  padding: "11px 18px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {filteredRestaurants.map((restaurant) => (
            <article
              key={restaurant.id}
              style={{
                background: "#fff",
                border: "1px solid #f0e7e0",
                borderRadius: 15,
                overflow: "hidden",
              }}
            >
              <img
                src={restaurant.image}
                alt={restaurant.name}
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/500x300?text=Restaurant";
                }}
                style={{
                  width: "100%",
                  height: 175,
                  objectFit: "cover",
                  display: "block",
                  background: "#fff0e7",
                }}
              />

              <div style={{ padding: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "start",
                  }}
                >
                  <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>
                    {restaurant.name}
                  </h3>

                  <span
                    style={{
                      background: restaurant.active ? "#e6f7ed" : "#ffe8e8",
                      color: restaurant.active ? "#16834a" : "#c33c3c",
                      padding: "5px 8px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {restaurant.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p
                  style={{
                    color: "#81766f",
                    fontSize: 13,
                    margin: "0 0 12px",
                  }}
                >
                  {restaurant.cuisine}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 18,
                  }}
                >
                  <span>⭐ {restaurant.rating.toFixed(1)}</span>
                  <span>🕒 {restaurant.deliveryTime}</span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(restaurant)}
                    style={{
                      flex: 1,
                      padding: 10,
                      border: "1px solid #eee0d6",
                      background: "#fff8f3",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStatus(restaurant.id)}
                    style={{
                      flex: 1,
                      padding: 10,
                      border: "1px solid #eee0d6",
                      background: "#fff",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {restaurant.active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(restaurant.id)}
                    aria-label={`Delete ${restaurant.name}`}
                    style={{
                      padding: "10px 12px",
                      border: "1px solid #ffd6d6",
                      background: "#fff0f0",
                      color: "#c33c3c",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              marginTop: 15,
              border: "1px dashed #e8d8cc",
              borderRadius: 15,
              color: "#81766f",
              background: "#fff",
            }}
          >
            <div style={{ fontSize: 36 }}>🍽️</div>
            <h3>No restaurants found</h3>
            <p>Try another search or status filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              style={{
                background: "#ff6b35",
                color: "#fff",
                border: 0,
                padding: "10px 16px",
                borderRadius: 9,
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        <p style={{ marginTop: 20, color: "#81766f", fontSize: 12 }}>
          Demo mode: restaurant changes are stored in this browser only.
        </p>
      </section>
    </AdminLayout>
  );
}
