
import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getAllDeliveries, updateDeliveryStatus, getAdminOrders,getDeliveryPartners,assignDelivery, } from "../../api";

const statuses = [
  "assigned",
  "picked_up",
  "out_for_delivery",
  "delivered",
  "failed",
  "cancelled",
];

const nextStatuses = {
  assigned: ["picked_up", "cancelled"],
  picked_up: ["out_for_delivery", "failed"],
  out_for_delivery: ["delivered", "failed"],
  failed: ["assigned", "cancelled"],
  delivered: [],
  cancelled: [],
};

const prettyStatus = (status = "") =>
  status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [failureReasons, setFailureReasons] = useState({});
const [orders, setOrders] = useState([]);
const [partners, setPartners] = useState([]);
const [orderId, setOrderId] = useState("");
const [partnerId, setPartnerId] = useState("");
const [pickupAddress, setPickupAddress] = useState("");
const [estimatedDeliveryAt, setEstimatedDeliveryAt] = useState("");
const [assigning, setAssigning] = useState(false);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllDeliveries({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });

      setDeliveries(data.deliveries || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message || "Unable to load deliveries.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  useEffect(() => {
  const loadAssignmentOptions = async () => {
    try {
      const [orderData, partnerData] = await Promise.all([
        getAdminOrders({ page: 1, limit: 100 }),
        getDeliveryPartners(),
      ]);

      const orderList = orderData.orders || orderData.data?.orders || [];
      const partnerList =
        partnerData.deliveryPartners || partnerData.data?.deliveryPartners || [];

      setOrders(
        orderList.filter(
          (order) => !["delivered", "cancelled"].includes(
            String(order.status || "").toLowerCase()
          )
        )
      );
      setPartners(partnerList);
    } catch (err) {
      setError(err.message || "Unable to load orders and delivery partners.");
    }
  };

  loadAssignmentOptions();
}, []);

  const changeStatus = async (delivery, status) => {
    let failureReason;

    if (status === "failed") {
      failureReason = (failureReasons[delivery._id] || "").trim();

      if (!failureReason) {
        setError("Please enter a reason before marking a delivery failed.");
        return;
      }
    }

    setBusyId(delivery._id);
    setError("");
    setMessage("");

    try {
      await updateDeliveryStatus(delivery._id, status, failureReason);
      setMessage("Delivery status updated successfully.");
      await loadDeliveries();
    } catch (err) {
      setError(err.message || "Unable to update delivery status.");
    } finally {
      setBusyId("");
    }
  };
  const handleAssignDelivery = async (event) => {
  event.preventDefault();

  if (!orderId || !partnerId) {
    setError("Please select an order and delivery partner.");
    return;
  }

  setAssigning(true);
  setError("");
  setMessage("");

  try {
    await assignDelivery({
      orderId,
      deliveryPartnerId: partnerId,
      pickupAddress,
      estimatedDeliveryAt: estimatedDeliveryAt
        ? new Date(estimatedDeliveryAt).toISOString()
        : undefined,
    });

    setMessage("Delivery assigned successfully.");
    setOrderId("");
    setPartnerId("");
    setPickupAddress("");
    setEstimatedDeliveryAt("");

    await loadDeliveries();
  } catch (err) {
    setError(err.message || "Unable to assign delivery.");
  } finally {
    setAssigning(false);
  }
};

  return (
    <AdminLayout>
      <main style={{ padding: 24, color: "#292524" }}>
        <h1 style={{ margin: "0 0 8px" }}>Delivery Management</h1>
        <p style={{ color: "#78716c", marginTop: 0 }}>
          View delivery assignments and update delivery progress.
        </p>

        
<section
  style={{
    background: "#fff",
    border: "1px solid #e7e5e4",
    borderRadius: 12,
    padding: 18,
    margin: "20px 0",
  }}
>
  <h2 style={{ marginTop: 0 }}>Assign a Delivery</h2>

  <form
    onSubmit={handleAssignDelivery}
    style={{ display: "grid", gap: 12, maxWidth: 600 }}
  >
    <label>
      Order
      <select
        required
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        style={{ display: "block", width: "100%", padding: 10, marginTop: 5 }}
      >
        <option value="">Select an order</option>
        {orders.map((order) => (
          <option key={order._id} value={order._id}>
            {(order.orderNumber || order._id)} — {order.status || "Unknown status"}
          </option>
        ))}
      </select>
    </label>

    <label>
      Delivery Partner
      <select
        required
        value={partnerId}
        onChange={(e) => setPartnerId(e.target.value)}
        style={{ display: "block", width: "100%", padding: 10, marginTop: 5 }}
      >
        <option value="">Select a delivery partner</option>
        {partners.map((partner) => (
          <option key={partner._id} value={partner._id}>
            {partner.name} ({partner.email})
          </option>
        ))}
      </select>
    </label>

    <label>
      Pickup Address
      <input
        value={pickupAddress}
        onChange={(e) => setPickupAddress(e.target.value)}
        placeholder="Restaurant pickup address"
        style={{ display: "block", width: "100%", padding: 10, marginTop: 5 }}
      />
    </label>

    <label>
      Estimated Delivery Time
      <input
        type="datetime-local"
        value={estimatedDeliveryAt}
        onChange={(e) => setEstimatedDeliveryAt(e.target.value)}
        min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
        style={{ display: "block", width: "100%", padding: 10, marginTop: 5 }}
      />
    </label>

    <button type="submit" disabled={assigning || !orders.length || !partners.length}>
      {assigning ? "Assigning..." : "Assign Delivery"}
    </button>

    {!orders.length && <p>No eligible orders available.</p>}
    {!partners.length && <p>No delivery partners found. Create or register a user with the deliveryPartner role first.</p>}
  </form>
</section>


        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "20px 0" }}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {prettyStatus(status)}
              </option>
            ))}
          </select>

          <button
            onClick={loadDeliveries}
            disabled={loading}
            style={{ padding: "10px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>

        {error && (
          <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>
        )}
        {message && (
          <p role="status" style={{ color: "#15803d" }}>{message}</p>
        )}

        {loading ? (
          <p>Loading deliveries...</p>
        ) : deliveries.length === 0 ? (
          <p>No deliveries found for this filter.</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {deliveries.map((delivery) => {
              const allowed = nextStatuses[delivery.status] || [];
              const orderId = delivery.order?._id || delivery.order || "—";
              const partner = delivery.deliveryPartner;

              return (
                <section
                  key={delivery._id}
                  style={{
                    border: "1px solid #e7e5e4",
                    borderRadius: 12,
                    padding: 18,
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <strong>Order ID:</strong> {String(orderId)}
                      <p style={{ margin: "8px 0" }}>
                        <strong>Partner:</strong>{" "}
                        {partner?.name || "Not available"}
                        {partner?.email ? ` (${partner.email})` : ""}
                      </p>
                    </div>
                    <span style={{ fontWeight: 700 }}>
                      {prettyStatus(delivery.status)}
                    </span>
                  </div>

                  <p>
                    <strong>Delivery ID:</strong> {delivery._id}
                  </p>
                  <p>
                    <strong>Pickup:</strong> {delivery.pickupAddress || "—"}
                  </p>
                  <p>
                    <strong>Drop-off:</strong> {delivery.deliveryAddress || "—"}
                  </p>
                  <p>
                    <strong>ETA:</strong>{" "}
                    {delivery.estimatedDeliveryAt
                      ? new Date(delivery.estimatedDeliveryAt).toLocaleString()
                      : "Not set"}
                  </p>

                  {delivery.failureReason && (
                    <p><strong>Failure reason:</strong> {delivery.failureReason}</p>
                  )}

                  {allowed.length > 0 && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                      {allowed.includes("failed") && (
                        <input
                          value={failureReasons[delivery._id] || ""}
                          onChange={(e) =>
                            setFailureReasons((prev) => ({
                              ...prev,
                              [delivery._id]: e.target.value,
                            }))
                          }
                          placeholder="Reason if delivery fails"
                          aria-label="Failure reason"
                          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
                        />
                      )}

                      {allowed.map((status) => (
                        <button
                          key={status}
                          disabled={busyId === delivery._id}
                          onClick={() => changeStatus(delivery, status)}
                          style={{
                            padding: "10px 14px",
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            cursor: "pointer",
                          }}
                        >
                          {busyId === delivery._id
                            ? "Saving..."
                            : `Mark ${prettyStatus(status)}`}
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {!loading && (pagination.totalPages || 0) > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage || page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
