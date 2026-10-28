
import React from "react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();


  const deliveryFee = cart.length === 0 ? 0 : cartTotal >= 499 ? 0 : 40;
  const tax = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal + deliveryFee + tax;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.logo}>
          <span style={styles.logoIcon}>Q</span>
          QuickBite<span style={{ color: "#ff6b35" }}>.</span>
        </a>

        <a href="/" style={styles.continueLink}>
          ← Continue shopping
        </a>
      </header>

      <main style={styles.container}>
        <div style={styles.heading}>
          <div>
            <p style={styles.eyebrow}>YOUR ORDER, YOUR WAY</p>
            <h1 style={styles.title}>My Cart</h1>
            <p style={styles.subtitle}>
              Review your delicious picks before checkout.
            </p>
          </div>

          <span style={styles.itemCount}>
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </div>

        {cart.length === 0 ? (
          <div style={styles.emptyCart}>
            <div style={styles.emptyEmoji}>🛒</div>
            <h2>Your cart is feeling hungry!</h2>
            <p>
              Looks like you haven't added any delicious food yet.
            </p>
            <a href="/" style={styles.primaryButton}>
              Explore food →
            </a>
          </div>
        ) : (
          <div style={styles.layout}>
            <section style={styles.itemsPanel}>
              <div style={styles.panelHeading}>
                <h2>Your items</h2>
                <span>{cart.length} different dishes</span>
              </div>

              {cart.map((item) => (
                <article key={item.id} style={styles.item}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={styles.itemImage}
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />

                  <div style={styles.itemDetails}>
                    <div style={styles.itemTop}>
                      <h3>{item.name}</h3>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>

                    <p style={styles.itemDescription}>
                      {item.description || item.category || "Freshly prepared"}
                    </p>

                    <div style={styles.itemBottom}>
                      <div style={styles.quantityControl}>
                        <button
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        style={styles.removeButton}
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              <a href="/" style={styles.addMore}>
                + Add more items
              </a>
            </section>

            <aside style={styles.summary}>
              <h2>Order summary</h2>
              <p style={styles.summarySubtitle}>
                Here's your bill breakdown.
              </p>

              <div style={styles.summaryLine}>
                <span>Item subtotal</span>
                <span>₹{cartTotal}</span>
              </div>

              <div style={styles.summaryLine}>
                <span>Delivery fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong style={{ color: "#198754" }}>FREE</strong>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div style={styles.summaryLine}>
                <span>Estimated tax (5%)</span>
                <span>₹{tax}</span>
              </div>

              {cartTotal < 499 && (
                <div style={styles.savingsHint}>
                  Add ₹{499 - cartTotal} more for free delivery.
                </div>
              )}

              <div style={styles.divider} />

              <div style={styles.totalLine}>
                <span>Total</span>
                <strong>₹{grandTotal}</strong>
              </div>

              <button
                type="button"
                style={styles.checkoutButton}
                onClick={() => {
                  window.location.href = "/checkout";
                }}
              >
                Proceed to checkout →
              </button>

              <div style={styles.secureNote}>
                <span>🔒</span>
                <span>Secure checkout experience</span>
              </div>

              <div style={styles.deliveryNote}>
                <span>🛵</span>
                <div>
                  <strong>Delivered fresh</strong>
                  <p>Estimated delivery time depends on the restaurant.</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        QuickBite · Good food. Good mood. ❤️
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fffdfb",
    color: "#24211f",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    minHeight: 78,
    padding: "16px 7%",
    background: "#fff",
    borderBottom: "1px solid #f1e9e3",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-1px",
    color: "#24211f",
    textDecoration: "none",
  },
  logoIcon: {
    display: "grid",
    placeItems: "center",
    width: 36,
    height: 36,
    borderRadius: 11,
    background: "#ff6b35",
    color: "#fff",
  },
  continueLink: {
    textDecoration: "none",
    color: "#e95220",
    fontWeight: 700,
    fontSize: 13,
  },
  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "45px 25px 75px",
  },
  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    marginBottom: 30,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: 800,
    color: "#ff6b35",
    margin: "0 0 10px",
  },
  title: {
    fontSize: "clamp(32px, 4vw, 44px)",
    letterSpacing: "-1.5px",
    margin: 0,
  },
  subtitle: {
    color: "#77716d",
    fontSize: 14,
    marginTop: 10,
  },
  itemCount: {
    padding: "10px 15px",
    background: "#fff0e9",
    color: "#e95220",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, .9fr)",
    alignItems: "start",
    gap: 25,
  },
  itemsPanel: {
    padding: 25,
    background: "#fff",
    border: "1px solid #eee7e2",
    borderRadius: 20,
  },
  panelHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  item: {
    display: "flex",
    gap: 17,
    padding: "23px 0",
    borderBottom: "1px solid #f1e9e3",
  },
  itemImage: {
    width: 112,
    height: 112,
    objectFit: "cover",
    borderRadius: 15,
    background: "#fff0e4",
    flexShrink: 0,
  },
  itemDetails: { flex: 1, minWidth: 0 },
  itemTop: {
    display: "flex",
    alignItems: "start",
    justifyContent: "space-between",
    gap: 12,
  },
  itemDescription: {
    color: "#77716d",
    fontSize: 12,
    lineHeight: 1.6,
    margin: "7px 0 15px",
  },
  itemBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    border: "1px solid #eee7e2",
    borderRadius: 10,
    padding: "5px 8px",
    fontWeight: 700,
  },
  removeButton: {
    background: "transparent",
    border: 0,
    color: "#d9534f",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
  },
  addMore: {
    display: "inline-block",
    marginTop: 22,
    color: "#e95220",
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
  },
  summary: {
    padding: 25,
    border: "1px solid #eee7e2",
    borderRadius: 20,
    background: "#fff",
    boxShadow: "0 12px 35px rgba(36,25,18,.04)",
  },
  summarySubtitle: {
    color: "#77716d",
    fontSize: 13,
    marginBottom: 25,
  },
  summaryLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    margin: "17px 0",
    fontSize: 13,
    color: "#625b56",
  },
  savingsHint: {
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    background: "#f0fbf4",
    color: "#198754",
    fontSize: 12,
    lineHeight: 1.6,
  },
  divider: {
    borderTop: "1px dashed #e5dcd5",
    margin: "22px 0",
  },
  totalLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 17,
    marginBottom: 22,
  },
  checkoutButton: {
    width: "100%",
    border: 0,
    borderRadius: 12,
    padding: "16px 12px",
    background: "#ff6b35",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  secureNote: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    color: "#77716d",
    fontSize: 11,
  },
  deliveryNote: {
    display: "flex",
    gap: 12,
    marginTop: 23,
    padding: 15,
    borderRadius: 12,
    background: "#fff8f3",
    fontSize: 12,
  },
  emptyCart: {
    textAlign: "center",
    padding: "70px 20px",
    border: "1px solid #eee7e2",
    borderRadius: 22,
    background: "#fff",
  },
  emptyEmoji: { fontSize: 65, marginBottom: 15 },
  primaryButton: {
    display: "inline-block",
    marginTop: 15,
    padding: "14px 20px",
    borderRadius: 11,
    background: "#ff6b35",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
  footer: {
    padding: 25,
    borderTop: "1px solid #f1e9e3",
    textAlign: "center",
    color: "#77716d",
    fontSize: 12,
  },
};
