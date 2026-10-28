
import React, { useEffect, useState } from "react";
import { getCoupons, createCoupon, deleteCoupon } from "../../api";
import AdminLayout from "./AdminLayout";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "10",
    maxDiscount: "",
    minOrderAmount: "100",
    expiryDate: "",
    usageLimit: "100",
  });

  async function loadCoupons() {
    setLoading(true);
    setError("");

    try {
      const result = await getCoupons();
      setCoupons(Array.isArray(result.coupons) ? result.coupons : []);
    } catch (err) {
      setError(err.message || "Coupons load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const expiry = new Date(form.expiryDate);

    if (!form.code.trim() || !form.expiryDate || Number.isNaN(expiry.getTime())) {
      setError("Coupon code aur valid expiry date enter karo.");
      return;
    }

    const discountValue = Number(form.discountValue);
    const maxDiscount = form.maxDiscount === "" ? null : Number(form.maxDiscount);
    const minOrderAmount = Number(form.minOrderAmount);
    const usageLimit = Number(form.usageLimit);

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0 ||
      (form.discountType === "percentage" && discountValue > 100) ||
      (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) ||
      !Number.isFinite(minOrderAmount) ||
      minOrderAmount < 0 ||
      !Number.isInteger(usageLimit) ||
      usageLimit < 1
    ) {
      setError("Discount, minimum order, maximum discount ya usage limit check karo.");
      return;
    }

    setSaving(true);

    try {
      await createCoupon({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue,
        maxDiscount,
        minOrderAmount,
        expiryDate: expiry.toISOString(),
        usageLimit,
      });

      setMessage("Coupon successfully create ho gaya!");
      setForm((previous) => ({ ...previous, code: "" }));
      await loadCoupons();
    } catch (err) {
      setError(err.message || "Coupon create nahi ho saka.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Kya tum ye coupon delete karna chahte ho?")) return;

    setError("");
    setMessage("");

    try {
      await deleteCoupon(id);
      setMessage("Coupon delete ho gaya.");
      await loadCoupons();
    } catch (err) {
      setError(err.message || "Coupon delete nahi ho saka.");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #ded6d0",
    borderRadius: 8,
    boxSizing: "border-box",
    background: "#fff",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
  };

  return (
    <AdminLayout>
      <main style={{ flex: 1, minWidth: 0, padding: 28 }}>
        <h1 style={{ marginTop: 0 }}>Coupon Management</h1>
        <p style={{ color: "#766b64" }}>
          Create, view and manage QuickBite discount coupons.
        </p>

        {error && (
          <p role="alert" style={{ color: "#b42318" }}>{error}</p>
        )}
        {message && (
          <p role="status" style={{ color: "#16803c" }}>{message}</p>
        )}

        <section
          style={{
            background: "#fff",
            padding: 22,
            borderRadius: 14,
            border: "1px solid #eee3dc",
            marginTop: 22,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Create Coupon</h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 16,
              }}
            >
              <label>
                <span style={labelStyle}>Coupon code</span>
                <input
                  style={inputStyle}
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. SAVE10"
                  required
                />
              </label>

              <label>
                <span style={labelStyle}>Discount type</span>
                <select
                  style={inputStyle}
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed amount (₹)</option>
                </select>
              </label>

              <label>
                <span style={labelStyle}>Discount value</span>
                <input
                  style={inputStyle}
                  type="number"
                  name="discountValue"
                  min="1"
                  max={form.discountType === "percentage" ? 100 : undefined}
                  value={form.discountValue}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span style={labelStyle}>Maximum discount (₹, optional)</span>
                <input
                  style={inputStyle}
                  type="number"
                  name="maxDiscount"
                  min="0"
                  value={form.maxDiscount}
                  onChange={handleChange}
                  placeholder="No limit"
                />
              </label>

              <label>
                <span style={labelStyle}>Minimum order amount (₹)</span>
                <input
                  style={inputStyle}
                  type="number"
                  name="minOrderAmount"
                  min="0"
                  value={form.minOrderAmount}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span style={labelStyle}>Expiry date and time</span>
                <input
                  style={inputStyle}
                  type="datetime-local"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16)}
                  required
                />
              </label>

              <label>
                <span style={labelStyle}>Usage limit</span>
                <input
                  style={inputStyle}
                  type="number"
                  name="usageLimit"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: 20,
                padding: "12px 20px",
                border: 0,
                borderRadius: 9,
                background: "#ff6b35",
                color: "#fff",
                fontWeight: 700,
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Creating..." : "Create Coupon"}
            </button>
          </form>
        </section>

        <section style={{ marginTop: 30 }}>
          <h2>Existing Coupons</h2>

          {loading ? (
            <p>Loading coupons...</p>
          ) : coupons.length === 0 ? (
            <p>No coupons found. Create your first coupon above.</p>
          ) : (
            <div style={{ overflowX: "auto", background: "#fff", borderRadius: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
                <thead>
                  <tr style={{ background: "#f5eee9", textAlign: "left" }}>
                    <th style={{ padding: 12 }}>Code</th>
                    <th style={{ padding: 12 }}>Discount</th>
                    <th style={{ padding: 12 }}>Min. order</th>
                    <th style={{ padding: 12 }}>Expires</th>
                    <th style={{ padding: 12 }}>Usage</th>
                    <th style={{ padding: 12 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} style={{ borderTop: "1px solid #eee3dc" }}>
                      <td style={{ padding: 12, fontWeight: 700 }}>
                        {coupon.code}
                      </td>
                      <td style={{ padding: 12 }}>
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                        {coupon.maxDiscount != null && ` (max ₹${coupon.maxDiscount})`}
                      </td>
                      <td style={{ padding: 12 }}>₹{coupon.minOrderAmount}</td>
                      <td style={{ padding: 12 }}>
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 12 }}>
                        {coupon.usedCount}/{coupon.usageLimit}
                      </td>
                      <td style={{ padding: 12 }}>
                        <button
                          type="button"
                          onClick={() => handleDelete(coupon._id)}
                          style={{
                            padding: "8px 12px",
                            border: 0,
                            borderRadius: 7,
                            background: "#fee2e2",
                            color: "#b42318",
                            fontWeight: 600,
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}
