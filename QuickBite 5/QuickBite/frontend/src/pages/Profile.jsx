
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getMyProfile,
  updateMyProfile,
  getToken,
  clearToken,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../api";

const emptyProfile = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [activeTab, setActiveTab] = useState("personal");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState([]);
const [addressLoading, setAddressLoading] = useState(false);
const [addressSaving, setAddressSaving] = useState(false);
const [editingAddressId, setEditingAddressId] = useState(null);

const [addressForm, setAddressForm] = useState({
  fullName: "",
  phone: "",
  addressLine: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  addressType: "home",
  isDefault: false,
});


useEffect(() => {
  let active = true;

  async function loadProfile() {
    if (!getToken()) {
      setError("Please sign in to view your profile.");
      return;
    }

    try {
      const data = await getMyProfile();

      if (!active) return;

      const user = data.user || {};

      setProfile({
        ...emptyProfile,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    } catch (err) {
      if (active) {
        setError(err.message || "Unable to load your profile.");
      }
    }
  }

  loadProfile();

  return () => {
    active = false;
  };
}, []);

useEffect(() => {
  if (activeTab === "address" && getToken()) {
    loadAddresses();
  }
}, [activeTab]);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function loadAddresses() {
  setAddressLoading(true);
  setError("");

  try {
    const data = await getAddresses();
    setAddresses(data.addresses || []);
  } catch (err) {
    setError(err.message || "Unable to load delivery addresses.");
  } finally {
    setAddressLoading(false);
  }
}

function handleAddressChange(event) {
  const { name, value, type, checked } = event.target;

  setAddressForm((previous) => ({
    ...previous,
    [name]: type === "checkbox" ? checked : value,
  }));

  setMessage("");
  setError("");
}

function resetAddressForm() {
  setEditingAddressId(null);
  setAddressForm({
    fullName: profile.fullName || "",
    phone: profile.phone || "",
    addressLine: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "home",
    isDefault: addresses.length === 0,
  });
}

function handleEditAddress(address) {
  setEditingAddressId(address._id);

  setAddressForm({
    fullName: address.fullName || "",
    phone: address.phone || "",
    addressLine: address.addressLine || "",
    landmark: address.landmark || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    addressType: address.addressType || "home",
    isDefault: Boolean(address.isDefault),
  });

  setMessage("");
  setError("");
}
async function handleAddressSave(event) {
  event.preventDefault();
  setMessage("");
  setError("");

  if (!addressForm.fullName.trim()) {
    setError("Please enter the recipient's name.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(addressForm.phone.trim())) {
    setError("Please enter a valid 10-digit mobile number.");
    return;
  }

  if (!addressForm.addressLine.trim()) {
    setError("Please enter your house number, street and area.");
    return;
  }

  if (
    !addressForm.city.trim() ||
    !addressForm.state.trim() ||
    !/^\d{6}$/.test(addressForm.pincode.trim())
  ) {
    setError("Please enter your city, state and valid 6-digit PIN code.");
    return;
  }

  setAddressSaving(true);

  try {
    const body = {
      ...addressForm,
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      addressLine: addressForm.addressLine.trim(),
      landmark: addressForm.landmark.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
    };

    if (editingAddressId) {
      await updateAddress(editingAddressId, body);
      setMessage("Address updated successfully!");
    } else {
      await addAddress(body);
      setMessage("Address added successfully!");
    }

    await loadAddresses();
    resetAddressForm();
  } catch (err) {
    setError(err.message || "Unable to save address.");
  } finally {
    setAddressSaving(false);
  }
}

async function handleDeleteAddress(id) {
  if (!window.confirm("Are you sure you want to delete this address?")) {
    return;
  }

  setError("");
  setMessage("");

  try {
    await deleteAddress(id);
    setMessage("Address deleted successfully!");

    if (editingAddressId === id) {
      resetAddressForm();
    }

    await loadAddresses();
  } catch (err) {
    setError(err.message || "Unable to delete address.");
  }
}

async function handleSetDefaultAddress(id) {
  setError("");
  setMessage("");

  try {
    await setDefaultAddress(id);
    await loadAddresses();
    setMessage("Default delivery address updated!");
  } catch (err) {
    setError(err.message || "Unable to set default address.");
  }
}

  
async function handleSave(event) {
  event.preventDefault();
  setMessage("");
  setError("");

  if (!profile.fullName.trim()) {
    setError("Please enter your full name.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    setError("Please enter a valid email address.");
    return;
  }

  if (profile.phone && !/^[6-9]\d{9}$/.test(profile.phone.trim())) {
    setError("Please enter a valid 10-digit mobile number.");
    return;
  }

  if (
    profile.pincode &&
    !/^[1-9]\d{5}$/.test(profile.pincode.trim())
  ) {
    setError("Please enter a valid 6-digit PIN code.");
    return;
  }

  try {
    const data = await updateMyProfile({
      name: profile.fullName.trim(),
      email: profile.email.trim().toLowerCase(),
      phone:profile.phone.trim(),
    });

    const user = data.user || {};

    setProfile((previous) => ({
      ...previous,
      fullName: user.name || profile.fullName.trim(),
      email: user.email || profile.email.trim().toLowerCase(),
      phone:user.phone|| "",
    }));

    setMessage("Your profile has been updated successfully!");
  } catch (err) {
    setError(err.message || "Unable to save your profile.");
  }
}


 function handleLogout() {
  clearToken();
  localStorage.removeItem("quickbite-demo-session");
  sessionStorage.removeItem("quickbite-demo-session");
  window.location.href = "/login";
}

const displayName = profile?.name||profile?.fullName || "";
const initials = displayName
  ? displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  : "QB";

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.heading}>
          <div>
            <p style={styles.eyebrow}>YOUR ACCOUNT</p>
            <h1>{displayName ? `${displayName}'s Profile` : "My Profile"}</h1>
            <p style={styles.subtitle}>
              Manage your personal information and delivery details.
            </p>
          </div>

          <a href="/" style={styles.backLink}>
            ← Back to home
          </a>
        </div>

        <div style={styles.layout}>
          <aside style={styles.sidebar}>
            <div style={styles.userCard}>
              <div style={styles.avatar}>{initials}</div>

              <h2>{displayName || "Food Lover"}</h2>

              <p>{profile.email || "Add your email address"}</p>

              <span style={styles.memberBadge}>QuickBite Member</span>
            </div>

            <nav style={styles.nav}>
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                style={{
                  ...styles.navButton,
                  ...(activeTab === "personal"
                    ? styles.activeNavButton
                    : {}),
                }}
              >
                <span>👤</span> Personal information
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("address")}
                style={{
                  ...styles.navButton,
                  ...(activeTab === "address"
                    ? styles.activeNavButton
                    : {}),
                }}
              >
                <span>📍</span> Delivery address
              </button>

              <a href="/my-orders" style={styles.navLink}>
                <span>📦</span> My orders
              </a>

              <a href="/wishlist" style={styles.navLink}>
                <span>❤️</span> My wishlist
              </a>

              <div style={styles.navDivider} />

              <button
                type="button"
                onClick={handleLogout}
                style={styles.logoutButton}
              >
                <span>↪</span> Sign out
              </button>
            </nav>
          </aside>

          <section style={styles.content}>
            {activeTab === "personal" && (
              <>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2>Personal information</h2>
                    <p>
                      Update the details associated with your account.
                    </p>
                  </div>
                  <span style={styles.sectionIcon}>👤</span>
                </div>

                <form onSubmit={handleSave}>
                  <div style={styles.formGrid}>
                    <div style={styles.field}>
                      <label htmlFor="profile-name">Full name</label>
                      <input
                        id="profile-name"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        maxLength={100}
                        required
                      />
                    </div>

                    <div style={styles.field}>
                      <label htmlFor="profile-email">Email address</label>
                      <input
                        id="profile-email"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        maxLength={254}
                        required
                      />
                    </div>

                    <div style={styles.field}>
                      <label htmlFor="profile-phone">Mobile number</label>
                      <input
                        id="profile-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div style={styles.infoBox}>
                    <span>ℹ️</span>
                    <p>
                      Your information helps us manage your orders and
                      delivery details. Keep your contact details up to
                      date.
                    </p>
                  </div>

                  <div style={styles.actions}>
                    <button type="submit" style={styles.saveButton}>
                      Save changes →
                    </button>
                  </div>
                </form>
              </>
            )}

            
{activeTab === "address" && (
  <>
    <div style={styles.sectionHeader}>
      <div>
        <h2>Delivery address</h2>
        <p>Save and manage your delivery locations.</p>
      </div>
      <span style={styles.sectionIcon}>📍</span>
    </div>

    <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
      <h3>Saved addresses</h3>

      {addressLoading && <p>Loading addresses...</p>}

      {!addressLoading && addresses.length === 0 && (
        <p>No saved addresses yet. Add your first address below.</p>
      )}

      {addresses.map((address) => (
        <div
          key={address._id}
          style={{
            border: "1px solid #f0e6df",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <strong>
              {address.fullName} · {address.addressType}
            </strong>

            {address.isDefault && (
              <span style={{ color: "#23783a", fontWeight: 800 }}>
                Default address
              </span>
            )}
          </div>

          <p style={{ lineHeight: 1.6 }}>
            {address.addressLine}
            {address.landmark ? `, ${address.landmark}` : ""}
            {`, ${address.city}, ${address.state} - ${address.pincode}`}
          </p>

          <p>Phone: {address.phone}</p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              style={styles.saveButton}
              onClick={() => handleEditAddress(address)}
            >
              Edit
            </button>

            {!address.isDefault && (
              <button
                type="button"
                style={styles.saveButton}
                onClick={() => handleSetDefaultAddress(address._id)}
              >
                Set default
              </button>
            )}

            <button
              type="button"
              style={{
                ...styles.saveButton,
                background: "#fff0f0",
                color: "#bd3030",
              }}
              onClick={() => handleDeleteAddress(address._id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>

    <div style={styles.sectionHeader}>
      <div>
        <h3>{editingAddressId ? "Edit address" : "Add a new address"}</h3>
        <p>Enter the details required for delivery.</p>
      </div>
    </div>

    <form onSubmit={handleAddressSave}>
      <div style={styles.formGrid}>
        <div style={styles.field}>
          <label htmlFor="address-fullName">Recipient name</label>
          <input
            id="address-fullName"
            name="fullName"
            value={addressForm.fullName}
            onChange={handleAddressChange}
            required
            maxLength={100}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="address-phone">Mobile number</label>
          <input
            id="address-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            value={addressForm.phone}
            onChange={handleAddressChange}
            required
            maxLength={10}
          />
        </div>

        <div style={{ ...styles.field, ...styles.fullWidth }}>
          <label htmlFor="address-line">House number, street and area</label>
          <textarea
            id="address-line"
            name="addressLine"
            value={addressForm.addressLine}
            onChange={handleAddressChange}
            required
            rows={3}
            maxLength={300}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="address-landmark">Landmark (optional)</label>
          <input
            id="address-landmark"
            name="landmark"
            value={addressForm.landmark}
            onChange={handleAddressChange}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="address-city">City</label>
          <input
            id="address-city"
            name="city"
            value={addressForm.city}
            onChange={handleAddressChange}
            required
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="address-state">State</label>
          <input
            id="address-state"
            name="state"
            value={addressForm.state}
            onChange={handleAddressChange}
            required
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="address-pincode">PIN code</label>
          <input
            id="address-pincode"
            name="pincode"
            inputMode="numeric"
            value={addressForm.pincode}
            onChange={handleAddressChange}
            required
            maxLength={6}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="address-type">Address type</label>
          <select
            id="address-type"
            name="addressType"
            value={addressForm.addressType}
            onChange={handleAddressChange}
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="isDefault"
            checked={addressForm.isDefault}
            onChange={handleAddressChange}
          />
          Set as default address
        </label>
      </div>

      <div style={styles.actions}>
        {editingAddressId && (
          <button
            type="button"
            style={{ ...styles.saveButton, background: "#82766e" }}
            onClick={resetAddressForm}
          >
            Cancel edit
          </button>
        )}

        <button
          type="submit"
          style={styles.saveButton}
          disabled={addressSaving}
        >
          {addressSaving
            ? "Saving..."
            : editingAddressId
              ? "Update address"
              : "Save address"}
        </button>
      </div>
    </form>
  </>
)}


            {error && (
              <p role="alert" style={styles.errorMessage}>
                {error}
              </p>
            )}

            {message && (
              <p role="status" style={styles.successMessage}>
                ✓ {message}
              </p>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fffaf6",
    color: "#29231f",
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "45px 24px 70px",
  },
  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 30,
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "#f06432",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.5,
  },
  subtitle: {
    marginTop: 8,
    color: "#82766e",
    fontSize: 14,
    lineHeight: 1.6,
  },
  backLink: {
    color: "#e85b2a",
    fontSize: 13,
    fontWeight: 800,
    textDecoration: "none",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(230px, 0.72fr) minmax(0, 1.8fr)",
    alignItems: "start",
    gap: 24,
  },
  sidebar: {
    overflow: "hidden",
    border: "1px solid #f0e6df",
    borderRadius: 18,
    background: "#fff",
  },
  userCard: {
    padding: "30px 18px 24px",
    borderBottom: "1px solid #f1e8e2",
    textAlign: "center",
  },
  avatar: {
    display: "grid",
    placeItems: "center",
    width: 76,
    height: 76,
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#ffeadf",
    color: "#e85b2a",
    fontSize: 25,
    fontWeight: 900,
  },
  memberBadge: {
    display: "inline-block",
    marginTop: 10,
    padding: "6px 10px",
    borderRadius: 20,
    background: "#fff0e6",
    color: "#d85b2b",
    fontSize: 10,
    fontWeight: 800,
  },
  nav: {
    display: "grid",
    gap: 5,
    padding: 13,
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    width: "100%",
    padding: "13px 12px",
    border: 0,
    borderRadius: 9,
    background: "transparent",
    color: "#655a53",
    fontSize: 12,
    textAlign: "left",
    cursor: "pointer",
  },
  activeNavButton: {
    background: "#fff0e6",
    color: "#e85b2a",
    fontWeight: 900,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "13px 12px",
    borderRadius: 9,
    color: "#655a53",
    fontSize: 12,
    textDecoration: "none",
  },
  navDivider: {
    height: 1,
    margin: "8px 0",
    background: "#f1e8e2",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "13px 12px",
    border: 0,
    borderRadius: 9,
    background: "transparent",
    color: "#c53f3f",
    fontSize: 12,
    textAlign: "left",
    cursor: "pointer",
  },
  content: {
    minWidth: 0,
    padding: "30px clamp(18px, 3vw, 36px)",
    border: "1px solid #f0e6df",
    borderRadius: 18,
    background: "#fff",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    paddingBottom: 24,
    marginBottom: 27,
    borderBottom: "1px solid #f1e8e2",
  },
  sectionIcon: {
    display: "grid",
    placeItems: "center",
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 12,
    background: "#fff0e6",
    fontSize: 20,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "22px 18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
    minWidth: 0,
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 11,
    padding: 15,
    marginTop: 28,
    borderRadius: 11,
    background: "#fff8f1",
    color: "#75685f",
    fontSize: 12,
    lineHeight: 1.7,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 26,
  },
  saveButton: {
    padding: "13px 21px",
    border: 0,
    borderRadius: 10,
    background: "#ff6b35",
    color: "#fff",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  errorMessage: {
    padding: 12,
    borderRadius: 9,
    background: "#fff0f0",
    color: "#bd3030",
    fontSize: 12,
  },
  successMessage: {
    padding: 12,
    borderRadius: 9,
    background: "#edf9ef",
    color: "#23783a",
    fontSize: 12,
  },
};


Object.assign(styles.field, {});
