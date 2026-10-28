
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "#fffaf5",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "560px" }}>
          <div
            style={{
              fontSize: "100px",
              fontWeight: "900",
              color: "#ff6b35",
              lineHeight: 1,
            }}
          >
            404
          </div>

          <div style={{ fontSize: "64px", margin: "20px 0" }}>
            🍕
          </div>

          <h1
            style={{
              fontSize: "32px",
              color: "#252525",
              marginBottom: "12px",
            }}
          >
            Oops! This page is off the menu.
          </h1>

          <p
            style={{
              color: "#777",
              fontSize: "16px",
              lineHeight: 1.7,
              marginBottom: "28px",
            }}
          >
            Looks like this page doesn't exist. Don't worry,
            there's plenty of delicious food waiting for you!
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                background: "#ff6b35",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "14px 24px",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Back to Home
            </button>

            <button
              onClick={() => {
                window.location.href = "/restaurants";
              }}
              style={{
                background: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "14px 24px",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Explore Restaurants
            </button>
          </div>

          <p
            style={{
              marginTop: "30px",
              fontSize: "13px",
              color: "#999",
            }}
          >
            QuickBite — Good food, good mood.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
