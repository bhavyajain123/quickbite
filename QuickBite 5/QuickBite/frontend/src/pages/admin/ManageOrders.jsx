import React, { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import { getAdminOrders, getAdminOrder, updateOrderStatus, updateDeliveryPartner } from "../../api";



const orderStatuses = [
  "Order Placed",
  "Restaurant Preparing",
  "Delivery Partner Assigned",
  "On the Way",
  "Delivered",
  "Cancelled",
];

const statusColors = {
  "Order Placed": { background: "#fff0d9", color: "#a86500" },
  "Restaurant Preparing": { background: "#eaf1ff", color: "#315dc5" },
  "Delivery Partner Assigned": { background: "#f1e8ff", color: "#7540ae" },
  "On the Way": { background: "#e8f4ff", color: "#1768a5" },
  Delivered: { background: "#e6f7ed", color: "#16834a" },
  Cancelled: { background: "#ffe8e8", color: "#c33c3c" },
};

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #e8ddd5",
  borderRadius: 9,
  background: "#fff",
  fontSize: 13,
  outlineColor: "#ff6b35",
  boxSizing: "border-box",
  width: "100%",
};


function getOrderId(order) {
  return String(order._id || order.orderId || order.id || "");
}

function getCustomer(order) {
  return order.customer?.name ||
    order.customer?.fullName ||
    order.customerName ||
    "Customer";
}

function getItems(order) {
  return Array.isArray(order.items) ? order.items : [];
}

function getTotal(order) {
  return Number(order.totalAmount ?? order.total ?? order.grandTotal ?? 0);
}

