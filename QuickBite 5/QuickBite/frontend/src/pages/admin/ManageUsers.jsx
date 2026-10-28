
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";

const STORAGE_KEY = "quickbite-admin-users";

const initialUsers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "9876543210",
    joined: "2026-09-12",
    orders: 12,
    spent: 4250,
    active: true,
  },
  {
    id: 2,
    name: "Priya Verma",
    email: "priya@example.com",
    phone: "9876543211",
    joined: "2026-09-18",
    orders: 8,
    spent: 2890,
    active: true,
  },
  {
    id: 3,
    name: "Aman Gupta",
    email: "aman@example.com",
    phone: "9876543212",
    joined: "2026-10-01",
    orders: 5,
    spent: 1750,
    active: false,
  },
  {
    id: 4,
    name: "Neha Singh",
    email: "neha@example.com",
    phone: "9876543213",
    joined: "2026-10-05",
    orders: 15,
    spent: 6200,
    active: true,
  },
  {
    id: 5,
    name: "Karan Mehta",
    email: "karan@example.com",
    phone: "9876543214",
    joined: "2026-10-12",
    orders: 3,
    spent: 950,
    active: true,
  },
];

const inputStyle = {
  padding: "12px 14px",
  border: "1px solid #e8ddd5",
  borderRadius: 9,
  background: "#fff",
  fontSize: 13,
  outlineColor: "#ff6b35",
};

