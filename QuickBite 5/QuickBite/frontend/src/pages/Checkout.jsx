import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getToken,
  getAddresses,
  addAddress,
  updateAddress,
  placeOrder,
  createPayment,
  confirmDummyUpi,
  validateCoupon,
} from "../api";

import { useCart } from "../context/CartContext";

import Navbar from "../components/Navbar";

import Footer from "../components/Footer";



function LocationPicker({ position, onPositionChange }) {
  function MapClickHandler() {
    useMapEvents({
      click(event) {
        onPositionChange([event.latlng.lat, event.latlng.lng]);
      },
    });

    return null;
  }

  return (
    <div style={{ height: 300, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}


async function getAddressFromCoordinates(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not find an address for this location.");
  }

  return response.json();
}



export default function Checkout() {

  const { cart, cartTotal, clearCart } = useCart();
  const [savedAddresses, setSavedAddresses] = useState([]);
const [selectedAddressId, setSelectedAddressId] = useState("");
const [addressLoading, setAddressLoading] = useState(false);
const [mapPosition, setMapPosition] = useState([28.6139, 77.2090]);

async function handleMapPositionChange(position) {
  setMapPosition(position);

  try {
    const result = await getAddressFromCoordinates(position[0], position[1]);
    const address = result.address || {};

    setForm((previous) => ({
      ...previous,
      address: result.display_name || previous.address,
      city:
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        previous.city,
      state: address.state || previous.state,
      pincode: address.postcode || previous.pincode,
    }));
  } catch (err) {
    setError("Could not fetch the address. You can enter it manually.");
  }
}

function handleUseCurrentLocation() {
  if (!navigator.geolocation) {
    setError("Your browser does not support location access.");
    return;
  }

  setError("");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      handleMapPositionChange([
        position.coords.latitude,
        position.coords.longitude,
      ]);
    },
    () => {
      setError(
        "Unable to get your location. Please allow location access or select it on the map."
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
}


  const [form, setForm] = useState({

    fullName: "",

    phone: "",

    email: "",

    address: "",

    city: "",
    state: "",

    pincode: "",

    instructions: "",

  });
  useEffect(() => {
  let active = true;

  async function loadSavedAddresses() {
    if (!getToken()) return;

    setAddressLoading(true);

    try {
      const result = await getAddresses();
      if (!active) return;

      const addresses = result.addresses || [];
      setSavedAddresses(addresses);

      const defaultAddress =
        addresses.find((address) => address.isDefault) || addresses[0];

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id || defaultAddress.id);

        setForm((previous) => ({
          ...previous,
          fullName: defaultAddress.fullName || previous.fullName,
          phone: defaultAddress.phone || previous.phone,
          address: defaultAddress.addressLine || previous.address,
          city: defaultAddress.city || previous.city,
          state: defaultAddress.state || previous.state,
          pincode: defaultAddress.pincode || previous.pincode,
          instructions: defaultAddress.landmark || previous.instructions,
        }));
      }
    } catch (err) {
      if (active) {
        setError(err.message || "Unable to load saved addresses.");
      }
    } finally {
      if (active) setAddressLoading(false);
    }
  }

  loadSavedAddresses();

  return () => {
    active = false;
  };
}, []);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
const [appliedCoupon, setAppliedCoupon] = useState("");
const [couponDiscount, setCouponDiscount] = useState(0);
const [couponMessage, setCouponMessage] = useState("");
const [couponLoading, setCouponLoading] = useState(false);

const deliveryFee = cart.length === 0 || cartTotal >= 300 ? 0 : 40;
const taxableSubtotal = Math.max(0, cartTotal - couponDiscount);
const tax = Math.round(taxableSubtotal * 0.05 * 100) / 100;
const grandTotal = taxableSubtotal + deliveryFee + tax;

  function handleChange(event) {

    const { name, value } = event.target;

    setForm((previous) => ({

      ...previous,

      [name]: value,

    }));

  }

async function handleApplyCoupon() {
  const code = couponCode.trim().toUpperCase();

  if (!code) {
    setCouponMessage("Please enter a coupon code.");
    return;
  }

  setCouponLoading(true);
  setCouponMessage("");

  try {
    const result = await validateCoupon(code, Number(cartTotal));

    setAppliedCoupon(code);
    setCouponDiscount(Number(result.discountAmount) || 0);
    setCouponCode(code);
    setCouponMessage(
      `Coupon applied! You saved ₹${Number(result.discountAmount) || 0}.`
    );
  } catch (err) {
    setAppliedCoupon("");
    setCouponDiscount(0);
    setCouponMessage(err.message || "Unable to apply coupon.");
  } finally {
    setCouponLoading(false);
  }
}

function handleRemoveCoupon() {
  setAppliedCoupon("");
  setCouponDiscount(0);
  setCouponCode("");
  setCouponMessage("Coupon removed.");
}

async function handleSubmit(event) {
  event.preventDefault();
  if (placing) return;
  setError("");

  if (!getToken()) {
    setError("Please log in before placing your order.");
    return;
  }

  if (cart.length === 0) {
    setError("Your cart is empty. Add some food before checkout.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    setError("Enter a valid 10-digit Indian mobile number.");
    return;
  }

  if (!/^\d{6}$/.test(form.pincode.trim())) {
    setError("Enter a valid 6-digit PIN code.");
    return;
  }

  let orderCreated = false;
  setPlacing(true);

  try {
    const addressPayload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      latitude:mapPosition[0],
      longitude:mapPosition[1],
      landmark: form.instructions.trim(),
      addressType: "home",
      isDefault: true,
    };
    console.log("Checkout address payload:", addressPayload);
console.log("Selected map position:", mapPosition);

    let addressId = selectedAddressId;

if (!addressId) {
  const addressResponse = await getAddresses();
  const addresses = addressResponse.addresses || [];

  const savedAddress = addresses.find(
    (address) =>
      address.fullName === addressPayload.fullName &&
      address.phone === addressPayload.phone &&
      address.addressLine === addressPayload.addressLine &&
      address.city === addressPayload.city &&
      address.state === addressPayload.state &&
      address.pincode === addressPayload.pincode
  );
if (savedAddress) {
  addressId = savedAddress._id || savedAddress.id;
  await updateAddress(addressId, {
    latitude: mapPosition[0],
    longitude: mapPosition[1],
  });
} else {
  const created = await addAddress({
    ...addressPayload,
    isDefault: addresses.length === 0,
  });
  addressId = created.address?._id || created.address?.id;
}
}

if (!addressId) {
  throw new Error("Delivery address could not be saved or selected.");
}
if(addressId){
  await updateAddress(addressId,{
    latitude:Number(mapPosition[0]),
    longitude:Number(mapPosition[1]),
  });
}

    if (!addressId) {
      throw new Error("Delivery address could not be found.");
    }

    const orderResponse = await placeOrder({
  addressId,
  couponCode: appliedCoupon || undefined,
});
    orderCreated = true;

    const order = orderResponse.order;
    const orderId = order?._id || order?.id;

    if (!orderId) {
      throw new Error(
        "Order was created, but its ID was not returned. Please check My Orders before trying again."
      );
    }

    const method = paymentMethod === "upi" ? "UPI" : "COD";
    const paymentResponse = await createPayment(orderId, method);
    const payment = paymentResponse.payment;

    if (method === "UPI") {
      if (!payment?._id) {
        throw new Error(
          "Order was created, but the demo payment ID was not returned. Please check My Orders before trying again."
        );
      }

      await confirmDummyUpi(payment._id);
    }

    window.location.href = "/order-success";
    } catch (err) {
    if (orderCreated) {
      setError(
        `Your order may already be placed, but payment setup failed: ${err.message}. Check My Orders before trying again to avoid creating a duplicate order.`
      );
    } else {
      setError(
        err.message || "Unable to place your order. Please try again."
      );
    }
  } finally {
    setPlacing(false);
  }
}


  if (cart.length === 0) {

    return (

      <div style={styles.page}>
        <style>{responsiveStyles}</style>

        <Navbar />

        <main style={styles.empty}>

          <div style={{ fontSize: 55 }}>🛒</div>

          <h1>Your cart is empty</h1>

          <p>Add your favourite dishes before proceeding to checkout.</p>

          <button

            type="button"

            style={styles.primaryButton}

            onClick={() => {

              window.location.href = "/";

            }}

          >

            Explore food →

          </button>

        </main>

        <Footer />

      </div>

    );

  }

  return (

    <div style={styles.page}>
        <style>{responsiveStyles}</style>

      <Navbar />

      <main style={styles.container}>

        <p style={styles.eyebrow}>ALMOST THERE!</p>

        <h1 style={styles.title}>Checkout</h1>

        <p style={styles.subtitle}>

          Just a few details, and your order will be ready.

        </p>

        <form onSubmit={handleSubmit}>

          <div className="checkout-layout" style={styles.layout}>

            <div style={styles.leftColumn}>

              <section style={styles.panel}>

                <div style={styles.sectionHeading}>

                  <span style={styles.step}>1</span>

                  <div>

                    <h2>Delivery details</h2>

                    <p>Where should we deliver your food?</p>
                    {getToken() && (
  <div style={{ marginBottom: 20 }}>
    <label
      htmlFor="saved-address"
      style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
    >
      Choose a saved address
    </label>

    <select
      id="saved-address"
      value={selectedAddressId}
      disabled={addressLoading || savedAddresses.length === 0}
      onChange={(event) => {
       
const id = event.target.value;
setSelectedAddressId(id);

const address = savedAddresses.find(
  (item) => (item._id || item.id) === id
);

if (!address) return;

if (
  typeof address.latitude === "number" &&
  typeof address.longitude === "number"
) {
  setMapPosition([address.latitude, address.longitude]);
}


        if (!address) return;

        setForm((previous) => ({
          ...previous,
          fullName: address.fullName || "",
          phone: address.phone || "",
          address: address.addressLine || "",
          city: address.city || "",
          state: address.state || "",
          pincode: address.pincode || "",
          instructions: address.landmark || "",
        }));
      }}
      style={styles.input}
    >
      <option value="">
        {addressLoading ? "Loading addresses..." : "Enter a new address"}
      </option>

      {savedAddresses.map((address) => (
        <option
          key={address._id || address.id}
          value={address._id || address.id}
        >
          {address.addressType || "home"} — {address.addressLine},{" "}
          {address.city} {address.pincode}
          {address.isDefault ? " (Default)" : ""}
        </option>
      ))}
    </select>

    <p style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
      You can select a saved address or enter different delivery details below.
    </p>
  </div>
)}


<div style={{ marginBottom: 20 }}>
  <h3 style={{ marginBottom: 8 }}>Choose your delivery location</h3>

  <p style={{ fontSize: 13, color: "#777", marginBottom: 12 }}>
    Click on the map to select your delivery location.
  </p>

  <LocationPicker
    position={mapPosition}
    onPositionChange={handleMapPositionChange}
  />
  
<button
  type="button"
  onClick={handleUseCurrentLocation}
  style={{
    marginTop: 12,
    padding: "11px 16px",
    border: "1px solid #ff6b35",
    borderRadius: 10,
    background: "#fff",
    color: "#e95220",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  📍 Use My Current Location
</button>


  <p style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
    Selected coordinates: {mapPosition[0].toFixed(5)},{" "}
    {mapPosition[1].toFixed(5)}
  </p>
</div>


                  </div>

                </div>

                <div className="checkout-form-grid" style={styles.formGrid}>

                  <label style={styles.field}>

                    Full name *

                    <input

                      name="fullName"

                      value={form.fullName}

                      onChange={handleChange}

                      placeholder="Enter your full name"

                      autoComplete="name"

                      required

                      maxLength={100}

                      style={styles.input}

                    />

                  </label>

                  <label style={styles.field}>

                    Phone number *

                    <input

                      name="phone"

                      value={form.phone}

                      onChange={handleChange}

                      placeholder="10-digit mobile number"

                      type="tel"

                      inputMode="numeric"

                      autoComplete="tel"

                      maxLength={10}

                      required

                      style={styles.input}

                    />

                  </label>

                  <label style={styles.field}>

                    Email address

                    <input

                      name="email"

                      value={form.email}

                      onChange={handleChange}

                      placeholder="you@example.com"

                      type="email"

                      autoComplete="email"

                      style={styles.input}

                    />

                  </label>

                  <label style={styles.field}>

                    PIN code *

                    <input

                      name="pincode"

                      value={form.pincode}

                      onChange={handleChange}

                      placeholder="6-digit PIN code"

                      inputMode="numeric"

                      maxLength={6}

                      required

                      style={styles.input}

                    />

                  </label>

                  <label style={{ ...styles.field, gridColumn: "1 / -1" }}>

                    Complete delivery address *

                    <textarea

                      name="address"

                      value={form.address}

                      onChange={handleChange}

                      placeholder="House / flat number, street, locality..."

                      autoComplete="street-address"

                      rows={3}

                      required

                      maxLength={500}

                      style={styles.textarea}

                    />

                  </label>

                  <label style={styles.field}>

                    City *

                    <input

                      name="city"

                      value={form.city}

                      onChange={handleChange}

                      placeholder="Enter your city"

                      autoComplete="address-level2"

                      required

                      style={styles.input}

                    />

                  </label>

                  <label style={styles.field}>
  State *
  <input
    name="state"
    value={form.state}
    onChange={handleChange}
    placeholder="Enter your state"
    autoComplete="address-level1"
    required
    style={styles.input}
  />
</label>

                  <label style={styles.field}>

                    Delivery instructions

                    <input

                      name="instructions"

                      value={form.instructions}

                      onChange={handleChange}

                      placeholder="Landmark, gate details, etc."

                      maxLength={200}

                      style={styles.input}

                    />

                  </label>

                </div>

              </section>

              <section style={styles.panel}>

                <div style={styles.sectionHeading}>

                  <span style={styles.step}>2</span>

                  <div>

                    <h2>Payment method</h2>

                    <p>Choose how you would like to pay.</p>

                  </div>

                </div>

                <label

                  style={{

                    ...styles.paymentOption,

                    ...(paymentMethod === "cod"

                      ? styles.selectedPayment

                      : {}),

                  }}

                >

                  <input

                    type="radio"

                    name="paymentMethod"

                    value="cod"

                    checked={paymentMethod === "cod"}

                    onChange={(event) =>

                      setPaymentMethod(event.target.value)

                    }

                  />

                  <span style={{ fontSize: 25 }}>💵</span>

                  <span style={{ flex: 1 }}>

                    <strong>Cash on Delivery</strong>

                    <small>Pay when your order arrives</small>

                  </span>

                  <span>✓</span>

                </label>

                <label

                  style={{

                    ...styles.paymentOption,

                    ...(paymentMethod === "upi"

                      ? styles.selectedPayment

                      : {}),

                  }}

                >

                  <input

                    type="radio"

                    name="paymentMethod"

                    value="upi"

                    checked={paymentMethod === "upi"}

                    onChange={(event) =>

                      setPaymentMethod(event.target.value)

                    }

                  />

                  <span style={{ fontSize: 25 }}>📱</span>

                  <span style={{ flex: 1 }}>

                    <strong>UPI — Demo option</strong>

                    <small>

                      Demo only; no real payment will be collected.

                    </small>

                  </span>

                  <span>✓</span>

                </label>

              </section>

            </div>

            <aside style={styles.summary}>

              <h2>Order summary</h2>

              <p style={styles.summarySubtitle}>

                {cart.reduce((sum, item) => sum + item.quantity, 0)} items in

                your order

              </p>

              <div style={styles.itemsList}>

                {cart.map((item) => (

                  <div key={item.id} style={styles.orderItem}>

                    <div style={styles.itemInfo}>

                      <strong>{item.name}</strong>

                      <small>

                        Qty: {item.quantity} × ₹{item.price}

                      </small>

                    </div>

                    <strong>₹{item.price * item.quantity}</strong>

                  </div>

                ))}

              </div>
                           
<div style={{ margin: "18px 0" }}>
  <h3 style={{ marginBottom: 10 }}>Have a coupon?</h3>

  <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
    <input
      type="text"
      value={couponCode}
      onChange={(event) =>
        setCouponCode(event.target.value.toUpperCase())
      }
      placeholder="Enter coupon code"
      disabled={Boolean(appliedCoupon) || couponLoading}
      style={{
        flex: "1 1 0",
        width: 0,
        minWidth: 0,
        boxSizing: "border-box",
        padding: "13px 12px",
        border: "1px solid #ded6d0",
        borderRadius: 10,
        fontSize: 14,
      }}
    />

    {appliedCoupon ? (
      <button
        type="button"
        onClick={handleRemoveCoupon}
        style={{
          flexShrink: 0,
          padding: "0 12px",
          border: 0,
          background: "transparent",
          color: "#e85b2a",
          fontWeight: 700,
        }}
      >
        Remove
      </button>
    ) : (
      <button
        type="button"
        onClick={handleApplyCoupon}
        disabled={couponLoading}
        style={{
          flexShrink: 0,
          padding: "0 18px",
          border: 0,
          borderRadius: 10,
          background: "#ff6b35",
          color: "#fff",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {couponLoading ? "Applying..." : "Apply"}
      </button>
    )}
  </div>

  {couponMessage && (
    <p
      role="status"
      style={{
        color: appliedCoupon ? "#16803c" : "#c33c3c",
        fontSize: 13,
        marginTop: 8,
      }}
    >
      {couponMessage}
    </p>
  )}
</div>


              <div style={styles.summaryLine}>

                <span>Subtotal</span>

                <span>₹{cartTotal}</span>

              </div>

              <div style={styles.summaryLine}>

                <span>Delivery fee</span>

                <span>

                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}

                </span>

              </div>

              <div style={styles.summaryLine}>

                <span>Estimated tax (5%)</span>

                <span>₹{tax}</span>

              </div>

              <div style={styles.divider} />

              <div style={styles.totalLine}>

                <span>Total payable</span>

                <strong>₹{grandTotal}</strong>

              </div>

              {error && (

                <p role="alert" style={styles.error}>

                  {error}

                </p>

              )}

<button
  type="submit"
  disabled={placing}
  style={{
    ...styles.primaryButton,
    opacity: placing ? 0.6 : 1,
    cursor: placing ? "not-allowed" : "pointer",
  }}
>
  {placing ? "Placing order..." : `Place order · ₹${grandTotal}`}
</button>

              <p style={styles.disclaimer}>

                This is a frontend demo. Orders are saved in this browser's

                local storage, not sent to a real restaurant.

              </p>

              <button

                type="button"

                style={styles.backLink}

                onClick={() => {

                  window.location.href = "/cart";

                }}

              >

                ← Back to cart

              </button>

            </aside>

          </div>

        </form>

      </main>

      <Footer />

    </div>

  );

}


const responsiveStyles = `
  * { box-sizing: border-box; }
  .checkout-layout { grid-template-columns: minmax(0, 1.55fr) minmax(300px, .85fr) !important; }
  .checkout-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .checkout-layout input, .checkout-layout textarea { box-sizing: border-box; }
  @media (max-width: 850px) {
    .checkout-layout { grid-template-columns: minmax(0, 1fr) !important; }
    .checkout-layout aside { position: static !important; }
  }
  @media (max-width: 560px) {
    .checkout-form-grid { grid-template-columns: minmax(0, 1fr) !important; }
    .checkout-layout section { padding: 18px !important; }
    .checkout-layout aside { padding: 18px !important; }
  }
`;

const styles = {

  page: {

    minHeight: "100vh",

    background: "#fffdfb",

    color: "#29231f",

    fontFamily: "'DM Sans', sans-serif",

  },

  container: {

    width: "min(1180px, 92%)",

    margin: "0 auto",

    padding: "45px 0 75px",

  },

  eyebrow: {

    color: "#ff6b35",

    fontSize: 10,

    fontWeight: 800,

    letterSpacing: 1.8,

  },

  title: {

    fontSize: "clamp(32px, 4vw, 44px)",

    letterSpacing: -1.5,

    margin: "10px 0",

  },

  subtitle: {

    color: "#81766f",

    fontSize: 14,

    marginBottom: 30,

  },

  layout: {

    display: "grid",

    gridTemplateColumns: "minmax(0, 1.5fr) minmax(280px, .85fr)",

    alignItems: "start",

    gap: 24,

  },

  leftColumn: {

    display: "grid",

    gap: 20,

  },

  panel: {

    padding: 25,

    border: "1px solid #eee5de",

    borderRadius: 19,

    background: "#fff",

  },

  sectionHeading: {

    display: "flex",

    alignItems: "center",

    gap: 13,

    marginBottom: 24,

  },

  step: {

    display: "grid",

    placeItems: "center",

    width: 36,

    height: 36,

    flexShrink: 0,

    borderRadius: 11,

    background: "#fff0e7",

    color: "#e95220",

    fontWeight: 800,

  },

  formGrid: {

    display: "grid",

    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",

    gap: 18,

  },

  field: {

    display: "flex",

    flexDirection: "column",

    gap: 8,

    fontSize: 12,

    fontWeight: 700,

    color: "#554c46",

  },

  input: {

    width: "100%",

    minWidth: 0,

    padding: "13px",

    border: "1px solid #e9ded5",

    borderRadius: 10,

    outlineColor: "#ff6b35",

    background: "#fffdfb",

    fontSize: 13,

    color: "#29231f",

  },

  textarea: {

    width: "100%",

    resize: "vertical",

    padding: "13px",

    border: "1px solid #e9ded5",

    borderRadius: 10,

    outlineColor: "#ff6b35",

    background: "#fffdfb",

    font: "13px 'DM Sans', sans-serif",

  },

  paymentOption: {

    display: "flex",

    alignItems: "center",

    gap: 13,

    padding: 16,

    marginTop: 12,

    border: "1px solid #eee5de",

    borderRadius: 13,

    cursor: "pointer",

  },

  selectedPayment: {

    borderColor: "#ff9b70",

    background: "#fff7f2",

  },

  summary: {

    padding: 24,

    border: "1px solid #eee5de",

    borderRadius: 19,

    background: "#fff",

    position: "sticky",

    top: 20,

  },

  summarySubtitle: {

    color: "#81766f",

    fontSize: 12,

    marginBottom: 20,

  },

  itemsList: {

    display: "grid",

    gap: 16,

    marginBottom: 22,

  },

  orderItem: {

    display: "flex",

    justifyContent: "space-between",

    alignItems: "start",

    gap: 12,

    fontSize: 12,

  },

  itemInfo: {

    display: "grid",

    gap: 5,

  },

  summaryLine: {

    display: "flex",

    justifyContent: "space-between",

    gap: 10,

    margin: "17px 0",

    color: "#756b65",

    fontSize: 13,

  },

  divider: {

    borderTop: "1px dashed #e5dcd5",

    margin: "22px 0",

  },

  totalLine: {

    display: "flex",

    justifyContent: "space-between",

    gap: 10,

    marginBottom: 22,

    fontSize: 16,

  },

  primaryButton: {

    display: "block",

    width: "100%",

    padding: 15,

    border: 0,

    borderRadius: 11,

    background: "#ff6b35",

    color: "#fff",

    fontWeight: 800,

    cursor: "pointer",

    textAlign: "center",

  },

  disclaimer: {

    color: "#81766f",

    fontSize: 11,

    lineHeight: 1.7,

    marginTop: 15,

  },

  error: {

    padding: 12,

    borderRadius: 10,

    background: "#fff0f0",

    color: "#bd3030",

    fontSize: 12,

    lineHeight: 1.6,

  },

  backLink: {

    display: "block",

    margin: "17px auto 0",

    border: 0,

    background: "transparent",

    color: "#e95220",

    fontSize: 12,

    fontWeight: 700,

    cursor: "pointer",

  },

  empty: {

    maxWidth: 650,

    margin: "0 auto",

    padding: "75px 20px",

    textAlign: "center",

  },

};
