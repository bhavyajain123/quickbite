import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyOrders, getToken, cancelOrderApi } from "../api";

const ORDERS_KEY = "quickbite-orders";
const LATEST_KEY = "quickbite-latest-order";

function readOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    const latest = JSON.parse(localStorage.getItem(LATEST_KEY) || "null");
    const all = [...(Array.isArray(saved) ? saved : []), ...(latest ? [latest] : [])];
    return all.filter((order, index, list) => {
      const id = String(order?.orderId || order?.id || "");
      return id && list.findIndex((item) => String(item?.orderId || item?.id || "") === id) === index;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch {
    return [];
  }
}


function statusText(status) {
  const s = String(status || "Order Placed").toLowerCase();

  if (s.includes("cancel")) return "Cancelled";
  if (s.includes("way") || s.includes("out for delivery")) {
    return "On the Way";
  }
  if (s.includes("partner") || s.includes("assign")) {
    return "Delivery Partner Assigned";
  }
  if (s.includes("deliver")) return "Delivered";
  if (s.includes("prepar") || s.includes("cook") || s.includes("accept")) {
    return "Restaurant Preparing";
  }

  return "Order Placed";
}


function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function canCancel(status) {
  return String(status || "").toLowerCase() === "pending";
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [notice, setNotice] = useState("");

 const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState("");

const refreshOrders = useCallback(async () => {
  if (!getToken()) {
    setOrders([]);
    setLoadError("Please log in to view your orders.");
    setLoading(false);
    return;
  }

  try {
    setLoadError("");

    const response = await getMyOrders();
    const backendOrders = Array.isArray(response.orders)
      ? response.orders
      : [];

const normalizedOrders = backendOrders.map((order) => ({
  ...order,
  orderId: order._id,
  status: order.status,
  total: order.totalAmount,
      items: (order.items || []).map((item) => ({
        ...item,
        id: item._id || item.food,
        name: item.name || item.food?.name || "Food item",
      })),
      customer: {
        address: order.deliveryAddress || "",
        phone: order.deliveryPhone || "",
      },
      deliveryFee: order.deliveryFee ?? 0,
      tax: order.tax ?? 0,
      discountAmount: order.discountAmount ?? 0,
    }));

    setOrders(normalizedOrders);
  } catch (error) {
    setLoadError(error.message || "Could not load your orders.");
  } finally {
    setLoading(false);
  }
}, []);


useEffect(() => {
  refreshOrders();

  const timer = window.setInterval(() => {
    refreshOrders();
  }, 5000);

  return () => window.clearInterval(timer);
}, [refreshOrders]);


  const filteredOrders = useMemo(() => orders.filter((order) => {
    const status = statusText(order.status);
    if (filter === "In Progress") return !["Delivered", "Cancelled"].includes(status);
    if (filter === "Delivered") return status === "Delivered";
    if (filter === "Placed") return status === "Order Placed";
    if (filter === "Cancelled") return status === "Cancelled";
    return true;
  }), [orders, filter]);

  const stats = useMemo(() => ({
    total: orders.length,
    progress: orders.filter((o) => !["Delivered", "Cancelled"].includes(statusText(o.status))).length,
    delivered: orders.filter((o) => statusText(o.status) === "Delivered").length,
  }), [orders]);

  function updateOrder(orderId, updater) {
    const current = readOrders();
    const updated = current.map((order) => String(order.orderId || order.id) === String(orderId) ? updater(order) : order);
    // Keep the orders array as the main source of truth.
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    const latest = JSON.parse(localStorage.getItem(LATEST_KEY) || "null");
    if (latest && String(latest.orderId || latest.id) === String(orderId)) {
      localStorage.setItem(LATEST_KEY, JSON.stringify(updater(latest)));
    }
    setOrders(readOrders());
  }

  function reorderItems(order) {
    const items = Array.isArray(order.items) ? order.items : Array.isArray(order.cart) ? order.cart : [];
    if (!items.length) {
      setNotice("Items for this order were not found, so it cannot be reordered.");
      return;
    }

    try {
      const cartKey = "quickbite-cart";
      const savedCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
      const cart = Array.isArray(savedCart) ? [...savedCart] : [];

      items.forEach((item, index) => {
        const id = item.id ?? item._id ?? item.foodId ?? item.name ?? item.title ?? `reorder-${index}`;
        const name = item.name || item.title || item.foodName || "Food item";
        const price = Number(item.price) || 0;
        const quantity = Math.max(1, Number(item.quantity ?? item.qty) || 1);
        const existingIndex = cart.findIndex((cartItem) => String(cartItem.id ?? cartItem._id ?? cartItem.name) === String(id));

        if (existingIndex >= 0) {
          cart[existingIndex] = {
            ...cart[existingIndex],
            quantity: Math.max(1, Number(cart[existingIndex].quantity ?? cart[existingIndex].qty) || 1) + quantity,
          };
        } else {
          cart.push({
            ...item,
            id,
            name,
            price,
            quantity,
          });
        }
      });

      localStorage.setItem(cartKey, JSON.stringify(cart));
      setNotice("Previous order items have been added to your cart.");
      window.setTimeout(() => {
        window.location.href = "/cart";
      }, 700);
    } catch {
      setNotice("Could not add these items to your cart. Please try again.");
    }
  }

 async function cancelOrder(order) {
  const id = order.orderId || order.id;
  const status = statusText(order.status);

  if (!canCancel(status)) {
    setNotice("Only pending orders can be cancelled.");
    setCancelTarget(null);
    return;
  }

  try {
    setNotice("");
    await cancelOrderApi(id);
    await refreshOrders();

    setNotice(`Order ${id} cancelled successfully.`);
    setCancelTarget(null);
    setSelectedOrder(null);
  } catch (error) {
    setNotice(error.message || "Could not cancel this order.");
  }
}

  return (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        .qb-orders-wrap { width: min(1180px, 92%); margin: 0 auto; padding: 48px 0 72px; }
        .qb-orders-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 34px 0 40px; }
        .qb-orders-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 22px 0; }
        .qb-orders-filters { display: flex; flex-wrap: wrap; gap: 8px; }
        .qb-order-card { border: 1px solid #eee5de; border-radius: 18px; background: #fff; padding: 24px; margin-bottom: 16px; }
        .qb-order-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .qb-order-actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; flex-wrap: wrap; }
        .qb-modal-backdrop { position: fixed; inset: 0; z-index: 1000; background: rgba(35, 28, 24, .52); display: grid; place-items: center; padding: 18px; }
        .qb-modal { width: min(620px, 100%); max-height: 88vh; overflow-y: auto; background: #fffdfb; border-radius: 20px; padding: 26px; box-shadow: 0 24px 80px rgba(0,0,0,.2); }
        .qb-detail-row { display: flex; justify-content: space-between; gap: 16px; padding: 11px 0; border-bottom: 1px solid #f0e7e0; font-size: 14px; }
        @media (max-width: 700px) {
          .qb-orders-wrap { width: 94%; padding-top: 30px; }
          .qb-orders-stats { grid-template-columns: 1fr; margin: 24px 0 30px; gap: 10px; }
          .qb-order-card { padding: 17px; }
          .qb-order-actions { justify-content: flex-start; width: 100%; }
          .qb-order-actions button { flex: 1 1 auto; }
          .qb-modal { padding: 20px; }
        }
      `}</style>
      <Navbar />

      <main className="qb-orders-wrap">
        <header style={styles.header}>
          <div>
            <span style={styles.eyebrow}>YOUR QUICKBITE ACCOUNT</span>
            <h1 style={styles.pageTitle}>My Orders</h1>
            <p style={styles.subtitle}>Keep track of your food orders, all in one place.</p>
          </div>
          <button style={styles.primaryButton} onClick={() => { window.location.href = "/"; }}>＋ Order food</button>
        </header>

        {loading && (
  <p style={styles.subtitle}>Loading your orders...</p>
)}

{loadError && (
  <p role="alert" style={styles.subtitle}>
    {loadError}
  </p>
)}

        {notice && (
          <div role="status" style={styles.notice}>
            <span>{notice}</span>
            <button onClick={() => setNotice("")} style={styles.noticeClose} aria-label="Dismiss notice">×</button>
          </div>
        )}

        <section className="qb-orders-stats">
          <Stat icon="📦" label="Total orders" value={stats.total} />
          <Stat icon="🛵" label="In progress" value={stats.progress} />
          <Stat icon="✅" label="Delivered" value={stats.delivered} />
        </section>

        <div className="qb-orders-toolbar">
          <h2 style={{ margin: 0, fontSize: 25 }}>Order history</h2>
          <div className="qb-orders-filters">
            {["All", "In Progress", "Delivered", "Placed", "Cancelled"].map((item) => (
              <button key={item} onClick={() => setFilter(item)} style={{ ...styles.filterButton, ...(filter === item ? styles.filterActive : {}) }}>{item}</button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <section style={styles.empty}>
            <div style={{ fontSize: 48 }}>🛍️</div>
            <h2 style={{ margin: "12px 0 6px" }}>{orders.length ? "No orders in this category" : "No orders yet"}</h2>
            <p style={styles.subtitle}>{orders.length ? "Try another filter to see your orders." : "Your next favourite meal is just a few clicks away."}</p>
            <button style={styles.primaryButton} onClick={() => { window.location.href = "/"; }}>Explore food →</button>
          </section>
        ) : filteredOrders.map((order) => {
          const id = order.orderId || order.id;
          const status = statusText(order.status);
          const items = Array.isArray(order.items) ? order.items : Array.isArray(order.cart) ? order.cart : [];
          const total = order.total ?? order.totalAmount ?? order.grandTotal ?? ((Number(order.subtotal) || 0) + (Number(order.deliveryFee) || 0) + (Number(order.tax) || 0));
          return (
            <article className="qb-order-card" key={id}>
              <div className="qb-order-head">
                <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
                  <div style={styles.orderIcon}>🛍️</div>
                  <div>
                    <h3 style={{ margin: "0 0 7px", fontSize: 21 }}>{id}</h3>
                    <p style={{ margin: 0, color: "#81766f" }}>{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Order date unavailable"}</p>
                  </div>
                </div>
                <span style={{ ...styles.statusBadge, ...(status === "Delivered" ? styles.deliveredBadge : status === "Cancelled" ? styles.cancelledBadge : {}) }}>{status}</span>
              </div>

              <div style={styles.itemsLine}>
                {items.length ? items.slice(0, 4).map((item, index) => (
                  <span key={`${item.id || item.name || item.title || "item"}-${index}`} style={styles.itemChip}>
                    {item.name || item.title || item.foodName || "Food item"} × {item.quantity || item.qty || 1}
                  </span>
                )) : <span style={styles.itemChip}>Order items</span>}
                {items.length > 4 && <span style={styles.itemChip}>+{items.length - 4} more</span>}
              </div>

              <div style={styles.orderBottom}>
                <div>
                  <span style={{ color: "#81766f", fontSize: 12 }}>Total amount</span>
                  <strong style={{ display: "block", fontSize: 21, marginTop: 4 }}>{money(total)}</strong>
                </div>
                <div className="qb-order-actions">
                  <button style={styles.secondaryButton} onClick={() => setSelectedOrder(order)}>View details</button>
                  <button style={styles.secondaryButton} onClick={() => reorderItems(order)}>Reorder</button>
                  {status !== "Cancelled" && (
                    <button style={styles.primaryButton} onClick={() => { window.location.href = `/order-tracking?orderId=${encodeURIComponent(id)}`; }}>Track order</button>
                  )}
                  {canCancel(order.status) && (
                    <button style={styles.cancelButton} onClick={() => setCancelTarget(order)}>Cancel order</button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </main>

      {selectedOrder && (
        <div className="qb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null); }}>
          <section className="qb-modal" role="dialog" aria-modal="true" aria-labelledby="qb-details-title">
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.eyebrow}>ORDER DETAILS</span>
                <h2 id="qb-details-title" style={{ margin: "6px 0 0", fontSize: 25 }}>{selectedOrder.orderId || selectedOrder.id}</h2>
              </div>
              <button style={styles.closeButton} onClick={() => setSelectedOrder(null)} aria-label="Close details">×</button>
            </div>
            <div style={{ marginTop: 20 }}>
              <Detail label="Status" value={statusText(selectedOrder.status)} />
              <Detail label="Order date" value={selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("en-IN") : "—"} />
              <Detail label="Payment method" value={String(selectedOrder.paymentMethod || "Not specified").toUpperCase().replace("_", " ")} />
              <Detail label="Payment status" value={selectedOrder.paymentStatus || "Pending"} />
              <Detail label="Subtotal" value={money(selectedOrder.subtotal)} />
              <Detail label="Delivery fee" value={money(selectedOrder.deliveryFee)} />
              <Detail label="Estimated tax" value={money(selectedOrder.tax)} />
              <Detail label="Total paid / payable" value={money(selectedOrder.total ?? selectedOrder.totalAmount ?? selectedOrder.grandTotal)} strong />
            </div>
            <h3 style={{ margin: "24px 0 10px" }}>Items ordered</h3>
            {(Array.isArray(selectedOrder.items) ? selectedOrder.items : Array.isArray(selectedOrder.cart) ? selectedOrder.cart : []).map((item, index) => (
              <div className="qb-detail-row" key={`${item.id || item.name || item.title || "item"}-${index}`}>
                <span>{item.name || item.title || item.foodName || "Food item"} × {item.quantity || item.qty || 1}</span>
                <strong>{money((Number(item.price) || 0) * (Number(item.quantity || item.qty) || 1))}</strong>
              </div>
            ))}
            <h3 style={{ margin: "24px 0 10px" }}>Delivery information</h3>
            <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{selectedOrder.customer?.fullName || selectedOrder.customer?.name || "Customer"}</p>
            <p style={styles.address}>{[selectedOrder.customer?.address, selectedOrder.customer?.city, selectedOrder.customer?.pincode].filter(Boolean).join(", ") || "Address not saved on this order."}</p>
            {selectedOrder.customer?.phone && <p style={styles.address}>Phone: {selectedOrder.customer.phone}</p>}
            {selectedOrder.deliveryPartner?.name && <p style={styles.address}>Delivery partner: {selectedOrder.deliveryPartner.name}{selectedOrder.deliveryPartner.phone ? ` · ${selectedOrder.deliveryPartner.phone}` : ""}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
              <button style={styles.secondaryButton} onClick={() => reorderItems(selectedOrder)}>Reorder items</button>
              {selectedOrder.status !== "Cancelled" && (
                <button style={styles.primaryButton} onClick={() => { const id = selectedOrder.orderId || selectedOrder.id; window.location.href = `/order-tracking?orderId=${encodeURIComponent(id)}`; }}>Track this order →</button>
              )}
            </div>
          </section>
        </div>
      )}

      {cancelTarget && (
        <div className="qb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancelTarget(null); }}>
          <section className="qb-modal" role="dialog" aria-modal="true" aria-labelledby="qb-cancel-title">
            <div style={styles.modalHeader}>
              <h2 id="qb-cancel-title" style={{ margin: 0, fontSize: 24 }}>Cancel this order?</h2>
              <button style={styles.closeButton} onClick={() => setCancelTarget(null)} aria-label="Close cancellation dialog">×</button>
            </div>
            <p style={styles.subtitle}>Order {cancelTarget.orderId || cancelTarget.id} will be cancelled in your account if cancellation is allowed.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
              <button style={styles.secondaryButton} onClick={() => setCancelTarget(null)}>Keep order</button>
              <button style={styles.cancelConfirmButton} onClick={() => cancelOrder(cancelTarget)}>Yes, cancel order</button>
            </div>
          </section>
        </div>
      )}
      <Footer />
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div><span style={{ color: "#81766f" }}>{label}</span><strong style={{ display: "block", fontSize: 22, marginTop: 5 }}>{value}</strong></div>
    </div>
  );
}

function Detail({ label, value, strong = false }) {
  return <div className="qb-detail-row"><span style={{ color: "#81766f" }}>{label}</span><strong style={strong ? { fontSize: 17 } : undefined}>{value}</strong></div>;
}

const styles = {
  page: { minHeight: "100vh", background: "#fffdfb", color: "#29231f", fontFamily: "'DM Sans', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" },
  eyebrow: { color: "#ff6b35", fontSize: 10, fontWeight: 800, letterSpacing: 1.8 },
  pageTitle: { fontSize: "clamp(30px, 4vw, 38px)", letterSpacing: "-1.5px", margin: "6px 0 8px" },
  subtitle: { color: "#81766f", fontSize: 14, lineHeight: 1.65, margin: "6px 0 0" },
  primaryButton: { border: 0, borderRadius: 11, padding: "13px 17px", background: "#ff6b35", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13 },
  secondaryButton: { border: "1px solid #e9ded5", borderRadius: 11, padding: "12px 15px", background: "#fff", color: "#554c46", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  cancelButton: { border: "1px solid #f3c8c1", borderRadius: 11, padding: "12px 15px", background: "#fff8f7", color: "#bd3f32", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  cancelConfirmButton: { border: 0, borderRadius: 11, padding: "12px 15px", background: "#c43d32", color: "#fff", fontWeight: 800, cursor: "pointer" },
  statCard: { display: "flex", alignItems: "center", gap: 16, border: "1px solid #eee5de", borderRadius: 17, padding: 23, background: "#fff" },
  statIcon: { width: 52, height: 52, display: "grid", placeItems: "center", borderRadius: 14, background: "#fff1e8", fontSize: 24 },
  filterButton: { padding: "10px 15px", border: "1px solid #eee5de", borderRadius: 30, background: "#fff", color: "#81766f", fontSize: 12, cursor: "pointer" },
  filterActive: { borderColor: "#ff6b35", background: "#fff5ef", color: "#ff6b35", fontWeight: 800 },
  orderIcon: { width: 48, height: 48, borderRadius: 13, background: "#fff1e8", display: "grid", placeItems: "center", fontSize: 22 },
  statusBadge: { display: "inline-flex", alignItems: "center", padding: "9px 13px", borderRadius: 30, background: "#fff0e5", color: "#e45522", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" },
  deliveredBadge: { background: "#e6f7ed", color: "#16834a" },
  cancelledBadge: { background: "#ffe8e8", color: "#b92d2d" },
  itemsLine: { display: "flex", gap: 8, flexWrap: "wrap", margin: "26px 0 22px" },
  itemChip: { padding: "8px 11px", borderRadius: 9, background: "#f8f3ef", color: "#655b54", fontSize: 12 },
  orderBottom: { borderTop: "1px solid #eee5de", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" },
  empty: { textAlign: "center", border: "1px solid #eee5de", borderRadius: 18, padding: "48px 20px", background: "#fff" },
  notice: { marginTop: 20, borderRadius: 12, background: "#e7f7ec", color: "#1a7a43", padding: "13px 16px", display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 },
  noticeClose: { border: 0, background: "transparent", cursor: "pointer", color: "inherit", fontSize: 20, lineHeight: 1 },
  modalHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  closeButton: { border: 0, background: "#f5eee8", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 23, color: "#554c46" },
  address: { color: "#81766f", fontSize: 14, lineHeight: 1.6, margin: "5px 0" },
};
