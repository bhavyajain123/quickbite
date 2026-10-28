
import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  MapPin,
  ChevronDown,
  UserRound,
  Sparkles,
  Bell,
} from "lucide-react";
import "../styles/Navbar.css";
import {
   getToken,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../api";
import "../styles/Navbar.css";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
 const [location, setLocation] = useState(
  () => localStorage.getItem("quickbite-city") || "Delhi NCR"
);
  const [locationSearch, setLocationSearch] = useState("");
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [notificationsOpen, setNotificationsOpen] = useState(false);
const [notificationError, setNotificationError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  

const [userName, setUserName] = useState(() => {
  try {
    const saved =
      localStorage.getItem("quickbite-demo-session") ||
      sessionStorage.getItem("quickbite-demo-session");

    if (saved) {
      const session = JSON.parse(saved);
      return session.name || session.fullName || "";
    }

    return "";
  } catch {
    return "";
  }
});

  const { cartCount } = useCart();

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Smart Combo", href: "/smart-combo" },
  { label: "Group Order", href: "/group-order" },
  { label: "AI Picks", href: "/ai-recommendations", special: true },
];

  const styles = {
    wrapper: {
      position: "sticky",
      top: 0,
      zIndex: 1000,
      background: "rgba(255,255,255,0.94)",
      backdropFilter: "blur(18px)",
      borderBottom: "1px solid #f0e9e4",
    },

    container: {
      maxWidth: 1240,
      minHeight: 82,
      margin: "0 auto",
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
    },

    logo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: "#24211f",
      textDecoration: "none",
      fontSize: 25,
      fontWeight: 800,
      letterSpacing: "-1.2px",
      whiteSpace: "nowrap",
    },

    logoIcon: {
      width: 40,
      height: 40,
      display: "grid",
      placeItems: "center",
      borderRadius: 13,
      background: "linear-gradient(135deg, #ff8655, #ff5b25)",
      color: "#fff",
      boxShadow: "0 6px 16px rgba(255,107,53,.24)",
    },

    accent: {
      color: "#ff6b35",
    },

    locationButton: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "10px 12px",
      border: "1px solid #f0e9e4",
      borderRadius: 12,
      background: "#fffaf7",
      color: "#292522",
      cursor: "pointer",
      textAlign: "left",
    },

    locationText: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
    },

    smallLabel: {
      fontSize: 10,
      color: "#8a817a",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".7px",
    },

    locationName: {
      fontSize: 13,
      fontWeight: 700,
    },

    navLinks: {
      display: "flex",
      alignItems: "center",
      gap: 28,
    },

    link: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "#625b56",
      textDecoration: "none",
      fontSize: 14,
      fontWeight: 700,
      transition: "color .2s ease",
    },

    aiLink: {
      color: "#e85a27",
    },

    actions: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },

    searchButton: {
      display: "grid",
      placeItems: "center",
      width: 43,
      height: 43,
      border: "1px solid #f0e9e4",
      borderRadius: 13,
      background: "#fff",
      color: "#292522",
      cursor: "pointer",
    },

    loginButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "12px 17px",
      border: "1px solid #f0e9e4",
      borderRadius: 12,
      background: "#fff",
      color: "#292522",
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 700,
      whiteSpace: "nowrap",
    },

    cartButton: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "12px 16px",
      border: "none",
      borderRadius: 12,
      background: "#ff6b35",
      color: "#fff",
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 800,
      whiteSpace: "nowrap",
      boxShadow: "0 6px 15px rgba(255,107,53,.2)",
    },

    count: {
      display: "grid",
      placeItems: "center",
      minWidth: 20,
      height: 20,
      padding: "0 5px",
      borderRadius: 20,
      background: "#fff",
      color: "#e95220",
      fontSize: 11,
    },

    menuButton: {
      display: "none",
      placeItems: "center",
      width: 42,
      height: 42,
      border: "1px solid #f0e9e4",
      borderRadius: 12,
      background: "#fff",
      color: "#292522",
      cursor: "pointer",
    },

    locationDropdown: {
      position: "absolute",
      top: "calc(100% + 10px)",
      left: 0,
      width: 220,
      padding: 8,
      border: "1px solid #f0e9e4",
      borderRadius: 14,
      background: "#fff",
      boxShadow: "0 14px 35px rgba(36,25,18,.12)",
    },

    locationOption: {
      display: "block",
      width: "100%",
      padding: "12px 10px",
      border: "none",
      borderRadius: 9,
      background: "#fff",
      color: "#292522",
      textAlign: "left",
      cursor: "pointer",
      fontSize: 13,
    },

    mobileMenu: {
      display: "none",
    },
  };

  const [hoveredLink, setHoveredLink] = useState("");

