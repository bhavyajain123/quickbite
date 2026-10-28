
import React from "react";

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: "📊" },
  { label: "Manage Foods", path: "/admin/foods", icon: "🍔" },
  { label: "Restaurants", path: "/admin/restaurants", icon: "🍽️" },
  { label: "Orders", path: "/admin/orders", icon: "📦" },
  { label: "Users", path: "/admin/users", icon: "👥" },
  { label: "Coupons", path: "/admin/coupons", icon: "🎟️" },
  { label: "Inventory", path: "/admin/inventory", icon: "📦" },
  { label: "Deliveries", path: "/admin/deliveries", icon: "🚚" },
  { label: "Review Analytics", path: "/admin/review-analytics", icon: "📊" },
];

export default function AdminLayout({ children }) {
  const currentPath = window.location.pathname;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#fffaf6",
        color: "#29231f",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <aside
        style={{
          width: 230,
          background: "#29231f",
          color: "#fff",
          padding: 24,
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <h2 style={{ color: "#ff8052", marginBottom: 8 }}>
          QuickBite
        </h2>

        <p style={{ color: "#bdb3ac", fontSize: 12, marginBottom: 35 }}>
          ADMIN PANEL
        </p>

        <nav style={{ display: "grid", gap: 10 }}>
          {menuItems.map((item) => {
            const active =
              item.path === "/admin"
                ? currentPath === "/admin"
                : currentPath.startsWith(item.path);

            return (
              <a
                key={item.path}
                href={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: active ? "#ff6b35" : "transparent",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <a
          href="/"
          style={{
            display: "block",
            marginTop: 40,
            color: "#ffb596",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← Back to website
        </a>
      </aside>

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: 30,
          boxSizing: "border-box",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 15,
            flexWrap: "wrap",
            borderBottom: "1px solid #eee0d6",
            paddingBottom: 20,
            marginBottom: 28,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 25 }}>
              Admin Workspace
            </h1>
            <p style={{ color: "#81766f", fontSize: 13 }}>
              Manage your QuickBite food delivery platform.
            </p>
          </div>

          <a
            href="/"
            style={{
              padding: "10px 16px",
              borderRadius: 9,
              background: "#ff6b35",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            View Website ↗
          </a>
        </header>

        {children}
      </main>
    </div>
  );
}
