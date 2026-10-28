
import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getAdminDashboardOverview } from "../../api";

const statusColors = {
  pending: { bg: "#ffe8e8", color: "#c33c3c" },
  confirmed: { bg: "#e8efff", color: "#315dc5" },
  preparing: { bg: "#fff0d9", color: "#a86500" },
  "out for delivery": { bg: "#e8efff", color: "#315dc5" },
  delivered: { bg: "#e6f7ed", color: "#16834a" },
  cancelled: { bg: "#f0f0f0", color: "#666666" },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatStatus = (status) =>
  String(status || "pending")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getOrderFood = (order) => {
  const items = Array.isArray(order.items) ? order.items : [];

  if (!items.length) return "—";

  const names = items.slice(0, 2).map((item) => {
    if (typeof item.food === "object" && item.food !== null) {
      return item.food.name || item.name || "Food item";
    }

    return item.name || "Food item";
  });

  return names.join(", ") + (items.length > 2 ? "…" : "");
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminDashboardOverview();
      setData(response);
    } catch (err) {
      setError(
        err?.message ||
          "Dashboard data load nahi hua. Admin login aur backend check karo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const overview = data?.overview || {};
  const revenue = data?.revenue || {};
  const recentOrders = Array.isArray(data?.recentOrders)
    ? data.recentOrders
    : [];

  const stats = [
    {
      title: "Total Orders",
      value: Number(overview.totalOrders || 0).toLocaleString("en-IN"),
      icon: "📦",
      color: "#fff0e7",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(revenue.totalRevenue),
      icon: "💰",
      color: "#e8f8ee",
    },
    {
      title: "Customers",
      value: Number(overview.totalUsers || 0).toLocaleString("en-IN"),
      icon: "👥",
      color: "#eaf1ff",
    },
    {
      title: "Restaurants",
      value: Number(overview.totalRestaurants || 0).toLocaleString("en-IN"),
      icon: "🍽️",
      color: "#f3eaff",
    },
  ];

  return (
    <AdminLayout>
      <section>
        <div
          style={{
            marginBottom: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>
              Dashboard Overview
            </h2>
            <p style={{ margin: 0, color: "#81766f", fontSize: 14 }}>
              Your QuickBite business overview from live database data.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            style={{
              padding: "10px 16px",
              border: "1px solid #f0e7e0",
              borderRadius: 10,
              background: "#fff",
              cursor: loading ? "wait" : "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: 14,
              marginBottom: 20,
              borderRadius: 10,
              background: "#fff0f0",
              color: "#b42318",
            }}
          >
            <p style={{ margin: "0 0 10px" }}>{error}</p>
            <button type="button" onClick={loadDashboard}>
              Try again
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 18,
            marginBottom: 32,
          }}
        >
          {stats.map((stat) => (
            <article
              key={stat.title}
              style={{
                background: "#fff",
                border: "1px solid #f0e7e0",
                borderRadius: 16,
                padding: 22,
                boxShadow: "0 4px 15px rgba(41,35,31,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#81766f", fontSize: 13 }}>
                  {stat.title}
                </span>
                <span
                  style={{
                    background: stat.color,
                    padding: 10,
                    borderRadius: 12,
                    fontSize: 21,
                  }}
                >
                  {stat.icon}
                </span>
              </div>

              <h2
                style={{
                  margin: "18px 0 8px",
                  fontSize: 28,
                  overflowWrap: "anywhere",
                }}
              >
                {loading && !data ? "—" : stat.value}
              </h2>

              <span style={{ color: "#81766f", fontSize: 12 }}>
                Current database total
              </span>
            </article>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <article
            style={{
              background: "#fff",
              border: "1px solid #f0e7e0",
              borderRadius: 14,
              padding: 18,
            }}
          >
            <p style={{ margin: "0 0 8px", color: "#81766f", fontSize: 13 }}>
              Delivered Orders
            </p>
            <h3 style={{ margin: 0, fontSize: 22 }}>
              {loading && !data
                ? "—"
                : Number(revenue.deliveredOrders || 0).toLocaleString("en-IN")}
            </h3>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #f0e7e0",
              borderRadius: 14,
              padding: 18,
            }}
          >
            <p style={{ margin: "0 0 8px", color: "#81766f", fontSize: 13 }}>
              Average Delivered Order
            </p>
            <h3 style={{ margin: 0, fontSize: 22 }}>
              {loading && !data ? "—" : formatCurrency(revenue.averageOrderValue)}
            </h3>
          </article>
        </div>

        <section
          style={{
            background: "#fff",
            border: "1px solid #f0e7e0",
            borderRadius: 16,
            padding: 22,
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 22,
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 19 }}>
                Recent Orders
              </h2>
              <p style={{ margin: 0, color: "#81766f", fontSize: 13 }}>
                Latest orders received by QuickBite
              </p>
            </div>

            <a
              href="/admin/orders"
              style={{
                color: "#ff6b35",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              View all orders →
            </a>
          </div>

          <table
            style={{
              width: "100%",
              minWidth: 650,
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#fff8f3" }}>
                {["Order ID", "Customer", "Food Item", "Amount", "Status"].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: 14,
                        color: "#81766f",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading && !data ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: "center" }}>
                    Loading recent orders...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: "center" }}>
                    {error
                      ? "Orders load nahi ho sake."
                      : "Abhi koi order available nahi hai."}
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, index) => {
                  const orderId = order._id || order.id || `order-${index}`;
                  const status = String(order.status || "pending").toLowerCase();
                  const statusStyle = statusColors[status] || {
                    bg: "#f0f0f0",
                    color: "#555",
                  };
                  const customer =
                    order.customer?.name ||
                    order.customer?.fullName ||
                    order.customerName ||
                    "Customer";

                  return (
                    <tr
                      key={orderId}
                      style={{ borderBottom: "1px solid #f2ebe5" }}
                    >
                      <td style={{ padding: 14, fontWeight: 700 }}>
                        {String(orderId).slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: 14 }}>{customer}</td>
                      <td style={{ padding: 14 }}>{getOrderFood(order)}</td>
                      <td style={{ padding: 14, fontWeight: 700 }}>
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td style={{ padding: 14 }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: 20,
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            fontSize: 11,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatStatus(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        <p style={{ marginTop: 18, fontSize: 12, color: "#81766f" }}>
          Dashboard figures are fetched from the QuickBite backend.
        </p>
      </section>
    </AdminLayout>
  );
}
