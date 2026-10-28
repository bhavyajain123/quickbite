import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyOrders, getToken, getDeliveryByOrder } from "../api";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ORDER_KEY = "quickbite-orders";
const LATEST_KEY = "quickbite-latest-order";


const stages = [
  { title: "Order Placed", description: "The restaurant has received your order.", icon: "✓" },
  { title: "Restaurant Preparing", description: "Fresh food is being prepared.", icon: "🍳" },
  { title: "Delivery Partner Assigned", description: "Your delivery partner is assigned to this order.", icon: "🛵" },
  { title: "On the Way", description: "Your food is on its way to you.", icon: "🛵" },
  { title: "Delivered", description: "Enjoy your meal!", icon: "🏠" },
];


function normalizedStatus(status) {
  const s = String(status || "").toLowerCase();

  if (s.includes("cancel")) return "Cancelled";
  if (s.includes("on the way") || s.includes("out for delivery")) {
    return "On the Way";
  }
  if (s.includes("partner") || s.includes("assigned")) {
    return "Delivery Partner Assigned";
  }
  if (s.includes("deliver")) return "Delivered";
  if (s.includes("prepar") || s.includes("cook") || s.includes("accepted")) {
    return "Restaurant Preparing";
  }

  return "Order Placed";
}


function stageIndex(status) {
  const normalized = normalizedStatus(status);
  if (normalized === "Delivered") return 4;
  if (normalized === "On the Way") return 3;
  if (normalized === "Delivery Partner Assigned") return 2;
  if (normalized === "Restaurant Preparing") return 1;
  return 0;
}

function readAllOrders() {
  try {
    const list = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
    const latest = JSON.parse(localStorage.getItem(LATEST_KEY) || "null");
    const combined = [...(Array.isArray(list) ? list : []), ...(latest ? [latest] : [])];
    return combined.filter((item, index, arr) =>
      item && arr.findIndex((other) => String(other.orderId || other.id || "") === String(item.orderId || item.id || "")) === index
    );
  } catch {
    return [];
  }
}

function MapAutoFit({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points, { padding: [30, 30] });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [map, points]);

  return null;
}

async function fetchRoadRoute(start, end) {
  if (!start || !end) return null;

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start[1]},${start[0]};${end[1]},${end[0]}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url);
  console.log("OSRM route URL:", url);
console.log("OSRM response status:", response.status);

  if (!response.ok) {
    throw new Error("Road route could not be loaded.");
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No road route found for these locations.");
  }
console.log("OSRM route points:", data.routes[0].geometry.coordinates.length);
const selectedRoute = data.routes[0];

return {
  points: selectedRoute.geometry.coordinates.map(
    ([longitude, latitude]) => [latitude, longitude]
  ),
  distanceKm: Number((selectedRoute.distance / 1000).toFixed(1)),
  durationMinutes: Math.round(selectedRoute.duration / 60),
};
}

