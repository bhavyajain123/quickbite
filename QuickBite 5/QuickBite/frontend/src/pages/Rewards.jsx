
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Rewards.css";

const REWARDS = [
  {
    id: "free-delivery",
    title: "Free Delivery",
    description: "Save delivery charges on your next order.",
    points: 100,
    emoji: "🛵",
    color: "mint",
  },
  {
    id: "fifty-off",
    title: "₹50 OFF",
    description: "Get ₹50 off an eligible food order.",
    points: 250,
    emoji: "🎟️",
    color: "peach",
  },
  {
    id: "dessert",
    title: "Dessert Treat",
    description: "Unlock a sweet treat reward.",
    points: 400,
    emoji: "🍰",
    color: "lavender",
  },
];

const STORAGE_KEY = "quickbite-rewards";
const INITIAL_POINTS = 320;

function getInitialData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (
      saved &&
      typeof saved.points === "number" &&
      Array.isArray(saved.history)
    ) {
      return saved;
    }
  } catch (error) {
    console.error("Could not read rewards data:", error);
  }

  return {
    points: INITIAL_POINTS,
    history: [],
  };
}

export default function Rewards() {
  const [data, setData] = useState(getInitialData);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const points = data.points;

  const level =
    points >= 700 ? "Gold" : points >= 300 ? "Silver" : "Bronze";

  const nextLevelPoints =
    level === "Bronze" ? 300 : level === "Silver" ? 700 : 1000;

  const progress = Math.min(
    100,
    (points / nextLevelPoints) * 100
  );

  function redeemReward(reward) {
    if (points < reward.points) {
      setNotice(
        `You need ${reward.points - points} more Bite Points for ${reward.title}.`
      );
      return;
    }

    const redemption = {
      id: `${Date.now()}-${reward.id}`,
      title: reward.title,
      points: reward.points,
      date: new Date().toLocaleDateString("en-IN"),
    };

    setData((previous) => ({
      points: previous.points - reward.points,
      history: [redemption, ...previous.history],
    }));

    setNotice(
      `${reward.title} unlocked! This is a demo reward, not a real coupon.`
    );
  }

  return (
    <div className="rewards-page">
      <Navbar />

      <main className="rewards-container">
        {/* Hero section */}
        <section className="rewards-hero">
          <div className="rewards-hero-copy">
            <span className="rewards-eyebrow">
              THE QUICKBITE CLUB
            </span>

            <h1>
              Good food.
              <br />
              <span>Great rewards.</span>
            </h1>

            <p>
              Every bite brings you closer to something delicious.
              Collect points, unlock treats and enjoy your food journey.
            </p>

            <a
              className="rewards-primary-link"
              href="#available-rewards"
            >
              Explore rewards <span>→</span>
            </a>
          </div>

          <div className="rewards-hero-art" aria-hidden="true">
            <div className="rewards-orbit">✦</div>
            <div className="rewards-gift">🎁</div>
            <span className="rewards-float rewards-float-one">🍕</span>
            <span className="rewards-float rewards-float-two">🍔</span>
            <span className="rewards-float rewards-float-three">⭐</span>

            <div className="rewards-stamp">
              BITE
              <br />
              MORE!
            </div>
          </div>
        </section>

        {/* Points and membership */}
        <section className="rewards-balance">
          <div className="rewards-points-card">
            <span className="rewards-card-label">
              YOUR BITE POINTS
            </span>

            <div className="rewards-points-number">
              🪙 {points.toLocaleString("en-IN")}
            </div>

            <p>Points ready to redeem</p>
          </div>

          <div className="rewards-level-card">
            <div className="rewards-level-heading">
              <div>
                <span className="rewards-card-label">
                  YOUR MEMBERSHIP
                </span>

                <h2>
                  {level} Member{" "}
                  {level === "Gold" ? "👑" : "✨"}
                </h2>
              </div>

              <span
                className={`rewards-level-badge ${level.toLowerCase()}`}
              >
                {level}
              </span>
            </div>

            <div
              className="rewards-progress-track"
              role="progressbar"
              aria-label="Membership progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div
                className="rewards-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p>
              {level === "Gold"
                ? "You're enjoying our highest demo membership tier!"
                : `${Math.max(
                    0,
                    nextLevelPoints - points
                  )} points to the next milestone`}
            </p>
          </div>
        </section>

        {/* Redeem rewards */}
        <section
          className="rewards-section"
          id="available-rewards"
        >
          <div className="rewards-section-heading">
            <div>
              <span className="rewards-eyebrow">
                A LITTLE SOMETHING FOR YOU
              </span>

              <h2>Redeem your points</h2>

              <p>
                Choose a treat. Your points, your choice.
              </p>
            </div>

            <span className="rewards-count">
              {REWARDS.length} rewards
            </span>
          </div>

          <div className="rewards-grid">
            {REWARDS.map((reward) => {
              const affordable = points >= reward.points;

              return (
                <article
                  className="rewards-item"
                  key={reward.id}
                >
                  <div
                    className={`rewards-item-art ${reward.color}`}
                  >
                    <span>{reward.emoji}</span>
                    <span className="rewards-item-sparkle">
                      ✦
                    </span>
                  </div>

                  <div className="rewards-item-body">
                    <div className="rewards-item-title-row">
                      <h3>{reward.title}</h3>

                      <span className="rewards-cost">
                        {reward.points} pts
                      </span>
                    </div>

                    <p>{reward.description}</p>

                    <button
                      className={`rewards-redeem-button ${
                        affordable ? "" : "locked"
                      }`}
                      onClick={() => redeemReward(reward)}
                      type="button"
                    >
                      {affordable
                        ? "Redeem reward →"
                        : "Earn more points"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {notice && (
            <p className="rewards-notice" role="status">
              {notice}
            </p>
          )}
        </section>

        {/* Redemption history */}
        <section className="rewards-history">
          <div>
            <span className="rewards-eyebrow">
              YOUR ACTIVITY
            </span>

            <h2>Reward history</h2>
          </div>

          {data.history.length === 0 ? (
            <div className="rewards-empty">
              <span>🎉</span>

              <div>
                <strong>Your reward story starts here</strong>
                <p>
                  Redeem a reward and it will appear in this list.
                </p>
              </div>
            </div>
          ) : (
            <div className="rewards-history-list">
              {data.history.map((item) => (
                <div
                  className="rewards-history-row"
                  key={item.id}
                >
                  <span className="rewards-history-icon">
                    🎁
                  </span>

                  <div>
                    <strong>{item.title}</strong>
                    <p>
                      {item.date} · Demo redemption
                    </p>
                  </div>

                  <strong className="rewards-history-points">
                    −{item.points} pts
                  </strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="rewards-demo-note">
          Demo feature: points and redemptions are stored in this
          browser only. Rewards do not represent real discounts,
          coupons or payment credits.
        </p>
      </main>

      <Footer />
    </div>
  );
}
