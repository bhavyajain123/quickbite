import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import{getInventory, getLowStockItems, restockInventory, updateInventoryQuantity,} from "../../api";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [quantities, setQuantities] = useState({});
  const [restock, setRestock] = useState({});

  async function loadInventory() {
    setLoading(true);
    setError("");

    try {
      const [inventoryData, lowStockData] = await Promise.all([
        getInventory({ page, limit: 10 }),
        getLowStockItems(),
      ]);

      setItems(inventoryData.inventory || []);
      setLowStock(lowStockData.inventory || []);
    } catch (err) {
      setError(err.message || "Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, [page]);

  async function handleUpdate(foodId) {
    setError("");
    setMessage("");

    const quantity = Number(quantities[foodId]);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Enter a valid quantity (0 or greater).");
      return;
    }

    try {
      await updateInventoryQuantity(foodId, quantity);
      setMessage("Inventory quantity updated.");
      await loadInventory();
    } catch (err) {
      setError(err.message || "Unable to update quantity.");
    }
  }

  async function handleRestock(foodId) {
    setError("");
    setMessage("");

    const quantity = Number(restock[foodId]);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Restock quantity must be a positive whole number.");
      return;
    }

    try {
      await restockInventory(foodId, quantity);
      setMessage("Stock added successfully.");
      setRestock((current) => ({ ...current, [foodId]: "" }));
      await loadInventory();
    } catch (err) {
      setError(err.message || "Unable to restock item.");
    }
  }

  const styles = {
    page: { padding: 28, color: "#29231f", fontFamily: "Arial, sans-serif" },
    card: {
      background: "#fff",
      border: "1px solid #f0e7e0",
      borderRadius: 12,
      padding: 18,
      marginBottom: 20,
    },
    input: {
      width: 85,
      padding: 8,
      border: "1px solid #ddd",
      borderRadius: 7,
      marginRight: 8,
    },
    button: {
      padding: "9px 12px",
      border: 0,
      borderRadius: 7,
      background: "#ff6b35",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
    },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 720 },
    cell: { padding: 12, borderBottom: "1px solid #eee", textAlign: "left" },
  };

  return (
    <AdminLayout>
      <main style={styles.page}>
        <h1>Inventory Management</h1>
        <p>Monitor stock, update quantities, and restock food items.</p>

        {error && <p role="alert" style={{ color: "#c62828" }}>{error}</p>}
        {message && <p role="status" style={{ color: "#16834a" }}>{message}</p>}

        <section style={styles.card}>
          <h2>Low Stock Alerts ({lowStock.length})</h2>
          {lowStock.length === 0 ? (
            <p>No low-stock items reported.</p>
          ) : (
            <ul>
              {lowStock.map((item) => (
                <li key={item._id}>
                  {item.food?.name || "Food item"} — Available:{" "}
                  {item.availableQuantity ?? Math.max(0, item.quantity - item.reservedQuantity)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={styles.card}>
          <h2>Stock Inventory</h2>
          {loading ? (
            <p>Loading inventory...</p>
          ) : items.length === 0 ? (
            <p>No inventory records found.</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.cell}>Food</th>
                    <th style={styles.cell}>Total Stock</th>
                    <th style={styles.cell}>Reserved</th>
                    <th style={styles.cell}>Available</th>
                    <th style={styles.cell}>Set Quantity</th>
                    <th style={styles.cell}>Restock</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const foodId =
                      typeof item.food === "object" ? item.food?._id : item.food;
                    return (
                      <tr key={item._id}>
                        <td style={styles.cell}>
                          {item.food?.name || "Unknown food"}
                        </td>
                        <td style={styles.cell}>{item.quantity}</td>
                        <td style={styles.cell}>{item.reservedQuantity}</td>
                        <td style={styles.cell}>
                          {item.availableQuantity ?? Math.max(0, item.quantity - item.reservedQuantity)}
                        </td>
                        <td style={styles.cell}>
                          <input
                            aria-label={`Set quantity for ${item.food?.name || "food"}`}
                            type="number"
                            min="0"
                            value={quantities[foodId] ?? ""}
                            onChange={(e) =>
                              setQuantities((current) => ({
                                ...current,
                                [foodId]: e.target.value,
                              }))
                            }
                            style={styles.input}
                          />
                          <button
                            type="button"
                            style={styles.button}
                            onClick={() => handleUpdate(foodId)}
                          >
                            Update
                          </button>
                        </td>
                        <td style={styles.cell}>
                          <input
                            aria-label={`Restock ${item.food?.name || "food"}`}
                            type="number"
                            min="1"
                            value={restock[foodId] ?? ""}
                            onChange={(e) =>
                              setRestock((current) => ({
                                ...current,
                                [foodId]: e.target.value,
                              }))
                            }
                            style={styles.input}
                          />
                          <button
                            type="button"
                            style={styles.button}
                            onClick={() => handleRestock(foodId)}
                          >
                            Add stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              style={styles.button}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              type="button"
              disabled={loading || items.length < 10}
              onClick={() => setPage((current) => current + 1)}
              style={styles.button}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}