useEffect(() => {
  let active = true;

  async function loadNotifications() {
    if (!getToken()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const data = await getNotifications();

      if (active) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setNotificationError("");
      }
    } catch (error) {
      if (active) {
        setNotificationError(error.message || "Could not load notifications.");
      }
    }
  }

  loadNotifications();

  const interval = window.setInterval(loadNotifications, 30000);

  return () => {
    active = false;
    window.clearInterval(interval);
  };
}, []);

async function handleMarkRead(id) {
  try {
    await markNotificationRead(id);

    setNotifications((previous) =>
      previous.map((item) =>
        item._id === id ? { ...item, isRead: true } : item
      )
    );

    setUnreadCount((count) => Math.max(0, count - 1));
  } catch (error) {
    setNotificationError(error.message || "Could not update notification.");
  }
}

async function handleMarkAllRead() {
  try {
    await markAllNotificationsRead();

    setNotifications((previous) =>
      previous.map((item) => ({ ...item, isRead: true }))
    );

    setUnreadCount(0);
    setNotificationError("");
  } catch (error) {
    setNotificationError(error.message || "Could not mark all as read.");
  }
}

async function handleDeleteNotification(id) {
  try {
    const target = notifications.find((item) => item._id === id);

    await deleteNotification(id);

    setNotifications((previous) =>
      previous.filter((item) => item._id !== id)
    );

    if (target && !target.isRead) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }

    setNotificationError("");
  } catch (error) {
    setNotificationError(error.message || "Could not delete notification.");
  }
}

  const goToSearch = () => {
    window.location.href = "/search";
  };

  return (
    <header style={styles.wrapper}>
      <div style={styles.container}>
        <a href="/" style={styles.logo} aria-label="QuickBite home">
          <span style={styles.logoIcon}>Q</span>
          <span>
            QuickBite<span style={styles.accent}>.</span>
          </span>
        </a>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            style={styles.locationButton}
            onClick={() => setLocationOpen(!locationOpen)}
            aria-expanded={locationOpen}
          >
            <MapPin size={19} color="#ff6b35" />

            <span style={styles.locationText}>
              <span style={styles.smallLabel}>Delivering to</span>
              <span style={styles.locationName}>{location}</span>
            </span>

            <ChevronDown size={15} />
          </button>

          {locationOpen && (
            <div style={styles.locationDropdown}>
              <input
  type="text"
  placeholder="Search city..."
  value={locationSearch}
  onChange={(e) => setLocationSearch(e.target.value)}
  onClick={(e) => e.stopPropagation()}
  style={{
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #eee",
    borderRadius: 8,
    marginBottom: 8,
    outline: "none",
    fontSize: 13,
  }}
/>
              {["Delhi NCR", "Gurugram", "Noida", "Ghaziabad","Mumbai","Pune","Bengaluru","Hyderabad","Chennai","Kolkata","Jaipur","Lucknow","Chandigarh","Ahmedabad","Indore","Bhopal","Patna","Dehradun","Amritsar","Varanasi",].filter((city) =>
  city.toLowerCase().includes(locationSearch.trim().toLowerCase())
).map((city) => (
                  <button
                    key={city}
                    type="button"
                    style={{
                      ...styles.locationOption,
                      background:
                        location === city ? "#fff0e9" : "#fff",
                      color:
                        location === city ? "#e95220" : "#292522",
                      fontWeight: location === city ? 800 : 500,
                    }}
                   onClick={() => {
  setLocation(city);
  localStorage.setItem("quickbite-city", city);
  setLocationSearch("");
  setLocationOpen(false);
}}
                  >
                    <MapPin
                      size={14}
                      style={{
                        display: "inline",
                        marginRight: 8,
                      }}
                    />
                    {city}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <nav
  className="quickbite-desktop-nav"
  style={styles.navLinks}
  aria-label="Main navigation"
>
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                ...styles.link,
                ...(item.special ? styles.aiLink : {}),
                color:
                  hoveredLink === item.label
                    ? "#ff6b35"
                    : item.special
                      ? "#e85a27"
                      : "#625b56",
              }}
              onMouseEnter={() => setHoveredLink(item.label)}
              onMouseLeave={() => setHoveredLink("")}
            >
              {item.special && <Sparkles size={15} />}
              {item.label}
            </a>
          ))}
        </nav>

        <div style={styles.actions}>
          
<div style={{ position: "relative" }}>
  <button
    type="button"
    style={styles.searchButton}
    aria-label={`Notifications, ${unreadCount} unread`}
    onClick={() => setNotificationsOpen((open) => !open)}
  >
    <Bell size={19} />
    {unreadCount > 0 && (
      <span
        style={{
          position: "absolute",
          top: -5,
          right: -5,
          minWidth: 19,
          height: 19,
          padding: "0 4px",
          borderRadius: 20,
          background: "#e95220",
          color: "#fff",
          fontSize: 11,
          fontWeight: 800,
          display: "grid",
          placeItems: "center",
        }}
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    )}
  </button>

  {notificationsOpen && (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        right: 0,
        width: 320,
        maxWidth: "85vw",
        maxHeight: 420,
        overflowY: "auto",
        padding: 14,
        background: "#fff",
        border: "1px solid #f0e9e4",
        borderRadius: 14,
        boxShadow: "0 14px 35px rgba(36,25,18,.15)",
        zIndex: 1100,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <strong>Notifications</strong>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          style={{ border: 0, background: "transparent", color: "#e95220", cursor: "pointer" }}
        >
          Mark all read
        </button>
      </div>

      {notificationError && (
        <p role="alert" style={{ color: "#c33c3c", fontSize: 12 }}>
          {notificationError}
        </p>
      )}

      {notifications.length === 0 ? (
        <p style={{ color: "#81766f", fontSize: 13 }}>
          No notifications yet.
        </p>
      ) : (
        notifications.map((item) => (
          <div
            key={item._id}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #f0e9e4",
              opacity: item.isRead ? 0.7 : 1,
            }}
          >
            <strong style={{ fontSize: 13 }}>{item.title}</strong>
            <p style={{ margin: "5px 0", fontSize: 12, color: "#625b56" }}>
              {item.message}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {!item.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(item._id)}
                  style={{ border: 0, background: "transparent", color: "#e95220", cursor: "pointer", padding: 0, fontSize: 12 }}
                >
                  Mark read
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDeleteNotification(item._id)}
                style={{ border: 0, background: "transparent", color: "#81766f", cursor: "pointer", padding: 0, fontSize: 12 }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )}
</div>

<button
  type="button"
  className="quickbite-search"
  style={styles.searchButton}
  aria-label="Search food"
  onClick={goToSearch}
>
  <Search size={19} />
</button>

{isLoggedIn ? (

<a href="/profile" className="quickbite-login" style={styles.loginButton}>
  <UserRound size={17} />
  {userName || "My Account"}
</a>

) : (
 <a href="/login" className="quickbite-login" style={styles.loginButton}>
    <UserRound size={17} />
    Sign in
  </a>
)}

          <a href="/cart" style={styles.cartButton}>
            <ShoppingBag size={18} />
            Cart
            <span style={styles.count}>{cartCount}</span>
          </a>

          <button
  type="button"
  className="quickbite-menu"
  aria-label={menuOpen ? "Close menu" : "Open menu"}
  aria-expanded={menuOpen}
  style={{
    ...styles.menuButton,
    display: "none",
  }}
  onClick={() => setMenuOpen(!menuOpen)}
>
  {menuOpen ? <X size={22} /> : <Menu size={22} />}
</button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          style={{
            padding: "12px 24px 20px",
            borderTop: "1px solid #f0e9e4",
            background: "#fff",
          }}
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                display: "block",
                padding: "13px 0",
                color: "#292522",
                fontWeight: 700,
                textDecoration: "none",
                borderBottom: "1px solid #f5efeb",
              }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}

          <a
            href="/login"
            style={{
              display: "block",
              padding: "13px 0",
              color: "#e95220",
              fontWeight: 800,
              textDecoration: "none",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Sign in / Register
          </a>
        </nav>
      )}

      <style>{`
        @media (max-width: 1050px) {
          .quickbite-desktop-nav {
            gap: 16px;
          }
        }

        @media (max-width: 900px) {
          .quickbite-location {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .quickbite-desktop-nav,
          .quickbite-login,
          .quickbite-search {
            display: none !important;
          }

          .quickbite-menu {
            display: grid !important;
          }
        }
      `}</style>
    </header>
  );
}
