
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyOrders, getToken, getPaymentByOrder, } from "../api";


export default function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadLatestOrder() {
      if (!getToken()) {
        if (active) {
          setLoadError("Please log in to view your order.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getMyOrders();
        const orders = response.orders || [];
        const latest = orders[0];

        if (active && latest) {
         setOrder({
          
  ...latest,
  orderId: latest._id,
  status: latest.status || "pending",

  items: (latest.items || []).map((item) => ({
    ...item,
    id: item._id || item.food,
    name: item.name || item.food?.name || "Food item",
    price: item.price,
    quantity: item.quantity,
  })),

  customer: {
    address: latest.deliveryAddress || "",
    phone: latest.deliveryPhone || latest.phone || latest.customer?.phone || "",
    fullName: latest.customer?.fullName || latest.fullName || "",
  },

  subtotal: latest.subtotal ?? 0,
  deliveryFee: latest.deliveryFee ?? 0,
  tax: latest.tax ?? 0,
  discountAmount: latest.discountAmount ?? 0,
  total: latest.totalAmount ?? 0,
});

if (active && latest?._id) {
  try {
    const paymentResponse = await getPaymentByOrder(latest._id);

    if (active) {
      setPayment(paymentResponse.payment || null);
    }
  } catch (paymentError) {
    console.warn("Could not load payment information:", paymentError.message);

    if (active) {
      setPayment(null);
    }
  }
}
        } else if (active) {
          setLoadError("No order found in your account yet.");
        }
      } catch (err) {
        if (active) {
          setLoadError(err.message || "Could not load your order.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLatestOrder();

    return () => {
      active = false;
    };
  }, []);


  const rawStatus = String(order?.status || "placed").toLowerCase();
  const currentStatus = rawStatus.includes("cancel") ? "Cancelled"
    : rawStatus.includes("deliver") && !rawStatus.includes("partner") ? "Delivered"
    : rawStatus.includes("way") || rawStatus.includes("out for delivery") ? "On the Way"
    : rawStatus.includes("partner") || rawStatus.includes("assigned") ? "Delivery Partner Assigned"
    : rawStatus.includes("prepar") || rawStatus.includes("accepted") || rawStatus.includes("cook") ? "Restaurant Preparing"
    : "Order Placed";
  const stageTitles = ["Order Placed", "Restaurant Preparing", "Delivery Partner Assigned", "On the Way", "Delivered"];
  const currentStage = Math.max(0, stageTitles.indexOf(currentStatus));

if (loading) {
  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.empty}>
        <h1>Loading your order...</h1>
      </main>
      <Footer />
    </div>
  );
}

  if (!order) {
    return (
      <div style={styles.page}>
        <Navbar />

        <main style={styles.empty}>
          <div style={styles.emptyIcon}>📦</div>
          <h1>No recent order found</h1>
          <p>{loadError || "Place an order to see your confirmation details here."}</p>

          <button
            style={styles.primaryButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Explore restaurants
          </button>
        </main>

        <Footer />
      </div>
    );
  }

  const estimatedDelivery = "30–45 minutes";

  return (
    <div style={styles.page}>
      <style>{`.qb-success-tracking-grid { display:grid; grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr); gap:20px; } @media(max-width:760px){ .qb-success-tracking-grid { grid-template-columns:1fr; } }`}</style>
      <Navbar />

      <main style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.successIcon}>
            <span>✓</span>
          </div>

          <p style={styles.eyebrow}>ORDER CONFIRMED</p>

          <h1>Your order has been placed!</h1>

          <p style={styles.heroText}>
            Thanks for choosing QuickBite. Your order has been placed successfully.
          </p>

          <div style={styles.orderNumber}>
            <span>Order ID</span>
            <strong>{order.orderId}</strong>
          </div>
        </section>


        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <button
            style={styles.primaryButton}
            onClick={() => {
              window.location.href = `/order-tracking?orderId=${encodeURIComponent(order.orderId || "")}`;
            }}
          >
            Track your order →
          </button>
        </div>

        <section style={styles.trackingCard}>
          <div style={styles.trackingHeading}>
            <div><h2 style={{ margin: 0 }}>Track your delivery</h2><p style={{ color: "#81766f", fontSize: 13, margin: "7px 0 0" }}>Your order progress will update when the order status changes.</p></div>
            <span style={styles.status}>{currentStatus}</span>
          </div>
          <div className="qb-success-tracking-grid">
            <div style={{ border: "1px solid #eee5de", borderRadius: 14, overflow: "hidden", minWidth: 0 }}>
              <iframe title="Delhi NCR map preview" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=77.02%2C28.68%2C77.16%2C28.78&layer=mapnik&marker=28.7041%2C77.1025" style={{ width: "100%", height: 320, display: "block", border: 0 }} />
              <p style={{ margin: 0, padding: 12, background: "#fff8f3", color: "#81766f", fontSize: 12 }}>Map preview for Delhi NCR. Live rider location and exact route are not connected in this demo.</p>
            </div>
            <div style={styles.progressList}>
              {stageTitles.map((title, index) => {
                const done = index < currentStage || currentStatus === "Delivered";
                const active = index === currentStage && currentStatus !== "Delivered" && currentStatus !== "Cancelled";
                const descriptions = ["Restaurant has received your order.", "Fresh food is being prepared.", "A delivery partner has been assigned.", "Your food is on its way.", "Enjoy your meal!"];
                return <div key={title} style={styles.progressStep}>
                  <span style={{ ...styles.progressDot, background: done || active ? "#e2f7e9" : "#f4f0ec", color: done || active ? "#218447" : "#a49a92" }}>{done ? "✓" : index + 1}</span>
                  <div><strong style={{ color: done || active ? "#29231f" : "#99908a" }}>{title}</strong><p style={{ margin: "5px 0 0", color: "#81766f", fontSize: 12, lineHeight: 1.5 }}>{descriptions[index]}</p>{active && <small style={{ display: "inline-block", marginTop: 6, color: "#218447", fontWeight: 800, letterSpacing: 1 }}>CURRENT STATUS</small>}</div>
                </div>;
              })}
              {currentStatus === "Cancelled" && <p style={{ color: "#c33c3c", fontWeight: 700 }}>This order has been cancelled.</p>}
              {order.deliveryPartner?.name && <div style={styles.partnerInfo}><strong>🛵 Delivery partner: {order.deliveryPartner.name}</strong>{order.deliveryPartner.phone && <p style={{ margin: "5px 0 0", color: "#81766f", fontSize: 12 }}>Phone: {order.deliveryPartner.phone}</p>}</div>}
            </div>
          </div>
          <p style={{ margin: "14px 0 0", color: "#81766f", fontSize: 12 }}>Demo map only — no live GPS tracking.</p>
        </section>

        <div style={styles.layout}>
          <section style={styles.card}>
            <div style={styles.cardHeading}>
              <div>
                <h2>Order details</h2>
                <p>Here's what you've ordered.</p>
              </div>

              <span style={styles.status}>{order.status || "Placed"}</span>
            </div>

            <div style={styles.items}>
              {(order.items || []).map((item) => (
                <div key={item.id} style={styles.item}>
                  <div style={styles.foodIcon}>🍽️</div>

                  <div style={styles.itemInfo}>
                    <strong>{item.name}</strong>
                    <span>Quantity: {item.quantity}</span>
                  </div>

                  <strong>
                    ₹{Number(item.price) * Number(item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div style={styles.divider} />

        <div style={styles.priceLine}>
          <span>Subtotal</span>
          <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
        </div>

        {Number(order.discountAmount || 0) > 0 && (
          <div style={styles.priceLine}>
            <span>Discount</span>
            <span>-₹{Number(order.discountAmount).toFixed(2)}</span>
          </div>
        )}

        <div style={styles.priceLine}>
          <span>Delivery fee</span>
          <span>
            {Number(order.deliveryFee || 0) === 0
              ? "FREE"
              : `₹${Number(order.deliveryFee).toFixed(2)}`}
          </span>
        </div>

       

<div style={styles.priceLine}>
  <span>Estimated tax</span>
  <span>₹{Number(order.tax || 0).toFixed(2)}</span>
</div>

            <div style={styles.divider} />

            <div style={styles.totalLine}>
              <strong>Total amount</strong>
              <strong>₹{Number(order.total || 0).toFixed(2)}</strong>
            </div>
          </section>

          <div style={styles.rightColumn}>
            <section style={styles.card}>
              <h2>Delivery information</h2>

              <div style={styles.infoBlock}>
                <div style={styles.infoIcon}>📍</div>
                <div>
                  <strong>Delivering to</strong>
                  <p>{order.customer?.fullName}</p>
                  <p>{order.customer?.address}</p>
                  <p>
                    {order.customer?.city} - {order.customer?.pincode}
                  </p>
                </div>
              </div>

              <div style={styles.infoBlock}>
                <div style={styles.infoIcon}>📞</div>
                <div>
                  <strong>Contact number</strong>
                  <p>{order.customer?.phone || "Phone number unavailable"}</p>
                </div>
              </div>

              {order.customer?.instructions && (
                <div style={styles.infoBlock}>
                  <div style={styles.infoIcon}>📝</div>
                  <div>
                    <strong>Delivery instructions</strong>
                    <p>{order.customer.instructions}</p>
                  </div>
                </div>
              )}
            </section>

            <section style={styles.deliveryCard}>
              <div style={styles.deliveryIcon}>🛵</div>
              <div>
                <h3>Estimated delivery</h3>
                <p>{estimatedDelivery}</p>
                <small>
                  This is an estimated time for the frontend demo.
                </small>
              </div>
            </section>

            
<section style={styles.card}>
  <h2>Payment information</h2>

  <div style={styles.paymentRow}>
    <span>Payment method</span>
    <strong>
      {payment?.method === "COD"
        ? "Cash on Delivery"
        : payment?.method === "UPI"
        ? "UPI Demo"
        : "Not available"}
    </strong>
  </div>

  <div style={styles.paymentRow}>
    <span>Payment status</span>
    <span
      style={
        payment?.status === "paid"
          ? { ...styles.pending, color: "#218447" }
          : styles.pending
      }
    >
      {payment?.status === "paid"
        ? "Paid"
        : payment?.status === "failed"
        ? "Failed"
        : payment?.status === "pending"
        ? "Pending"
        : "Unavailable"}
    </span>
  </div>

  {payment?.method === "UPI" && payment?.status === "paid" && (
    <small style={{ color: "#81766f" }}>
      Demo confirmation only; no real payment was collected.
    </small>
  )}
</section>

          </div>
        </div>

        <section style={styles.bottom}>
          <h2>What's next?</h2>
          <p>
            Your order confirmation is saved in this browser. You can
            continue exploring the menu or check your order history.
          </p>

          <div style={styles.buttons}>
            <button
              style={styles.primaryButton}
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Explore more food →
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => {
                window.location.href = "/my-orders";
              }}
            >
              View my orders
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fffdfb",
    color: "#29231f",
    fontFamily: "'DM Sans', sans-serif",
  },
  container: {
    width: "min(1100px, 92%)",
    margin: "0 auto",
    padding: "40px 0 70px",
  },
  hero: {
    textAlign: "center",
    padding: "35px 20px 45px",
  },
  successIcon: {
    width: 76,
    height: 76,
    display: "grid",
    placeItems: "center",
    margin: "0 auto 22px",
    borderRadius: "50%",
    background: "#e3f8e9",
    color: "#218447",
    fontSize: 39,
    fontWeight: 800,
  },
  eyebrow: {
    color: "#23854b",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
  },
  heroText: {
    maxWidth: 480,
    margin: "12px auto 22px",
    color: "#81766f",
    fontSize: 14,
    lineHeight: 1.8,
  },
  orderNumber: {
    display: "inline-flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    padding: "12px 18px",
    border: "1px dashed #e4d8ce",
    borderRadius: 12,
    background: "#fff",
    fontSize: 13,
  },
  trackingCard: { marginBottom: 24, padding: 24, border: "1px solid #eee5de", borderRadius: 18, background: "#fff" },
  trackingHeading: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 },
  progressList: { display: "grid", gap: 18, alignContent: "start" },
  progressStep: { display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 },
  progressDot: { display: "grid", placeItems: "center", width: 34, height: 34, flex: "0 0 34px", borderRadius: "50%", fontWeight: 800 },
  partnerInfo: { padding: 12, borderRadius: 12, background: "#fff8f3", marginTop: 4 },
  stepsCard: {
    margin: "0 0 24px",
    padding: 24,
    border: "1px solid #eee5de",
    borderRadius: 18,
    background: "#fff",
  },
  stepsIntro: {
    margin: "8px 0 20px",
    color: "#81766f",
    fontSize: 13,
    lineHeight: 1.7,
  },
  step: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    minWidth: 0,
    padding: 14,
    border: "1px solid #f0e7e0",
    borderRadius: 12,
    background: "#fffdfb",
  },
  stepIcon: {
    display: "grid",
    placeItems: "center",
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#fff2e9",
    fontSize: 20,
    flexShrink: 0,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, .9fr)",
    alignItems: "start",
    gap: 22,
  },
  rightColumn: {
    display: "grid",
    gap: 20,
  },
  card: {
    padding: 24,
    border: "1px solid #eee5de",
    borderRadius: 18,
    background: "#fff",
  },
  cardHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: 12,
    marginBottom: 22,
  },
  status: {
    padding: "7px 11px",
    borderRadius: 20,
    background: "#fff0e4",
    color: "#d75c25",
    fontSize: 11,
    fontWeight: 800,
  },
  items: {
    display: "grid",
    gap: 19,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 13,
  },
  foodIcon: {
    display: "grid",
    placeItems: "center",
    width: 43,
    height: 43,
    flexShrink: 0,
    borderRadius: 12,
    background: "#fff2e9",
    fontSize: 22,
  },
  itemInfo: {
    display: "grid",
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  divider: {
    borderTop: "1px solid #eee5de",
    margin: "22px 0",
  },
  priceLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    margin: "14px 0",
    color: "#81766f",
    fontSize: 13,
  },
  totalLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 16,
  },
  infoBlock: {
    display: "flex",
    alignItems: "start",
    gap: 13,
    marginTop: 22,
  },
  infoIcon: {
    display: "grid",
    placeItems: "center",
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 11,
    background: "#fff2e9",
    fontSize: 19,
  },
  deliveryCard: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    padding: 22,
    borderRadius: 18,
    background: "#fff1e8",
    border: "1px solid #ffe0ce",
  },
  deliveryIcon: {
    fontSize: 36,
  },
  pending: {
    color: "#b96a1d",
    fontSize: 12,
    fontWeight: 800,
  },
  paymentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
    fontSize: 12,
  },
  bottom: {
    marginTop: 25,
    padding: "30px 24px",
    border: "1px solid #eee5de",
    borderRadius: 18,
    background: "#fff",
    textAlign: "center",
  },
  buttons: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 22,
  },
  primaryButton: {
    padding: "13px 20px",
    border: 0,
    borderRadius: 10,
    background: "#ff6b35",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "13px 20px",
    border: "1px solid #e9ded5",
    borderRadius: 10,
    background: "#fff",
    color: "#554c46",
    fontWeight: 800,
    cursor: "pointer",
  },
  empty: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "80px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 55,
  },
};
