import { useState } from "react";
import { getGroupOrderRecommendations } from "../services/aiService";

const initialMember = {
  name: "",
  preference: "",
  diet: "any",
  favoriteCategory: "",
};

export default function GroupOrder() {
  const [members, setMembers] = useState([
    { ...initialMember, name: "You" },
    { ...initialMember, name: "" },
  ]);
  const [budget, setBudget] = useState(1000);
  const [maxItems, setMaxItems] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const updateMember = (index, field, value) => {
    setMembers((previous) =>
      previous.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    );
  };

  const addMember = () => {
    if (members.length >= 20) {
      setError("You can add a maximum of 20 members.");
      return;
    }

    setMembers((previous) => [
      ...previous,
      { ...initialMember, name: `Member ${previous.length + 1}` },
    ]);

    setError("");
  };

  const removeMember = (index) => {
    if (members.length <= 1) {
      setError("At least one member is required.");
      return;
    }

    setMembers((previous) => previous.filter((_, i) => i !== index));
    setResult(null);
    setError("");
  };

  const generateGroupOrder = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    const validMembers = members.map((member, index) => ({
      name: member.name.trim() || `Member ${index + 1}`,
      preference: member.preference.trim(),
      diet: member.diet,
      favoriteCategory: member.favoriteCategory,
    }));

    if (budget <= 0 || !Number.isFinite(Number(budget))) {
      setError("Please enter a valid budget.");
      return;
    }

    if (validMembers.some((member) => !member.preference)) {
      setError("Please enter food preferences for every member.");
      return;
    }

    setLoading(true);

    try {
      const response = await getGroupOrderRecommendations({
        members: validMembers,
        budget: Number(budget),
        maxItems: Number(maxItems),
      });

      if (response.success === false) {
        throw new Error(response.message || "Unable to generate group order.");
      }

      const data = response.data || response.result || response;
      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const resultItems = result?.items || result?.recommendations || [];

  const resultTotal =
    result?.total ??
    result?.totalCost ??
    resultItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          Number(item.quantity || item.count || 1),
      0
    );

  return (
    <main className="group-order-page">
      <section className="group-order-hero">
        <div className="group-order-hero-content">
          <span className="group-order-badge">QUICKBITE AI</span>
          <h1>Good food tastes better together.</h1>
          <p>
            Add your friends, share everyone's food preferences, and let
            QuickBite create a group meal that fits your budget.
          </p>

          <div className="group-order-highlights">
            <span>👥 Up to 20 members</span>
            <span>🍕 Personalized food picks</span>
            <span>💰 Shared budget planning</span>
          </div>
        </div>

        <div className="group-order-hero-emoji">🍕</div>
      </section>

      <div className="group-order-layout">
        <section className="group-order-form-card">
          <div className="group-order-section-heading">
            <div>
              <span className="group-order-step">STEP 01</span>
              <h2>Who's eating today?</h2>
              <p>Add everyone joining the meal.</p>
            </div>
            <span className="group-order-member-count">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>

          <form onSubmit={generateGroupOrder}>
            <div className="group-order-members">
              {members.map((member, index) => (
                <article className="group-order-member-card" key={index}>
                  <div className="group-order-member-top">
                    <div className="group-order-member-avatar">
                      {member.name.trim().charAt(0).toUpperCase() || "👤"}
                    </div>

                    <div>
                      <h3>Member {index + 1}</h3>
                      <p>Tell us what they like</p>
                    </div>

                    {members.length > 1 && (
                      <button
                        type="button"
                        className="group-order-remove"
                        onClick={() => removeMember(index)}
                        aria-label={`Remove member ${index + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="group-order-field">
                    <label htmlFor={`member-name-${index}`}>Name</label>
                    <input
                      id={`member-name-${index}`}
                      type="text"
                      placeholder="Enter member's name"
                      value={member.name}
                      onChange={(event) =>
                        updateMember(index, "name", event.target.value)
                      }
                    />
                  </div>

                  <div className="group-order-field">
                    <label htmlFor={`member-preference-${index}`}>
                      Food preference
                    </label>
                    <input
                      id={`member-preference-${index}`}
                      type="text"
                      placeholder="e.g. pizza, spicy food, biryani"
                      value={member.preference}
                      onChange={(event) =>
                        updateMember(index, "preference", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="group-order-member-fields">
                    <div className="group-order-field">
                      <label htmlFor={`member-diet-${index}`}>
                        Dietary choice
                      </label>
                      <select
                        id={`member-diet-${index}`}
                        value={member.diet}
                        onChange={(event) =>
                          updateMember(index, "diet", event.target.value)
                        }
                      >
                        <option value="any">Any</option>
                        <option value="veg">Vegetarian</option>
                        <option value="non-veg">Non-vegetarian</option>
                      </select>
                    </div>

                    <div className="group-order-field">
                      <label htmlFor={`member-category-${index}`}>
                        Favorite category
                      </label>
                      <select
                        id={`member-category-${index}`}
                        value={member.favoriteCategory}
                        onChange={(event) =>
                          updateMember(
                            index,
                            "favoriteCategory",
                            event.target.value
                          )
                        }
                      >
                        <option value="">No preference</option>
                        <option value="pizza">Pizza</option>
                        <option value="burger">Burgers</option>
                        <option value="indian">Indian</option>
                        <option value="biryani">Biryani</option>
                        <option value="chinese">Chinese</option>
                        <option value="dessert">Desserts</option>
                        <option value="healthy">Healthy food</option>
                        <option value="wrap">Wraps</option>
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="group-order-add-member"
              onClick={addMember}
              disabled={members.length >= 20}
            >
              <span>＋</span> Add another member
            </button>

            <div className="group-order-divider" />

            <div className="group-order-section-heading">
              <div>
                <span className="group-order-step">STEP 02</span>
                <h2>Set your group budget</h2>
                <p>Choose how much everyone wants to spend together.</p>
              </div>
            </div>

            <div className="group-order-budget-card">
              <div className="group-order-budget-top">
                <div>
                  <span>Total group budget</span>
                  <strong>{formatPrice(budget)}</strong>
                </div>
                <span className="group-order-budget-icon">💸</span>
              </div>

              <input
                className="group-order-budget-slider"
                type="range"
                min="100"
                max="5000"
                step="50"
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value))}
                aria-label="Total group budget"
              />

              <div className="group-order-budget-range">
                <span>₹100</span>
                <span>₹5,000</span>
              </div>

              <div className="group-order-budget-input">
                <label htmlFor="group-budget">Or enter an exact budget</label>
                <div>
                  <span>₹</span>
                  <input
                    id="group-budget"
                    type="number"
                    min="1"
                    max="100000"
                    value={budget}
                    onChange={(event) =>
                      setBudget(Number(event.target.value))
                    }
                    required
                  />
                </div>
              </div>

              <div className="group-order-budget-summary">
                <div>
                  <span>People</span>
                  <strong>{members.length}</strong>
                </div>
                <div>
                  <span>Budget per person</span>
                  <strong>{formatPrice(budget / members.length)}</strong>
                </div>
              </div>
            </div>

            <div className="group-order-field group-order-max-items">
              <label htmlFor="max-items">Maximum food items</label>
              <select
                id="max-items"
                value={maxItems}
                onChange={(event) => setMaxItems(Number(event.target.value))}
              >
                {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <option key={count} value={count}>
                    {count} items
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="group-order-error" role="alert">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="group-order-generate"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="group-order-spinner" />
                  Creating your group meal...
                </>
              ) : (
                <>✨ Generate AI Group Order</>
              )}
            </button>

            <p className="group-order-form-note">
              Your recommendations are based on the preferences and budget
              entered above.
            </p>
          </form>
        </section>

        <aside className="group-order-result-panel">
          {!result && !loading && (
            <div className="group-order-empty">
              <div className="group-order-empty-illustration">🍱</div>
              <span className="group-order-step">YOUR GROUP MEAL</span>
              <h2>Your feast starts here!</h2>
              <p>
                Add your group members, enter their preferences, and generate
                a meal plan everyone can enjoy.
              </p>

              <div className="group-order-empty-features">
                <div>
                  <span>🍽️</span>
                  <div>
                    <strong>For everyone</strong>
                    <p>Consider each member's food choices.</p>
                  </div>
                </div>
                <div>
                  <span>🪙</span>
                  <div>
                    <strong>Budget friendly</strong>
                    <p>Keep the suggested meal within budget.</p>
                  </div>
                </div>
                <div>
                  <span>🤝</span>
                  <div>
                    <strong>One shared plan</strong>
                    <p>See the suggested order in one place.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="group-order-loading">
              <div className="group-order-loading-emoji">🍕</div>
              <h2>Planning your feast...</h2>
              <p>Finding food options for your group.</p>
              <div className="group-order-loading-bar">
                <span />
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="group-order-results">
              <span className="group-order-step">YOUR AI RECOMMENDATION</span>
              <h2>It's feast time! 🎉</h2>
              <p className="group-order-result-description">
                Here's the group meal recommendation based on your preferences.
              </p>

              <div className="group-order-result-stats">
                <div>
                  <span>Estimated total</span>
                  <strong>{formatPrice(resultTotal)}</strong>
                </div>
                <div>
                  <span>Per person</span>
                  <strong>
                    {formatPrice(
                      result.perPersonCost ??
                        resultTotal / Math.max(members.length, 1)
                    )}
                  </strong>
                </div>
                <div>
                  <span>Budget left</span>
                  <strong>
                    {formatPrice(
                      result.remainingBudget ??
                        Math.max(Number(budget) - Number(resultTotal), 0)
                    )}
                  </strong>
                </div>
              </div>

              <div className="group-order-result-items">
                <h3>🍴 Recommended food</h3>

                {resultItems.length === 0 ? (
                  <p>No food items were returned. Try adjusting your budget.</p>
                ) : (
                  resultItems.map((item, index) => (
                    <article
                      className="group-order-result-item"
                      key={item._id || item.id || `${item.name}-${index}`}
                    >
                      <div className="group-order-result-item-icon">
                        {item.category?.toLowerCase().includes("dessert")
                          ? "🍰"
                          : item.category?.toLowerCase().includes("pizza")
                            ? "🍕"
                            : item.category?.toLowerCase().includes("burger")
                              ? "🍔"
                              : "🍽️"}
                      </div>

                      <div className="group-order-result-item-info">
                        <strong>{item.name || item.foodName || "Food item"}</strong>
                        <span>
                          {item.category || item.description || "Recommended for your group"}
                        </span>
                        {Number(item.quantity || item.count || 1) > 1 && (
                          <small>
                            Quantity: {item.quantity || item.count}
                          </small>
                        )}
                      </div>

                      <strong className="group-order-result-item-price">
                        {formatPrice(
                          Number(item.price || 0) *
                            Number(item.quantity || item.count || 1)
                        )}
                      </strong>
                    </article>
                  ))
                )}
              </div>

              {Array.isArray(result.memberSuggestions) &&
                result.memberSuggestions.length > 0 && (
                  <div className="group-order-member-suggestions">
                    <h3>💡 Member suggestions</h3>
                    {result.memberSuggestions.map((suggestion, index) => (
                      <div key={index}>
                        <strong>
                          {suggestion.memberName ||
                            suggestion.name ||
                            `Member ${index + 1}`}
                        </strong>
                        <p>
                          {suggestion.suggestion ||
                            suggestion.recommendation ||
                            suggestion.foodName ||
                            "Consider the recommended group items."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              <button
                type="button"
                className="group-order-regenerate"
                onClick={() => setResult(null)}
              >
                ↻ Create another group order
              </button>

              <p className="group-order-demo-note">
                Recommendations are estimates. Availability and final prices
                may vary.
              </p>
            </div>
          )}
        </aside>
      </div>

      <style>{`
        .group-order-page {
          --go-primary: #fc8019;
          --go-dark: #202124;
          --go-muted: #737780;
          --go-border: #eceef2;
          width: min(1220px, calc(100% - 40px));
          margin: 32px auto 64px;
          color: var(--go-dark);
          font-family: inherit;
        }

        .group-order-hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          overflow: hidden;
          padding: 44px 48px;
          border-radius: 28px;
          background: linear-gradient(120deg, #fff1e5, #fff8ef 58%, #ffe4cc);
        }

        .group-order-hero-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
        }

        .group-order-badge,
        .group-order-step {
          display: inline-block;
          color: var(--go-primary);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .group-order-hero h1 {
          margin: 14px 0;
          max-width: 650px;
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1.12;
          letter-spacing: -1.5px;
        }

        .group-order-hero-content > p {
          max-width: 590px;
          margin: 0;
          color: #67635f;
          font-size: 15px;
          line-height: 1.8;
        }

        .group-order-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .group-order-highlights span {
          padding: 9px 12px;
          border: 1px solid rgba(252, 128, 25, .18);
          border-radius: 30px;
          background: rgba(255, 255, 255, .75);
          color: #57483d;
          font-size: 12px;
          font-weight: 600;
        }

        .group-order-hero-emoji {
          flex-shrink: 0;
          font-size: clamp(90px, 13vw, 160px);
          filter: drop-shadow(0 14px 12px rgba(105, 64, 25, .12));
          transform: rotate(-9deg);
        }

        .group-order-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(330px, .9fr);
          align-items: start;
          gap: 24px;
          margin-top: 26px;
        }

        .group-order-form-card,
        .group-order-result-panel {
          min-width: 0;
          border: 1px solid var(--go-border);
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 8px 35px rgba(30, 35, 45, .035);
        }

        .group-order-form-card {
          padding: 28px;
        }

        .group-order-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 22px;
        }

        .group-order-section-heading h2 {
          margin: 8px 0 5px;
          font-size: 22px;
          letter-spacing: -.5px;
        }

        .group-order-section-heading p {
          margin: 0;
          color: var(--go-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .group-order-member-count {
          flex-shrink: 0;
          padding: 8px 11px;
          border-radius: 30px;
          background: #fff1e5;
          color: #c75e0c;
          font-size: 12px;
          font-weight: 700;
        }

        .group-order-members {
          display: grid;
          gap: 15px;
        }

        .group-order-member-card {
          padding: 18px;
          border: 1px solid #eceef2;
          border-radius: 16px;
          background: #fff;
        }

        .group-order-member-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .group-order-member-avatar {
          display: grid;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 13px;
          background: #fff0e3;
          color: #d66a15;
          font-size: 17px;
          font-weight: 800;
        }

        .group-order-member-top h3 {
          margin: 0 0 4px;
          font-size: 14px;
        }

        .group-order-member-top p {
          margin: 0;
          color: var(--go-muted);
          font-size: 12px;
        }

        .group-order-remove {
          width: 32px;
          height: 32px;
          margin-left: auto;
          border: 1px solid #f0e6e0;
          border-radius: 10px;
          background: #fff;
          color: #b94b37;
          cursor: pointer;
        }

        .group-order-field {
          display: grid;
          gap: 8px;
          min-width: 0;
          margin-bottom: 15px;
        }

        .group-order-field label,
        .group-order-budget-input label {
          color: #454850;
          font-size: 12px;
          font-weight: 700;
        }

        .group-order-field input,
        .group-order-field select {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          min-height: 44px;
          padding: 11px 12px;
          border: 1px solid #e3e5e9;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #292b30;
          font: inherit;
          font-size: 13px;
          transition: border-color .2s, box-shadow .2s;
        }

        .group-order-field input:focus,
        .group-order-field select:focus {
          border-color: var(--go-primary);
          box-shadow: 0 0 0 3px rgba(252, 128, 25, .1);
        }

        .group-order-field input::placeholder {
          color: #a3a5aa;
        }

        .group-order-member-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .group-order-member-fields .group-order-field {
          margin-bottom: 0;
        }

        .group-order-add-member {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 45px;
          margin-top: 15px;
          border: 1px dashed #f5b47f;
          border-radius: 12px;
          background: #fffaf6;
          color: #d56b16;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background .2s;
        }

        .group-order-add-member:hover {
          background: #fff0e3;
        }

        .group-order-add-member:disabled {
          cursor: not-allowed;
          opacity: .55;
        }

        .group-order-add-member span {
          font-size: 20px;
        }

        .group-order-divider {
          height: 1px;
          margin: 28px 0;
          background: var(--go-border);
        }

        .group-order-budget-card {
          padding: 20px;
          border: 1px solid #f5e5d8;
          border-radius: 16px;
          background: linear-gradient(140deg, #fffaf6, #fff);
        }

        .group-order-budget-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .group-order-budget-top > div {
          display: grid;
          gap: 7px;
        }

        .group-order-budget-top > div > span {
          color: var(--go-muted);
          font-size: 12px;
        }

        .group-order-budget-top strong {
          color: #25272b;
          font-size: 30px;
          letter-spacing: -.8px;
        }

        .group-order-budget-icon {
          display: grid;
          width: 48px;
          height: 48px;
          place-items: center;
          border-radius: 15px;
          background: #ffead9;
          font-size: 23px;
        }

        .group-order-budget-slider {
          width: 100%;
          margin: 22px 0 9px;
          accent-color: var(--go-primary);
          cursor: pointer;
        }

        .group-order-budget-range {
          display: flex;
          justify-content: space-between;
          color: #8a8d94;
          font-size: 11px;
        }

        .group-order-budget-input {
          display: grid;
          gap: 9px;
          margin-top: 22px;
        }

        .group-order-budget-input > div {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #e3e5e9;
          border-radius: 10px;
          background: #fff;
        }

        .group-order-budget-input > div > span {
          color: #747780;
          font-weight: 700;
        }

        .group-order-budget-input input {
          width: 100%;
          min-width: 0;
          padding: 12px 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #292b30;
          font: inherit;
          font-size: 14px;
        }

        .group-order-budget-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 18px;
          padding-top: 17px;
          border-top: 1px solid #f0e6de;
        }

        .group-order-budget-summary > div {
          display: grid;
          gap: 6px;
        }

        .group-order-budget-summary span {
          color: var(--go-muted);
          font-size: 11px;
        }

        .group-order-budget-summary strong {
          font-size: 15px;
        }

        .group-order-max-items {
          margin-top: 20px;
        }

        .group-order-error {
          margin: 12px 0;
          padding: 12px 14px;
          border: 1px solid #f5c5c0;
          border-radius: 10px;
          background: #fff3f1;
          color: #a82e23;
          font-size: 13px;
          line-height: 1.6;
        }

        .group-order-generate {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          min-height: 52px;
          margin-top: 20px;
          padding: 13px 18px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(110deg, #fc8019, #ff9d4d);
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 7px 18px rgba(252, 128, 25, .18);
          transition: transform .2s, box-shadow .2s;
        }

        .group-order-generate:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(252, 128, 25, .25);
        }

        .group-order-generate:disabled {
          cursor: wait;
          opacity: .75;
        }

        .group-order-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid rgba(255, 255, 255, .4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: group-order-spin .7s linear infinite;
        }

        .group-order-form-note,
        .group-order-demo-note {
          margin: 13px 0 0;
          color: #92959c;
          font-size: 11px;
          line-height: 1.7;
          text-align: center;
        }

        .group-order-result-panel {
          position: sticky;
          top: 20px;
          overflow: hidden;
        }

        .group-order-empty,
        .group-order-loading,
        .group-order-results {
          padding: 28px;
        }

        .group-order-empty-illustration {
          display: grid;
          width: 94px;
          height: 94px;
          margin: 0 auto 25px;
          place-items: center;
          border-radius: 28px;
          background: #fff0e3;
          font-size: 53px;
          transform: rotate(-4deg);
        }

        .group-order-empty > .group-order-step {
          display: block;
          text-align: center;
        }

        .group-order-empty h2,
        .group-order-loading h2,
        .group-order-results h2 {
          margin: 12px 0;
          font-size: 25px;
          letter-spacing: -.7px;
        }

        .group-order-empty > h2,
        .group-order-empty > p {
          text-align: center;
        }

        .group-order-empty > p,
        .group-order-result-description,
        .group-order-loading > p {
          color: var(--go-muted);
          font-size: 13px;
          line-height: 1.8;
        }

        .group-order-empty-features {
          display: grid;
          gap: 19px;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--go-border);
        }

        .group-order-empty-features > div {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .group-order-empty-features > div > span {
          display: grid;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 13px;
          background: #fff5ec;
          font-size: 20px;
        }

        .group-order-empty-features strong {
          display: block;
          margin: 2px 0 5px;
          font-size: 13px;
        }

        .group-order-empty-features p {
          margin: 0;
          color: var(--go-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .group-order-loading {
          display: flex;
          min-height: 320px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .group-order-loading-emoji {
          font-size: 65px;
          animation: group-order-bob 1s ease-in-out infinite alternate;
        }

        .group-order-loading-bar {
          width: 100%;
          height: 6px;
          margin-top: 18px;
          overflow: hidden;
          border-radius: 10px;
          background: #fff0e3;
        }

        .group-order-loading-bar span {
          display: block;
          width: 40%;
          height: 100%;
          border-radius: inherit;
          background: var(--go-primary);
          animation: group-order-progress 1.3s ease-in-out infinite;
        }

        .group-order-results > .group-order-step {
          margin-bottom: 5px;
        }

        .group-order-result-description {
          margin: 0 0 22px;
        }

        .group-order-result-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 25px;
        }

        .group-order-result-stats > div {
          display: grid;
          gap: 7px;
          padding: 14px;
          border: 1px solid #f4e6da;
          border-radius: 12px;
          background: #fffaf6;
        }

        .group-order-result-stats > div:first-child {
          grid-column: 1 / -1;
          background: #fff0e3;
        }

        .group-order-result-stats span {
          color: #777a81;
          font-size: 11px;
        }

        .group-order-result-stats strong {
          font-size: 19px;
          overflow-wrap: anywhere;
        }

        .group-order-result-stats > div:first-child strong {
          color: #c96310;
          font-size: 28px;
        }

        .group-order-result-items h3,
        .group-order-member-suggestions h3 {
          margin: 0 0 15px;
          font-size: 15px;
        }

        .group-order-result-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px 0;
          border-bottom: 1px solid #f0f1f3;
        }

        .group-order-result-item-icon {
          display: grid;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 12px;
          background: #fff4e9;
          font-size: 22px;
        }

        .group-order-result-item-info {
          display: grid;
          flex: 1;
          gap: 4px;
          min-width: 0;
        }

        .group-order-result-item-info strong {
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .group-order-result-item-info span,
        .group-order-result-item-info small {
          color: var(--go-muted);
          font-size: 11px;
          line-height: 1.5;
        }

        .group-order-result-item-price {
          flex-shrink: 0;
          font-size: 12px;
        }

        .group-order-member-suggestions {
          display: grid;
          gap: 12px;
          margin-top: 24px;
        }

        .group-order-member-suggestions > div {
          padding: 13px;
          border-radius: 12px;
          background: #f8f9fb;
        }

        .group-order-member-suggestions strong {
          font-size: 12px;
        }

        .group-order-member-suggestions p {
          margin: 5px 0 0;
          color: var(--go-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .group-order-regenerate {
          width: 100%;
          min-height: 46px;
          margin-top: 22px;
          border: 1px solid #f2c39f;
          border-radius: 11px;
          background: #fff;
          color: #cf6816;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: background .2s;
        }

        .group-order-regenerate:hover {
          background: #fff5ec;
        }

        @keyframes group-order-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes group-order-bob {
          from { transform: translateY(0); }
          to { transform: translateY(-9px); }
        }

        @keyframes group-order-progress {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(280%); }
        }

        @media (max-width: 900px) {
          .group-order-layout {
            grid-template-columns: 1fr;
          }

          .group-order-result-panel {
            position: static;
          }

          .group-order-hero {
            padding: 34px;
          }
        }

        @media (max-width: 560px) {
          .group-order-page {
            width: calc(100% - 24px);
            margin-top: 16px;
          }

          .group-order-hero {
            padding: 27px 22px;
            border-radius: 20px;
          }

          .group-order-hero-emoji {
            display: none;
          }

          .group-order-hero h1 {
            font-size: 32px;
          }

          .group-order-hero-content > p {
            font-size: 13px;
          }

          .group-order-highlights {
            gap: 7px;
          }

          .group-order-highlights span {
            font-size: 10px;
          }

          .group-order-form-card,
          .group-order-empty,
          .group-order-loading,
          .group-order-results {
            padding: 20px;
          }

          .group-order-section-heading h2 {
            font-size: 19px;
          }

          .group-order-member-card {
            padding: 14px;
          }

          .group-order-member-fields {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .group-order-result-stats {
            gap: 8px;
          }

          .group-order-result-stats > div {
            padding: 11px;
          }

          .group-order-result-stats strong {
            font-size: 16px;
          }
        }
      `}</style>
    </main>
  );
}