export default function ManageUsers() {
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && user.active) ||
        (statusFilter === "Inactive" && !user.active);

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const toggleStatus = (id) => {
    const user = users.find((item) => item.id === id);

    if (!user) return;

    const nextStatus = !user.active;

    setUsers((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, active: nextStatus } : item
      )
    );

    setSelectedUser((previous) =>
      previous?.id === id
        ? { ...previous, active: nextStatus }
        : previous
    );

    setMessage(
      `${user.name} has been marked ${nextStatus ? "active" : "inactive"}.`
    );
  };

  const totalSpent = users.reduce((sum, user) => sum + user.spent, 0);
  const activeUsers = users.filter((user) => user.active).length;
  const totalOrders = users.reduce((sum, user) => sum + user.orders, 0);

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: "👥",
      color: "#eaf1ff",
    },
    {
      label: "Active Users",
      value: activeUsers,
      icon: "✅",
      color: "#e6f7ed",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: "📦",
      color: "#fff0d9",
    },
    {
      label: "Total Spending",
      value: `₹${totalSpent.toLocaleString("en-IN")}`,
      icon: "💰",
      color: "#f1e8ff",
    },
  ];

  return (
    <AdminLayout>
      <section>
        <div style={{ marginBottom: 25 }}>
          <h2 style={{ margin: "0 0 7px", fontSize: 24 }}>
            Manage Users
          </h2>
          <p style={{ margin: 0, color: "#81766f", fontSize: 14 }}>
            View customer details and manage demo account statuses.
          </p>
        </div>

        {message && (
          <div
            role="status"
            style={{
              padding: 13,
              marginBottom: 18,
              background: "#fff0e7",
              color: "#a94420",
              borderRadius: 9,
              fontSize: 13,
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 16,
            marginBottom: 25,
          }}
        >
          {stats.map((stat) => (
            <article
              key={stat.label}
              style={{
                background: "#fff",
                border: "1px solid #f0e7e0",
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: "#81766f", fontSize: 13 }}>
                  {stat.label}
                </span>
                <span
                  style={{
                    background: stat.color,
                    padding: 9,
                    borderRadius: 10,
                    fontSize: 19,
                  }}
                >
                  {stat.icon}
                </span>
              </div>

              <h2 style={{ margin: "16px 0 0", fontSize: 27 }}>
                {stat.value}
              </h2>
            </article>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <input
            type="search"
            aria-label="Search users"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              ...inputStyle,
              flex: "1 1 260px",
              minWidth: 0,
            }}
          />

          <select
            aria-label="Filter users by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={{ ...inputStyle, minWidth: 150 }}
          >
            <option value="All">All Users</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

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
              minWidth: 850,
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#fff8f3" }}>
                {[
                  "Customer",
                  "Phone",
                  "Joined",
                  "Orders",
                  "Total Spent",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: 14,
                      color: "#81766f",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: "1px solid #f2ebe5" }}
                >
                  <td style={{ padding: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#fff0e7",
                          color: "#e95220",
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <strong style={{ fontSize: 13 }}>
                          {user.name}
                        </strong>
                        <div
                          style={{
                            color: "#81766f",
                            fontSize: 11,
                            marginTop: 4,
                          }}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: 14, fontSize: 13 }}>
                    {user.phone}
                  </td>

                  <td style={{ padding: 14, fontSize: 12 }}>
                    {user.joined}
                  </td>

                  <td style={{ padding: 14, fontWeight: 700 }}>
                    {user.orders}
                  </td>

                  <td style={{ padding: 14, fontWeight: 700 }}>
                    ₹{user.spent.toLocaleString("en-IN")}
                  </td>

                  <td style={{ padding: 14 }}>
                    <span
                      style={{
                        background: user.active ? "#e6f7ed" : "#ffe8e8",
                        color: user.active ? "#16834a" : "#c33c3c",
                        padding: "6px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td style={{ padding: 14 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #eee0d6",
                          background: "#fff8f3",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleStatus(user.id)}
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #eee0d6",
                          background: "#fff",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#81766f",
              }}
            >
              <div style={{ fontSize: 35 }}>👥</div>
              <h3>No users found</h3>
              <p>Try another search or status filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                style={{
                  background: "#ff6b35",
                  color: "#fff",
                  border: 0,
                  borderRadius: 9,
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {selectedUser && (
          <div
            onClick={() => setSelectedUser(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-details-title"
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 440,
                background: "#fff",
                borderRadius: 18,
                padding: 25,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <h2 id="user-details-title" style={{ margin: 0 }}>
                  Customer Details
                </h2>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  aria-label="Close customer details"
                  style={{
                    border: 0,
                    borderRadius: 8,
                    padding: "8px 11px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ textAlign: "center", padding: "22px 0" }}>
                <div style={{ fontSize: 45 }}>👤</div>
                <h3 style={{ margin: "8px 0" }}>
                  {selectedUser.name}
                </h3>
                <p style={{ color: "#81766f", margin: 0, fontSize: 13 }}>
                  {selectedUser.email}
                </p>
              </div>

              {[
                ["Phone", selectedUser.phone],
                ["Member Since", selectedUser.joined],
                ["Total Orders", selectedUser.orders],
                [
                  "Total Spent",
                  `₹${selectedUser.spent.toLocaleString("en-IN")}`,
                ],
                ["Account Status", selectedUser.active ? "Active" : "Inactive"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 15,
                    padding: "12px 0",
                    borderBottom: "1px solid #f2ebe5",
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: "#81766f" }}>{label}</span>
                  <strong style={{ textAlign: "right" }}>{value}</strong>
                </div>
              ))}

              <button
                type="button"
                onClick={() => toggleStatus(selectedUser.id)}
                style={{
                  width: "100%",
                  marginTop: 20,
                  padding: 12,
                  border: 0,
                  borderRadius: 9,
                  background: selectedUser.active ? "#ffe8e8" : "#e6f7ed",
                  color: selectedUser.active ? "#c33c3c" : "#16834a",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {selectedUser.active ? "Deactivate User" : "Activate User"}
              </button>
            </section>
          </div>
        )}

        <p style={{ marginTop: 18, color: "#81766f", fontSize: 12 }}>
          Demo mode: these are sample customer records stored in your browser.
          Account status changes do not affect real user accounts.
        </p>
      </section>
    </AdminLayout>
  );
}
