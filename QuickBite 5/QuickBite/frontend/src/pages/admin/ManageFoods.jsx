
import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import{getFoods, getRestaurants, createFood, updateFood, deleteFood,} from"../../api";



const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1px solid #e8ddd5",
  borderRadius: 9,
  fontSize: 14,
  outlineColor: "#ff6b35",
};

export default function ManageFoods() {
const [foods, setFoods] = useState([]);
const [restaurants, setRestaurants] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    description:"",
    category: "Indian",
    price: "",
    image: "",
    available: true,
    restaurantId:"",
  });

  useEffect(() => {
  let cancelled = false;

  async function loadData() {
    try {
      setLoading(true);
      setApiError("");

      const [foodData, restaurantData] = await Promise.all([
        getFoods(),
        getRestaurants(),
      ]);

      if (!cancelled) {
        setFoods(
          foodData.map((food) => ({
            ...food,
            available: food.isAvailable ?? food.available ?? true,
            restaurantId:
              food.restaurantId ||
              (typeof food.restaurant === "object"
                ? food.restaurant?._id
                : food.restaurant) ||
              "",
          }))
        );

        setRestaurants(restaurantData);
      }
    } catch (error) {
      if (!cancelled) {
        setApiError(error.message || "Food data load nahi hua.");
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  loadData();

  return () => {
    cancelled = true;
  };
}, []);

const filteredFoods = foods.filter((food) => {
  const query = search.trim().toLowerCase();

  const matchesSearch =
    (food.name || "").toLowerCase().includes(query) ||
    (food.category || "").toLowerCase().includes(query);

  const matchesCategory =
    categoryFilter === "All" || food.category === categoryFilter;

  return matchesSearch && matchesCategory;
});

  const resetForm = () => {
    setForm({
      name: "",
      description:"",
      category: "Pizza",
      price: "",
      image: "",
      available: true,
      restaurantId: restaurants[0]?.id || "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  const name = form.name.trim();
  const price = Number(form.price);

  if (!name || !Number.isFinite(price) || price < 0) {
    setMessage("Valid food name aur price enter karo.");
    return;
  }

  if (editingId === null && !form.restaurantId) {
    setMessage("Pehle restaurant select karo.");
    return;
  }

  const foodData = {
    name,
    description: form.description.trim(),
    category: form.category.trim(),
    price,
    image: form.image.trim(),
    isAvailable: form.available,
  };

  try {
    setSaving(true);
    setMessage("");
    setApiError("");

    if (editingId !== null) {
      await updateFood(editingId, foodData);
      setMessage("Food item database mein update ho gaya!");
    } else {
      await createFood({
        ...foodData,
        restaurant: form.restaurantId,
      });
      setMessage("Food item database mein add ho gaya!");
    }

    const updatedFoods = await getFoods();

    setFoods(
      updatedFoods.map((food) => ({
        ...food,
        available: food.isAvailable ?? food.available ?? true,
        restaurantId:
          food.restaurantId ||
          (typeof food.restaurant === "object"
            ? food.restaurant?._id
            : food.restaurant) ||
          "",
      }))
    );

    resetForm();
  } catch (error) {
    setApiError(error.message || "Food save nahi hua.");
  } finally {
    setSaving(false);
  }
};

  const handleEdit = (food) => {
    setForm({
      name: food.name,
      description: food.description || "",
      category: food.category,
      price: String(food.price),
      image: food.image,
      available: food.available,
      restaurantId: food.restaurantId || "",
    });

    setEditingId(food.id);
    setShowForm(true);
    setMessage("");
    setApiError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this food item?"
    );

    if (!confirmed) return;
      try {
    setApiError("");
    setMessage("");

   await deleteFood(id);


    setFoods((previous) => previous.filter((food) => food.id !== id));
    setMessage("Food item deleted successfully!");
      }catch(error){
        setApiError(error.message ||"food not deleted");
      }
  };

  const toggleAvailability = async (id) => {
    const food= foods.find((item)=>item.id=== id);
    if(!food) return;
    try{
      setApiError("");
      setMessage("");
      await updateFood(id,{isAvailable: !food.available,});

      setFoods((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, available: !food.available, isAvailable: !food.available }
          : item
      )
    );

    setMessage("Food availability database mein update ho gayi.");
  } catch (error) {
    setApiError(error.message || "Availability update nahi hui.");
  }
};

  return (
    <AdminLayout>
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 15,
            flexWrap: "wrap",
            marginBottom: 25,
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 7px", fontSize: 24 }}>
              Manage Foods
            </h2>
            <p style={{ margin: 0, color: "#81766f", fontSize: 14 }}>
              Add, edit and manage your food menu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm && editingId === null) {
                resetForm();
              } else {
                setForm({
                  name: "",
                  description: "",
                  category: "Indian",
                  price: "",
                  image: "",
                  available: true,
                  restaurantId: restaurants[0]?.id || "",
                });
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
            + Add Food
          </button>
        </div>

        {message && (
          <div
            role="status"
            style={{
              padding: 13,
              marginBottom: 18,
              borderRadius: 9,
              background: "#fff0e7",
              color: "#a94420",
              fontSize: 14,
            }}
          >
            {message}
          </div>
        )}
        {apiError && (
  <div
    role="alert"
    style={{
      padding: 13,
      marginBottom: 18,
      borderRadius: 9,
      background: "#fee2e2",
      color: "#b91c1c",
      fontSize: 14,
    }}
  >
    {apiError}
  </div>
)}

{loading && <p>Loading food items...</p>}

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
              {editingId !== null ? "Edit Food Item" : "Add New Food"}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 16,
              }}
            >
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Food Name *
                <input
                  required
                  maxLength={80}
                  style={{ ...inputStyle, marginTop: 8 }}
                  placeholder="e.g. Paneer Pizza"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>

              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Category *
                <select
                  style={{ ...inputStyle, marginTop: 8 }}
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  {[
                    "Pizza",
                    "Burger",
                    "Biryani",
                    "Chinese",
                    "Healthy",
                    "Dessert",
                    "Indian",
                    "Drinks",
                  ].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Price (₹) *
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  style={{ ...inputStyle, marginTop: 8 }}
                  placeholder="249"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                />
              </label>

              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Image URL
                <input
                  type="url"
                  style={{ ...inputStyle, marginTop: 8 }}
                  placeholder="https://example.com/food.jpg"
                  value={form.image}
                  onChange={(event) =>
                    setForm({ ...form, image: event.target.value })
                  }
                />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>
  Restaurant *
  <select
    required
    style={{ ...inputStyle, marginTop: 8 }}
    value={form.restaurantId}
    disabled={editingId !== null}
    onChange={(event) =>
      setForm({ ...form, restaurantId: event.target.value })
    }
  >
    <option value="">Select Restaurant</option>
    {restaurants.map((restaurant) => (
      <option key={restaurant.id} value={restaurant.id}>
        {restaurant.name}
      </option>
    ))}
  </select>
</label>

<label style={{ fontSize: 13, fontWeight: 600 }}>
  Description
  <textarea
    rows={3}
    style={{ ...inputStyle, marginTop: 8, resize: "vertical" }}
    placeholder="Describe this food item"
    value={form.description}
    onChange={(event) =>
      setForm({ ...form, description: event.target.value })
    }
  />
</label>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginTop: 18,
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={form.available}
                onChange={(event) =>
                  setForm({ ...form, available: event.target.checked })
                }
              />
              Available for ordering
            </label>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#ff6b35",
                  color: "#fff",
                  border: 0,
                  padding: "11px 18px",
                  borderRadius: 9,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {saving
  ? "Saving..."
  : editingId !== null
    ? "Save Changes"
    : "Add Food"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "#f4eee9",
                  color: "#554c46",
                  border: 0,
                  padding: "11px 18px",
                  borderRadius: 9,
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
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <input
            type="search"
            aria-label="Search food"
            placeholder="Search food name or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ ...inputStyle, flex: "1 1 250px", maxWidth: 450 }}
          />

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            style={{ ...inputStyle, width: "auto", minWidth: 150 }}
          >
            <option value="All">All Categories</option>
            {[
              "Pizza",
              "Burger",
              "Biryani",
              "Chinese",
              "Healthy",
              "Dessert",
              "Indian",
              "Drinks",
            ].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 18,
          }}
        >
          {filteredFoods.map((food) => (
            <article
              key={food.id}
              style={{
                background: "#fff",
                border: "1px solid #f0e7e0",
                borderRadius: 15,
                overflow: "hidden",
              }}
            >
              <img
                src={food.image}
                alt={food.name}
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/400x250?text=QuickBite";
                }}
                style={{
                  width: "100%",
                  height: 175,
                  objectFit: "cover",
                  display: "block",
                  background: "#fff0e7",
                }}
              />

              <div style={{ padding: 17 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 7px", fontSize: 17 }}>
                      {food.name}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "#81766f",
                        fontSize: 13,
                      }}
                    >
                      {food.category}
                    </p>
                  </div>

                  <strong style={{ color: "#e95220", whiteSpace: "nowrap" }}>
                    ₹{food.price}
                  </strong>
                </div>

                <p
                  style={{
                    margin: "14px 0",
                    color: food.available ? "#16834a" : "#c33c3c",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {food.available ? "● Available" : "● Unavailable"}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(food)}
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
                    onClick={() => toggleAvailability(food.id)}
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
                    {food.available ? "Hide" : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(food.id)}
                    aria-label={`Delete ${food.name}`}
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

        {filteredFoods.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#81766f",
              background: "#fff",
              borderRadius: 14,
              border: "1px dashed #e8d8cc",
            }}
          >
            <div style={{ fontSize: 36 }}>🍽️</div>
            <h3>No food items found</h3>
            <p>Try another search or category.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("All");
              }}
              style={{
                background: "#ff6b35",
                color: "#fff",
                border: 0,
                borderRadius: 9,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

      
      </section>
    </AdminLayout>
  );
}
