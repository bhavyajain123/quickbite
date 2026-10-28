
import React, { useState } from "react";

const quickQuestions = [
  "What should I eat?",
  "Suggest vegetarian food",
  "Show budget meals",
  "How do I track my order?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey there! 👋 Welcome to QuickBite. I can help you discover food and answer basic ordering questions.",
    },
  ]);

  function getBotReply(question) {
    const text = question.toLowerCase();

    if (
      text.includes("vegetarian") ||
      text.includes("veg food") ||
      text.includes("veg meals")
    ) {
      return "🥗 Try a Garden Fresh Bowl, Veg Hakka Noodles, or Margherita Pizza. You can explore more vegetarian options in our food menu!";
    }

    if (
      text.includes("budget") ||
      text.includes("cheap") ||
      text.includes("affordable")
    ) {
      return "💰 Looking for value? Try Chocolate Lava Cake for ₹129, Veg Hakka Noodles for ₹169, or Garden Fresh Bowl for ₹189.";
    }

    if (
      text.includes("track") ||
      text.includes("order status")
    ) {
      return "📦 You can check your order status on the My Orders or Order Tracking page. These pages currently use demo order data.";
    }

    if (
      text.includes("pizza") ||
      text.includes("burger") ||
      text.includes("biryani")
    ) {
      return "😋 Great choice! QuickBite has pizzas, burgers, biryani, noodles, desserts, and more. Browse the menu and add your favourite dishes to the cart.";
    }

    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hey")
    ) {
      return "Hey! 👋 What are you craving today? Pizza, burgers, biryani, or something healthy?";
    }

    if (
      text.includes("what should i eat") ||
      text.includes("suggest") ||
      text.includes("recommend")
    ) {
      return "🍕 For comfort food, try Margherita Pizza. Want something filling? Choose Hyderabadi Biryani. For a lighter meal, try the Garden Fresh Bowl!";
    }

    if (
      text.includes("delivery") ||
      text.includes("deliver")
    ) {
      return "🛵 Delivery estimates are shown with each restaurant and dish. Actual delivery services are not connected in this frontend demo.";
    }

    if (
      text.includes("payment") ||
      text.includes("pay")
    ) {
      return "💳 QuickBite currently demonstrates checkout with demo payment options. No real payment gateway is connected.";
    }

    if (
      text.includes("thank")
    ) {
      return "You're welcome! ❤️ Happy eating with QuickBite.";
    }

    return "😊 I can help with food suggestions, vegetarian meals, budget options, payments, and order tracking. Try one of the quick questions below!";
  }

  function sendMessage(text = message) {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) return;

    const userMessage = {
      sender: "user",
      text: trimmedMessage,
    };

    const botMessage = {
      sender: "bot",
      text: getBotReply(trimmedMessage),
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      botMessage,
    ]);

    setMessage("");
  }

  return (
    <>
      {isOpen && (
        <section
          style={{
            position: "fixed",
            right: "20px",
            bottom: "90px",
            width: "min(360px, calc(100vw - 30px))",
            height: "490px",
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "18px",
            boxShadow: "0 12px 45px #0002",
            zIndex: 2000,
            overflow: "hidden",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <header
            style={{
              background: "#ff6b35",
              color: "#fff",
              padding: "17px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>QuickBite Assistant 🍔</strong>
              <div style={{ fontSize: "12px", marginTop: "5px" }}>
                Food help, anytime
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              style={{
                border: 0,
                background: "transparent",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </header>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              background: "#fffaf6",
            }}
          >
            {messages.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    item.sender === "user"
                      ? "flex-end"
                      : "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "11px 13px",
                    borderRadius: "13px",
                    background:
                      item.sender === "user"
                        ? "#ff6b35"
                        : "#fff",
                    color:
                      item.sender === "user"
                        ? "#fff"
                        : "#332a25",
                    border:
                      item.sender === "bot"
                        ? "1px solid #f1e5dc"
                        : "none",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    overflowWrap: "anywhere",
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "10px",
              borderTop: "1px solid #eee",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  style={{
                    border: "1px solid #f2d7c9",
                    borderRadius: "20px",
                    padding: "6px 9px",
                    background: "#fff7f1",
                    color: "#99421e",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  {question}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask me anything..."
                aria-label="Type your message"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "11px",
                  border: "1px solid #e5ddd7",
                  borderRadius: "10px",
                  outlineColor: "#ff6b35",
                  fontSize: "12px",
                }}
              />

              <button
                type="submit"
                aria-label="Send message"
                style={{
                  border: 0,
                  borderRadius: "10px",
                  padding: "0 15px",
                  background: "#ff6b35",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close chat" : "Open QuickBite chat"}
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          width: "58px",
          height: "58px",
          border: "none",
          borderRadius: "50%",
          background: "#ff6b35",
          color: "#fff",
          fontSize: "25px",
          boxShadow: "0 6px 22px #ff6b3555",
          cursor: "pointer",
          zIndex: 2001,
        }}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </>
  );
}