function DeliveryRouteMap({ restaurantPosition, customerPosition, route }) {
  const points = [restaurantPosition, customerPosition].filter(Boolean);

  return (
    <div style={{ height: 300, width: "100%" }}>
      <MapContainer
        center={customerPosition || [28.6139, 77.2090]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {restaurantPosition && (
          <Marker position={restaurantPosition}>
            <Popup>Restaurant</Popup>
          </Marker>
        )}

        {customerPosition && (
          <Marker position={customerPosition}>
            <Popup>Delivery address</Popup>
          </Marker>
        )}

        {route && route.length > 1 && (
          <Polyline positions={route} color="#ff6b35" weight={5} />
        )}

        <MapAutoFit points={route && route.length > 1 ? route : points} />
      </MapContainer>
    </div>
  );
}

export default function OrderTracking() {
  const params = new URLSearchParams(window.location.search);
  const [orderId, setOrderId] = useState(params.get("orderId") || "");
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState(null);
const [deliveryError, setDeliveryError] = useState("");
const [roadRoute, setRoadRoute] = useState([]);
const [routeError, setRouteError] = useState("");
const [routeDistanceKm, setRouteDistanceKm] = useState(null);
const [routeDurationMinutes, setRouteDurationMinutes] = useState(null);
useEffect(() => {
  let cancelled = false;

  async function loadRoute() {
    setRoadRoute([]);
    setRouteError("");

    const restaurant = order?.restaurant;
    console.log("Restaurant location:", order?.restaurant);
console.log("Delivery coordinates:", order?.deliveryLatitude, order?.deliveryLongitude);
    const restaurantLat = restaurant?.latitude;
    const restaurantLng = restaurant?.longitude;
    const customerLat = order?.deliveryLatitude;
    const customerLng = order?.deliveryLongitude;

    if (
      typeof restaurantLat !== "number" ||
      typeof restaurantLng !== "number" ||
      typeof customerLat !== "number" ||
      typeof customerLng !== "number"
    ) {
      setRouteError(
        "Route coordinates are missing. A newly placed order with saved restaurant and delivery coordinates is required."
      );
      return;
    }

    try {
      const routeData = await fetchRoadRoute(
  [restaurantLat, restaurantLng],
  [customerLat, customerLng]
);

if (!cancelled && routeData) {
  setRoadRoute(routeData.points);
  setRouteDistanceKm(routeData.distanceKm);
  setRouteDurationMinutes(routeData.durationMinutes);
}
    } catch (error) {
      if (!cancelled) {
        setRouteError(error.message || "Road route could not be loaded.");
      }
    }
  }

  if (order) loadRoute();

  return () => {
    cancelled = true;
  };
}, [order]);

const findOrder = useCallback(async (event) => {
  if (event) event.preventDefault();

  const searchId = orderId.trim().toLowerCase();
  setSearched(true);
  setError("");

  if (!searchId) {
    setOrder(null);
    setError("Please enter your order ID.");
    return;
  }

  if (!getToken()) {
    setOrder(null);
    setError("Please sign in to track your order.");
    return;
  }

  try {
    const response = await getMyOrders();
    const orders = Array.isArray(response.orders) ? response.orders : [];

    const found = orders.find((item) =>
      String(item._id || item.orderId || item.id || "").toLowerCase() === searchId
    );

    if (found) {
      setOrder({
        ...found,
        orderId: found._id || found.orderId || found.id,
        total: found.totalAmount ?? found.total,
        deliveryPartner: found.deliveryPartner || {},
        customer: {
          address: found.deliveryAddress || "",
          phone: found.deliveryPhone || "",
        },
      });
    } else {
      setOrder(null);
      setError("Order nahi mila. Confirm karo ki tum sahi customer account mein logged in ho.");
    }
  } catch (err) {
    setOrder(null);
    setError(err.message || "Order load nahi ho saka.");
  }
}, [orderId]);


useEffect(() => {
  if (params.get("orderId")) findOrder();
}, [findOrder]);

  

useEffect(() => {
  if (!order?.orderId || !getToken()) return undefined;

  

  const refreshFromBackend = async () => {
    try {
      const response = await getMyOrders();

    setDelivery(null);
setDeliveryError("A delivery partner has not been assigned yet.");
      const orders = Array.isArray(response.orders) ? response.orders : [];

      const latest = orders.find(
        (item) => String(item._id || item.orderId || item.id) === String(order.orderId)
      );

      if (latest) {
        setOrder({
          ...latest,
          orderId: latest._id || latest.orderId || latest.id,
          total: latest.totalAmount ?? latest.total,
          deliveryPartner: latest.deliveryPartner || {},
          customer: {
            address: latest.deliveryAddress || "",
            phone: latest.deliveryPhone || "",
          },
        });
      }
    } catch (err) {
      console.error("Could not refresh order tracking:", err);
    }
  };

  const timer = window.setInterval(refreshFromBackend, 5000);

  return () => window.clearInterval(timer);
}, [order?.orderId]);


  const status = order ? normalizedStatus(order.status) : "Order Placed";
  const currentStage = stageIndex(status);
  const eta = status === "Delivered"
    ? { title: "Delivered successfully", detail: "Your order has reached you. Enjoy your meal!", range: "Delivered" }
    : status === "Cancelled"
      ? { title: "Order cancelled", detail: "This order will not be delivered.", range: "Cancelled" }
      : status === "On the Way"
        ? { title: "Your food is on the way", detail: "Estimated arrival based on the current demo status.", range: "5–15 min" }
        : status === "Delivery Partner Assigned"
          ? { title: "Your delivery partner is assigned", detail: "The partner is getting ready to collect your order.", range: "15–25 min" }
          : status === "Restaurant Preparing"
            ? { title: "The restaurant is preparing your food", detail: "Your meal is being freshly prepared.", range: "20–30 min" }
            : { title: "Your order is confirmed", detail: "The restaurant will start preparing your food shortly.", range: "30–45 min" };
  const partner = order?.deliveryPartner || {};
const address = order?.customer?.address || order?.deliveryAddress || "";

  return (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        .qb-track-wrap { width: min(1080px, 92%); margin: 0 auto; padding: 42px 0 70px; }
        .qb-track-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(280px, .8fr); gap: 20px; align-items: start; }
        .qb-track-stages { display: grid; gap: 0; }
        .qb-track-stage { display: flex; gap: 14px; min-height: 83px; }
        .qb-track-rail { width: 42px; flex: 0 0 42px; display: flex; flex-direction: column; align-items: center; }
        .qb-track-dot { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; font-weight: 800; }
        .qb-track-line { flex: 1; width: 3px; min-height: 25px; background: #eee5de; }
        .qb-track-stage-copy { padding: 4px 0 20px; }
        .qb-track-stage-copy p { margin: 5px 0 0; color: #81766f; font-size: 13px; line-height: 1.5; }
        .qb-track-map iframe { width: 100%; height: 300px; display: block; border: 0; }
        .qb-eta-card { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:20px; padding:18px 22px; border:1px solid #ffe0cf; border-radius:16px; background:linear-gradient(110deg,#fff3e9,#fffaf6); }
        .qb-eta-time { flex-shrink:0; padding:10px 13px; border-radius:12px; background:#ff6b35; color:#fff; font-weight:800; font-size:15px; white-space:nowrap; }
        @media(max-width:520px) { .qb-eta-card { align-items:flex-start; flex-direction:column; padding:16px; } }
        @media(max-width: 760px) {
          .qb-track-wrap { width: 94%; padding-top: 28px; }
          .qb-track-grid { grid-template-columns: 1fr; }
          .qb-track-map iframe { height: 250px; }
        }
      `}</style>
      <Navbar />

      <main className="qb-track-wrap">
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={styles.eyebrow}>QUICKBITE DELIVERY</span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", margin: "10px 0" }}>Track your order</h1>
          <p style={{ color: "#81766f", margin: 0 }}>Follow your food from the restaurant to your door.</p>
        </header>

        <section style={styles.card}>
          <h2 style={{ margin: "0 0 6px" }}>Find your order</h2>
          <p style={styles.muted}>Enter the order ID shown on your confirmation page.</p>
          <form onSubmit={findOrder} style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. QB1729600000000" aria-label="Order ID" style={styles.input} />
            <button type="submit" style={styles.button}>Track order →</button>
          </form>
          {error && <p role="alert" style={{ color: "#c33c3c", fontSize: 13, marginBottom: 0 }}>{error}</p>}
        </section>

        {order && (
          <>
            <section style={{ ...styles.card, marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <span style={styles.eyebrow}>ORDER ID</span>
                  <h2 style={{ margin: "5px 0" }}>{order.orderId || order.id}</h2>
                  <p style={styles.muted}>Placed {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "recently"}</p>
                </div>
                <span style={{ ...styles.badge, background: status === "Delivered" ? "#e6f7ed" : status === "Cancelled" ? "#ffe8e8" : "#fff0e7", color: status === "Delivered" ? "#16834a" : status === "Cancelled" ? "#c33c3c" : "#d94f20" }}>{status}</span>
              </div>
            </section>

            <section className="qb-eta-card" aria-live="polite">
              <div>
                <div style={{ color: "#d94f20", fontSize: 10, fontWeight: 800, letterSpacing: 1.4, marginBottom: 6 }}>DELIVERY UPDATE</div>
                <h2 style={{ margin: "0 0 5px", fontSize: 18 }}>{eta.title}</h2>
                <p style={{ margin: 0, color: "#81766f", fontSize: 13, lineHeight: 1.5 }}>{eta.detail}</p>
              </div>
              <div className="qb-eta-time">{eta.range}</div>
            </section>

            <div className="qb-track-grid" style={{ marginTop: 20 }}>
              <section style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "20px 22px 12px" }}>
                  <h2 style={{ margin: "0 0 5px" }}>Delivery map</h2>
                  <p style={styles.muted}>Map preview for the demo. It does not show a live rider route.</p>
                </div>
<div className="qb-track-map">
  <DeliveryRouteMap
    restaurantPosition={
      typeof order.restaurant?.latitude === "number" &&
      typeof order.restaurant?.longitude === "number"
        ? [order.restaurant.latitude, order.restaurant.longitude]
        : null
    }
    customerPosition={
      typeof order.deliveryLatitude === "number" &&
      typeof order.deliveryLongitude === "number"
        ? [order.deliveryLatitude, order.deliveryLongitude]
        : null
    }
    route={roadRoute}
  />
</div>
{routeDistanceKm !== null && routeDurationMinutes !== null && (
  <div
    style={{
      display: "flex",
      gap: 24,
      padding: "12px 16px",
      border: "1px solid #eee",
      borderRadius: 12,
      marginTop: 12,
      marginBottom: 12,
    }}
  >
    <div>
      <div style={{ fontSize: 12, color: "#81766f" }}>Road distance</div>
      <strong>{routeDistanceKm} km</strong>
    </div>

    <div>
      <div style={{ fontSize: 12, color: "#81766f" }}>
        Estimated driving time
      </div>
      <strong>
        {routeDurationMinutes < 60
          ? `${routeDurationMinutes} min`
          : `${Math.floor(routeDurationMinutes / 60)} hr ${routeDurationMinutes % 60} min`}
      </strong>
    </div>
  </div>
)}

{routeError && (
  <div style={{ padding: 15, color: "#81766f", fontSize: 12 }}>
    {routeError}
  </div>
)}
              </section>

              <section style={styles.card}>
                
<div
  style={{
    borderTop: "1px solid #eee5de",
    paddingTop: 16,
    marginTop: 16,
  }}
>
  <h3 style={{ margin: "0 0 10px" }}>Live Delivery Details</h3>

  {deliveryError && (
    <p style={{ color: "#81766f", fontSize: 13 }}>{deliveryError}</p>
  )}

  {delivery && (
    <>
      <p>
        <strong>Delivery status:</strong>{" "}
        {String(delivery.status || "unknown")
          .replaceAll("_", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())}
      </p>

      <p>
        <strong>Delivery partner:</strong>{" "}
        {delivery.deliveryPartner?.name || partner.name || "Not assigned"}
      </p>

      <p>
        <strong>Estimated delivery:</strong>{" "}
        {delivery.estimatedDeliveryAt
          ? new Date(delivery.estimatedDeliveryAt).toLocaleString("en-IN")
          : "Not available"}
      </p>

      {delivery.failureReason && (
        <p>
          <strong>Delivery issue:</strong> {delivery.failureReason}
        </p>
      )}

      {typeof delivery.currentLocation?.latitude === "number" &&
      typeof delivery.currentLocation?.longitude === "number" ? (
        <>
          <p>
            <strong>Last known coordinates:</strong>{" "}
            {delivery.currentLocation.latitude},{" "}
            {delivery.currentLocation.longitude}
          </p>

          <p style={styles.muted}>
            Last updated:{" "}
            {delivery.currentLocation.updatedAt
              ? new Date(delivery.currentLocation.updatedAt).toLocaleString("en-IN")
              : "Time not available"}
          </p>

          <a
            href={`https://www.google.com/maps?q=${delivery.currentLocation.latitude},${delivery.currentLocation.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            View last known location on map
          </a>
        </>
      ) : (
        <p style={styles.muted}>
          Delivery partner location has not been shared yet.
        </p>
      )}
    </>
  )}
</div>

                <h2 style={{ margin: "0 0 20px" }}>Delivery progress</h2>
                {status === "Cancelled" ? (
                  <div style={{ padding: 14, borderRadius: 12, background: "#fff0f0", color: "#b92d2d" }}>This order has been cancelled.</div>
                ) : (
                  <div className="qb-track-stages">
                    {stages.map((stage, index) => {
                      const done = index < currentStage || status === "Delivered";
                      const active = index === currentStage && status !== "Delivered";
                      return (
                        <div className="qb-track-stage" key={stage.title}>
                          <div className="qb-track-rail">
                            <div className="qb-track-dot" style={{ background: done || active ? "#e2f7e9" : "#f4f0ec", color: done || active ? "#218447" : "#a49a92" }}>
                              {done ? "✓" : stage.icon}
                            </div>
                            {index < stages.length - 1 && <div className="qb-track-line" style={{ background: done ? "#53b978" : "#eee5de" }} />}
                          </div>
                          <div className="qb-track-stage-copy">
                            <strong style={{ color: done || active ? "#29231f" : "#99908a" }}>{stage.title}</strong>
                            <p>{stage.description}</p>
                            {active && <span style={{ display: "inline-block", marginTop: 7, color: "#218447", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>CURRENT STATUS</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {partner.name && (
                  <div style={styles.partnerBox}>
                    <div style={{ fontSize: 25 }}>🛵</div>
                    <div>
                      <strong>Delivery partner: {partner.name}</strong>
                      {partner.phone && <p style={{ margin: "5px 0 0", color: "#81766f", fontSize: 13 }}>Phone: {partner.phone}</p>}
                    </div>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #eee5de", paddingTop: 16, marginTop: 8 }}>
                  <strong>Delivery address</strong>
                  <p style={styles.muted}>{address || "Address not available in this saved order."}</p>
                  <strong>Order total</strong>
                  <p style={{ margin: "5px 0", fontSize: 20, fontWeight: 800 }}>₹{order.total ?? order.totalAmount ?? order.grandTotal ?? 0}</p>
                </div>
              </section>
            </div>

            <p style={{ textAlign: "center", color: "#81766f", fontSize: 12, lineHeight: 1.6, marginTop: 18 }}>
              Order status and delivery partner details are loaded from your account.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <button onClick={() => { window.location.href = "/my-orders"; }} style={styles.secondaryButton}>View all orders</button>
              <button onClick={() => { window.location.href = "/"; }} style={styles.button}>Order more food</button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#fffdfb", color: "#29231f", fontFamily: "'DM Sans', sans-serif" },
  card: { padding: 22, border: "1px solid #eee5de", borderRadius: 18, background: "#fff", minWidth: 0 },
  eyebrow: { color: "#ff6b35", fontSize: 10, fontWeight: 800, letterSpacing: 1.8 },
  muted: { color: "#81766f", fontSize: 13, lineHeight: 1.6, margin: "7px 0 0" },
  input: { flex: "1 1 240px", minWidth: 0, padding: 13, border: "1px solid #e9ded5", borderRadius: 10, fontSize: 14 },
  button: { padding: "13px 18px", border: 0, borderRadius: 10, background: "#ff6b35", color: "#fff", fontWeight: 800, cursor: "pointer" },
  secondaryButton: { padding: "13px 18px", border: "1px solid #e9ded5", borderRadius: 10, background: "#fff", color: "#554c46", fontWeight: 800, cursor: "pointer" },
  badge: { padding: "8px 13px", borderRadius: 20, fontSize: 11, fontWeight: 800 },
  partnerBox: { display: "flex", gap: 12, alignItems: "center", padding: 13, background: "#fff8f3", borderRadius: 12, margin: "6px 0 18px" },
};