const backendToDisplayStatus = {
  pending: "Order Placed",
  confirmed: "Delivery Partner Assigned",
  preparing: "Restaurant Preparing",
  "out for delivery": "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const displayToBackendStatus = {
  "Order Placed": "pending",
  "Delivery Partner Assigned": "confirmed",
  "Restaurant Preparing": "preparing",
  "On the Way": "out for delivery",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

function getDisplayStatus(order) {
  const status = String(order.status || "pending").toLowerCase();
  return backendToDisplayStatus[status] || "Order Placed";
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
const [loading, setLoading] = useState(true);
const [savingOrderId, setSavingOrderId] = useState("");
const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [partnerDrafts, setPartnerDrafts] = useState({});


const loadOrders = async () => {
  setLoading(true);
  setError("");

  try {
    const data = await getAdminOrders({ page: 1, limit: 100 });
    const loadedOrders = Array.isArray(data.orders) ? data.orders : [];
setOrders(loadedOrders);

setPartnerDrafts((previous) => {
  const next = { ...previous };

  loadedOrders.forEach((order) => {
    const id = getOrderId(order);

    // User ke unsaved edits overwrite mat karo.
    if (!Object.prototype.hasOwnProperty.call(previous, id)) {
      next[id] = {
        name: order.deliveryPartner?.name || "",
        phone: order.deliveryPartner?.phone || "",
      };
    }
  });

  return next;
});
  } catch (err) {
    setError(err.message || "Orders load nahi ho paaye.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadOrders();
}, []);
 
const updateOrder = async (orderId, updates) => {
  if (!updates.status) {
    setMessage("Delivery partner saving abhi backend par available nahi hai.");
    return;
  }

  const backendStatus = displayToBackendStatus[updates.status];

  if (!backendStatus) {
    setError("Invalid order status.");
    return;
  }

  setSavingOrderId(orderId);
  setError("");
  setMessage("");

  try {
    const data = await updateOrderStatus(orderId, backendStatus);
    const updatedOrder = data.order;

    if (updatedOrder) {
  setOrders((previous) =>
    previous.map((order) => {
      if (getOrderId(order) !== orderId) return order;

      return {
        ...order,
        ...updatedOrder,
        customer:
          updatedOrder.customer &&
          typeof updatedOrder.customer === "object"
            ? updatedOrder.customer
            : order.customer,
      };
    })
  );
} else {
  await loadOrders();
}

    setMessage("Order status successfully updated.");
  } catch (err) {
    setError(err.message || "Order status update nahi hua.");
  } finally {
    setSavingOrderId("");
  }
};


const saveDeliveryPartner = async (orderId) => {
  const draft = partnerDrafts[orderId] || { name: "", phone: "" };
  const name = draft.name.trim();
  const phone = draft.phone.trim();

  if ((name && !phone) || (!name && phone)) {
    setError("Partner name aur phone dono fill karo.");
    return;
  }

  setSavingOrderId(orderId);
  setError("");
  setMessage("");

  try {
    const data = await updateDeliveryPartner(orderId, { name, phone });
    const updatedOrder = data.order;

    setOrders((previous) =>
      previous.map((order) =>
        getOrderId(order) === orderId
          ? { ...order, ...updatedOrder }
          : order
      )
    );

    setPartnerDrafts((previous) => ({
      ...previous,
      [orderId]: {
        name: updatedOrder?.deliveryPartner?.name || "",
        phone: updatedOrder?.deliveryPartner?.phone || "",
      },
    }));

    setMessage("Delivery partner successfully saved.");
  } catch (err) {
    setError(err.message || "Delivery partner save nahi hua.");
  } finally {
    setSavingOrderId("");
  }
};

const removeDeliveryPartner = async (orderId) => {
  const order = orders.find((item) => getOrderId(item) === orderId);
  const status = String(order?.status || "").toLowerCase();

  if (["delivered", "cancelled"].includes(status)) {
    setError("Delivered ya Cancelled order se partner remove nahi kar sakte.");
    return;
  }

  setSavingOrderId(orderId);
  setError("");
  setMessage("");

  try {
    const data = await updateDeliveryPartner(orderId, {
      name: "",
      phone: "",
    });

    const updatedOrder = data.order;

    setOrders((previous) =>
      previous.map((item) =>
        getOrderId(item) === orderId
          ? { ...item, ...updatedOrder }
          : item
      )
    );

    setPartnerDrafts((previous) => ({
      ...previous,
      [orderId]: { name: "", phone: "" },
    }));

    setMessage("Delivery partner removed successfully.");
  } catch (err) {
    setError(err.message || "Delivery partner remove nahi hua.");
  } finally {
    setSavingOrderId("");
  }
};



  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const id = getOrderId(order).toLowerCase();
      const customer = getCustomer(order).toLowerCase();
      const food = getItems(order).map((item) => item.name || item.title || "").join(" ").toLowerCase();
      const matchesSearch = id.includes(query) || customer.includes(query) || food.includes(query);
      const matchesStatus = statusFilter === "All" || getDisplayStatus(order) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const summary = [
    { label: "Total Orders", value: orders.length, icon: "📦", color: "#eaf1ff" },
    { label: "Preparing", value: orders.filter((o) => getDisplayStatus(o) === "Restaurant Preparing").length, icon: "👨‍🍳", color: "#f1e8ff" },
    { label: "On the Way", value: orders.filter((o) => getDisplayStatus(o) === "On the Way").length, icon: "🛵", color: "#e8f4ff" },
    { label: "Delivered", value: orders.filter((o) => getDisplayStatus(o) === "Delivered").length, icon: "✅", color: "#e6f7ed" },
  ];

  const selectedOrder =
  selectedOrderDetails ||
  orders.find((order) => getOrderId(order) === selectedOrderId);

  return (
    <AdminLayout>
      <section style={{ color: "#29231f" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 15, marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: "0 0 7px", fontSize: 25 }}>Manage Orders</h2>
            <p style={{ margin: 0, color: "#81766f", fontSize: 14 }}>Update restaurant preparation and delivery progress for customer orders.</p>
          </div>
          <button type="button" onClick={() => { setSearch(""); setStatusFilter("All"); setMessage("");  setError("");loadOrders(); }} style={{ ...inputStyle, width: "auto", cursor: "pointer", fontWeight: 700 }}>
            Refresh / Reset
          </button>
        </header>

        {message && <div role="status" style={{ padding: 13, marginBottom: 18, background: "#e6f7ed", color: "#16834a", borderRadius: 9, fontSize: 13 }}>{message}</div>}
        {error && (
          <div
            role="alert"
            style={{
              padding: 13,
              marginBottom: 18,
              background: "#ffe8e8",
              color: "#c33c3c",
              borderRadius: 9,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

    
        

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 22 }}>
          {summary.map((item) => (
            <article key={item.label} style={{ padding: 18, borderRadius: 14, background: "#fff", border: "1px solid #f0e7e0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#81766f", fontSize: 13 }}>{item.label}</span>
                <span style={{ background: item.color, padding: 8, borderRadius: 10 }}>{item.icon}</span>
              </div>
              <h2 style={{ margin: "12px 0 0", fontSize: 27 }}>{item.value}</h2>
            </article>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          <input type="search" placeholder="Search order ID, customer or food..." aria-label="Search orders" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, flex: "1 1 260px", width: "auto" }} />
          <select aria-label="Filter orders by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 190 }}>
            <option value="All">All statuses</option>
            {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

{loading ? (
  <div
    style={{
      padding: 38,
      textAlign: "center",
      background: "#fff",
      border: "1px solid #f0e7e0",
      borderRadius: 15,
    }}
  >
    Orders load ho rahe hain...
  </div>
) : orders.length === 0 ? (
  <div
    style={{
      padding: 38,
      textAlign: "center",
      background: "#fff",
      border: "1px solid #f0e7e0",
      borderRadius: 15,
    }}
  >
    <div style={{ fontSize: 38 }}>📦</div>
    <h3>No customer orders yet</h3>
    <p style={{ color: "#81766f" }}>
      Backend mein abhi orders nahi hain, ya koi order available nahi hai.
    </p>
  </div>
) : (
  <div
    style={{
      background: "#fff",
      border: "1px solid #f0e7e0",
      borderRadius: 15,
      overflowX: "auto",
    }}
  >
    <table
      style={{
        width: "100%",
        minWidth: 1000,
        borderCollapse: "collapse",
        textAlign: "left",
      }}
    >
      <thead>
        <tr style={{ background: "#fff8f3" }}>
          {[
            "Order ID",
            "Customer / Food",
            "Amount",
            "Status",
            "Delivery partner",
            "Actions",
          ].map((heading) => (
            <th
              key={heading}
              style={{
                padding: 13,
                fontSize: 12,
                color: "#81766f",
                whiteSpace: "nowrap",
              }}
            >
              {heading}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {filteredOrders.map((order) => {
          const id = getOrderId(order);
          const status = getDisplayStatus(order);
          const badge =
            statusColors[status] || statusColors["Order Placed"];

          const draft = partnerDrafts[id] || {
            name: order.deliveryPartner?.name || "",
            phone: order.deliveryPartner?.phone || "",
          };

          return (
            <tr
              key={id}
              style={{
                borderTop: "1px solid #f2ebe5",
                verticalAlign: "top",
              }}
            >
              <td style={{ padding: 13, fontWeight: 700 }}>
                {id}
                <div
                  style={{
                    fontSize: 11,
                    color: "#81766f",
                    marginTop: 5,
                  }}
                >
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : ""}
                </div>
              </td>

              <td style={{ padding: 13 }}>
                <strong>{getCustomer(order)}</strong>
                <div
                  style={{
                    color: "#81766f",
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  {getItems(order)
                    .map(
                      (item) =>
                        `${item.name || item.title || "Item"} × ${item.quantity || 1}`
                    )
                    .join(", ") || "Order items"}
                </div>
              </td>

              <td style={{ padding: 13, fontWeight: 700 }}>
                ₹{getTotal(order)}
              </td>

              <td style={{ padding: 13, minWidth: 205 }}>
                <select
                  aria-label={`Status for order ${id}`}
                  value={status}
                  disabled={savingOrderId === id}
                  onChange={(e) =>
                    updateOrder(id, { status: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    background: badge.background,
                    color: badge.color,
                    fontWeight: 700,
                  }}
                >
                  {orderStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {savingOrderId === id && (
                  <div style={{ fontSize: 12, marginTop: 5 }}>
                    Saving status...
                  </div>
                )}
              </td>

              <td style={{ padding: 13, minWidth: 220 }}>
                <input
                  aria-label={`Delivery partner name for ${id}`}
                  placeholder="Partner name"
                  disabled={savingOrderId === id}
                  value={draft.name}
                  onChange={(e) =>
                    setPartnerDrafts((prev) => ({
                      ...prev,
                      [id]: { ...draft, name: e.target.value },
                    }))
                  }
                  style={{ ...inputStyle, marginBottom: 7 }}
                />

                <input
                  aria-label={`Delivery partner phone for ${id}`}
                  placeholder="Partner phone"
                  disabled={savingOrderId === id}
                  value={draft.phone}
                  onChange={(e) =>
                    setPartnerDrafts((prev) => ({
                      ...prev,
                      [id]: { ...draft, phone: e.target.value },
                    }))
                  }
                  style={inputStyle}
                />

               
<div style={{ display: "flex", gap: 6, marginTop: 8 }}>
  <button
    type="button"
    disabled={savingOrderId === id}
    onClick={() => saveDeliveryPartner(id)}
    style={{
      ...inputStyle,
      flex: 1,
      background: "#ff6b35",
      color: "#fff",
      border: 0,
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    {savingOrderId === id ? "Saving..." : "Save Partner"}
  </button>

  <button
    type="button"
disabled={
  savingOrderId === id ||
  ["delivered", "cancelled"].includes(
    String(order.status || "").trim().toLowerCase()
  ) ||
  (
    !(order.deliveryPartner?.name || "").trim() &&
    !(order.deliveryPartner?.phone || "").trim() &&
    !(draft.name || "").trim() &&
    !(draft.phone || "").trim()
  )
}
    onClick={() => removeDeliveryPartner(id)}
    style={{
      ...inputStyle,
      flex: 1,
      background: "#fff",
      color: "#c0392b",
      border: "1px solid #e5b8b2",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    Remove
  </button>
</div>

              </td>

              <td style={{ padding: 13 }}>
                <button
                  type="button"
                  onClick={async () => {
                    setSelectedOrderId(id);
                    setSelectedOrderDetails(null);
                    setError("");

                    try {
                      const data = await getAdminOrder(id);
                      setSelectedOrderDetails(data.order || data);
                    } catch (err) {
                      setError(
                        err.message || "Order details load nahi ho paayi."
                      );
                    }
                  }}
                  style={{
                    padding: "9px 12px",
                    border: 0,
                    borderRadius: 8,
                    background: "#fff0e7",
                    color: "#e95220",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Details
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {filteredOrders.length === 0 && (
      <p
        style={{
          padding: 30,
          textAlign: "center",
          color: "#81766f",
        }}
      >
        No orders match these filters.
      </p>
    )}
  </div>
)}


        <p style={{ marginTop: 16, color: "#81766f", fontSize: 12, lineHeight: 1.6 }}>
          Demo note: updates are saved in this browser's localStorage and are visible to customer pages that read the same order record. They are not real-time updates across different devices or browsers; that requires a backend.
        </p>

        {selectedOrder && (
          <div onClick={() => setSelectedOrderId("")} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
            <section role="dialog" aria-modal="true" aria-labelledby="order-details-title" onClick={() => {
  setSelectedOrderId("");
  setSelectedOrderDetails(null);
}} style={{ width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: 24, boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h2 id="order-details-title" style={{ margin: 0 }}>Order Details</h2>
                <button type="button" onClick={() => setSelectedOrderId("")} style={{ border: 0, borderRadius: 8, padding: 8, cursor: "pointer" }}>✕</button>
              </div>
              <p style={{ color: "#ff6b35", fontWeight: 700 }}>{getOrderId(selectedOrder)}</p>
              {[
                ["Customer", getCustomer(selectedOrder)],
                ["Items", getItems(selectedOrder).map((i) => `${i.name || i.title} × ${i.quantity || 1}`).join(", ")],
                ["Total", `₹${getTotal(selectedOrder)}`],
                ["Status", getDisplayStatus(selectedOrder)],
                ["Delivery partner", selectedOrder.deliveryPartner?.name || "Not assigned"],
                ["Partner phone", selectedOrder.deliveryPartner?.phone || "Not assigned"],
                ["Address", selectedOrderDetails?.deliveryAddress || selectedOrder.deliveryAddress || selectedOrder.customer?.address || "Not available"],
              ].map(([label, value]) => <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "11px 0", borderBottom: "1px solid #f2ebe5", fontSize: 13 }}><span style={{ color: "#81766f" }}>{label}</span><strong style={{ textAlign: "right" }}>{value || "—"}</strong></div>)}
              <button
  type="button"
  onClick={() => {
    setSelectedOrderId("");
    setSelectedOrderDetails(null);
  }}
  style={{
    width: "100%",
    marginTop: 18,
    padding: 12,
    border: 0,
    borderRadius: 9,
    background: "#ff6b35",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  Close Details
</button>
            </section>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
