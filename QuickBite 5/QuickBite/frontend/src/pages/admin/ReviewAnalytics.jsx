import { useState } from "react";
import { analyzeRestaurantReviews } from "../../services/aiService";

export default function ReviewAnalytics() {
  const [reviewsText, setReviewsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const analyzeReviews = async (event) => {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    const reviews = reviewsText
      .split("\n")
      .map((review) => review.trim())
      .filter(Boolean);

    if (reviews.length === 0) {
      setError("Please enter at least one customer review.");
      return;
    }

    setLoading(true);

    try {
      const response = await analyzeRestaurantReviews({ reviews });

      if (response.success === false) {
        throw new Error(response.message || "Review analysis failed.");
      }

      setAnalysis(response.data || response.result || response);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const sentiment = analysis?.sentiment || {};
  const aspects = analysis?.aspects || analysis?.aspectAnalysis || {};

  const totalReviews =
    analysis?.totalReviews ??
    analysis?.total ??
    analysis?.reviews?.length ??
    0;

  const positive =
    sentiment.positive ??
    analysis?.positive ??
    analysis?.positiveCount ??
    0;

  const neutral =
    sentiment.neutral ??
    analysis?.neutral ??
    analysis?.neutralCount ??
    0;

  const negative =
    sentiment.negative ??
    analysis?.negative ??
    analysis?.negativeCount ??
    0;

  const percentage = (value) => {
    if (typeof value === "string" && value.includes("%")) {
      return Number.parseFloat(value) || 0;
    }

    const number = Number(value) || 0;

    if (number > 0 && number <= 1) {
      return number * 100;
    }

    return number;
  };

  const formatPercent = (value) =>
    `${Math.min(100, Math.max(0, percentage(value))).toFixed(1)}%`;

  const aspectLabels = {
    taste: "Food Taste",
    delivery: "Delivery",
    packaging: "Packaging",
    quality: "Food Quality",
    price: "Pricing",
    service: "Customer Service",
  };

  const getAspectValue = (value) => {
    if (typeof value === "number" || typeof value === "string") {
      return percentage(value);
    }

    if (value && typeof value === "object") {
      return percentage(
        value.positivePercentage ??
          value.positive ??
          value.score ??
          value.percentage ??
          0
      );
    }

    return 0;
  };

  const demoReviews = [
    "The food was delicious and delivery was super fast.",
    "Amazing taste, great packaging, and excellent service.",
    "The pizza was cold and delivery took too long.",
    "Good quality food but the price was a little high.",
    "Loved the burger. Fresh ingredients and quick delivery.",
  ];

  const loadSampleReviews = () => {
    setReviewsText(demoReviews.join("\n"));
    setAnalysis(null);
    setError("");
  };

  const clearReviews = () => {
    setReviewsText("");
    setAnalysis(null);
    setError("");
  };

  return (
    <main className="review-analytics-page">
      <header className="ra-header">
        <div>
          <span className="ra-eyebrow">QUICKBITE ADMIN PANEL</span>
          <h1>Review Analytics</h1>
          <p>
            Understand customer feedback and discover what makes your customers
            happy or unhappy.
          </p>
        </div>

        <div className="ra-header-icon">📊</div>
      </header>

      <section className="ra-overview">
        <article className="ra-overview-card">
          <div className="ra-overview-icon ra-orange">💬</div>
          <div>
            <span>Reviews Analyzed</span>
            <strong>{totalReviews}</strong>
            <small>Customer feedback processed</small>
          </div>
        </article>

        <article className="ra-overview-card">
          <div className="ra-overview-icon ra-green">😊</div>
          <div>
            <span>Positive Reviews</span>
            <strong>{positive}</strong>
            <small>Happy customer feedback</small>
          </div>
        </article>

        <article className="ra-overview-card">
          <div className="ra-overview-icon ra-red">😟</div>
          <div>
            <span>Negative Reviews</span>
            <strong>{negative}</strong>
            <small>Feedback needing attention</small>
          </div>
        </article>

        <article className="ra-overview-card">
          <div className="ra-overview-icon ra-blue">😐</div>
          <div>
            <span>Neutral Reviews</span>
            <strong>{neutral}</strong>
            <small>Neither positive nor negative</small>
          </div>
        </article>
      </section>

      <div className="ra-main-grid">
        <section className="ra-panel ra-input-panel">
          <div className="ra-panel-heading">
            <div>
              <span className="ra-step">ANALYSIS INPUT</span>
              <h2>Customer Reviews</h2>
              <p>Enter one review per line.</p>
            </div>
            <span className="ra-heading-icon">📝</span>
          </div>

          <form onSubmit={analyzeReviews}>
            <textarea
              className="ra-textarea"
              value={reviewsText}
              onChange={(event) => setReviewsText(event.target.value)}
              placeholder={
                "The food was delicious and delivery was fast.\nThe packaging was damaged.\nGreat quality at a reasonable price."
              }
              rows={9}
            />

            <div className="ra-input-footer">
              <span>
                {reviewsText.split("\n").filter((line) => line.trim()).length}{" "}
                reviews entered
              </span>

              <button
                type="button"
                className="ra-text-button"
                onClick={loadSampleReviews}
              >
                Load sample data
              </button>
            </div>

            {error && (
              <div className="ra-error" role="alert">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="ra-analyze-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="ra-spinner" />
                  Analyzing reviews...
                </>
              ) : (
                <>✨ Analyze Customer Feedback</>
              )}
            </button>

            <button
              type="button"
              className="ra-clear-button"
              onClick={clearReviews}
            >
              Clear all reviews
            </button>
          </form>
        </section>

        <section className="ra-panel ra-sentiment-panel">
          <div className="ra-panel-heading">
            <div>
              <span className="ra-step">CUSTOMER SENTIMENT</span>
              <h2>Sentiment Overview</h2>
              <p>Review sentiment distribution.</p>
            </div>
            <span className="ra-heading-icon">🎯</span>
          </div>

          {!analysis ? (
            <div className="ra-empty-state">
              <div>📈</div>
              <h3>Your analysis will appear here</h3>
              <p>
                Submit customer reviews to view the sentiment distribution and
                customer feedback insights.
              </p>
            </div>
          ) : (
            <>
              <div className="ra-sentiment-total">
                <span>Total analyzed reviews</span>
                <strong>{totalReviews}</strong>
              </div>

              <div className="ra-sentiment-bars">
                <div className="ra-sentiment-row">
                  <div className="ra-sentiment-label">
                    <span>😊 Positive</span>
                    <strong>{formatPercent(sentiment.positivePercentage ?? analysis.positivePercentage ?? positive)}</strong>
                  </div>
                  <div className="ra-progress-track">
                    <span
                      className="ra-progress-positive"
                      style={{
                        width: formatPercent(
                          sentiment.positivePercentage ??
                            analysis.positivePercentage ??
                            positive
                        ),
                      }}
                    />
                  </div>
                </div>

                <div className="ra-sentiment-row">
                  <div className="ra-sentiment-label">
                    <span>😐 Neutral</span>
                    <strong>{formatPercent(sentiment.neutralPercentage ?? analysis.neutralPercentage ?? neutral)}</strong>
                  </div>
                  <div className="ra-progress-track">
                    <span
                      className="ra-progress-neutral"
                      style={{
                        width: formatPercent(
                          sentiment.neutralPercentage ??
                            analysis.neutralPercentage ??
                            neutral
                        ),
                      }}
                    />
                  </div>
                </div>

                <div className="ra-sentiment-row">
                  <div className="ra-sentiment-label">
                    <span>😟 Negative</span>
                    <strong>{formatPercent(sentiment.negativePercentage ?? analysis.negativePercentage ?? negative)}</strong>
                  </div>
                  <div className="ra-progress-track">
                    <span
                      className="ra-progress-negative"
                      style={{
                        width: formatPercent(
                          sentiment.negativePercentage ??
                            analysis.negativePercentage ??
                            negative
                        ),
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="ra-sentiment-legend">
                <div>
                  <span className="ra-dot ra-dot-positive" />
                  Positive: {positive}
                </div>
                <div>
                  <span className="ra-dot ra-dot-neutral" />
                  Neutral: {neutral}
                </div>
                <div>
                  <span className="ra-dot ra-dot-negative" />
                  Negative: {negative}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="ra-panel ra-aspects-panel">
        <div className="ra-panel-heading">
          <div>
            <span className="ra-step">DETAILED INSIGHTS</span>
            <h2>Aspect-wise Feedback</h2>
            <p>
              Understand customer sentiment around different parts of the
              experience.
            </p>
          </div>
          <span className="ra-heading-icon">🔎</span>
        </div>

        {!analysis ? (
          <div className="ra-aspects-placeholder">
            Run an analysis to view feedback about food taste, delivery,
            packaging, quality, pricing, and customer service.
          </div>
        ) : Object.keys(aspects).length === 0 ? (
          <div className="ra-aspects-placeholder">
            No aspect-wise results were returned by the backend. Check the
            response format from reviewAnalysisService.js.
          </div>
        ) : (
          <div className="ra-aspect-grid">
            {Object.entries(aspects).map(([key, value]) => {
              const score = Math.min(100, Math.max(0, getAspectValue(value)));
              const label = aspectLabels[key] || key.replace(/([A-Z])/g, " $1");

              return (
                <article className="ra-aspect-card" key={key}>
                  <div className="ra-aspect-top">
                    <span>{label}</span>
                    <strong>{score.toFixed(1)}%</strong>
                  </div>
                  <div className="ra-progress-track">
                    <span
                      className="ra-progress-aspect"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p>
                    {value && typeof value === "object" && value.positive != null
                      ? `${value.positive} positive mentions`
                      : "Positive feedback indicator"}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {analysis && (
        <section className="ra-panel ra-insights-panel">
          <div className="ra-panel-heading">
            <div>
              <span className="ra-step">ACTIONABLE FEEDBACK</span>
              <h2>What to focus on next</h2>
            </div>
            <span className="ra-heading-icon">💡</span>
          </div>

          <div className="ra-insight-grid">
            <article>
              <span className="ra-insight-icon">🌟</span>
              <h3>Build on positive feedback</h3>
              <p>
                Review the positive comments to identify what customers
                appreciate and maintain those standards.
              </p>
            </article>

            <article>
              <span className="ra-insight-icon">🛠️</span>
              <h3>Address negative feedback</h3>
              <p>
                Check negative comments for recurring concerns about delivery,
                food quality, packaging, and pricing.
              </p>
            </article>

            <article>
              <span className="ra-insight-icon">📦</span>
              <h3>Improve the customer experience</h3>
              <p>
                Use recurring feedback to prioritize improvements and monitor
                future reviews for changes.
              </p>
            </article>
          </div>
        </section>
      )}

      <p className="ra-disclaimer">
        QuickBite uses the configured backend review-analysis service to
        categorize feedback. Review classifications may not capture sarcasm
        or every context correctly.
      </p>

      <style>{`
        .review-analytics-page {
          --ra-orange: #fc8019;
          --ra-text: #202124;
          --ra-muted: #747780;
          --ra-border: #eceef2;
          width: min(1250px, calc(100% - 40px));
          margin: 32px auto 60px;
          color: var(--ra-text);
          font-family: inherit;
        }

        .ra-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .ra-eyebrow,
        .ra-step {
          color: var(--ra-orange);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .ra-header h1 {
          margin: 10px 0;
          font-size: clamp(28px, 4vw, 38px);
          letter-spacing: -1.1px;
        }

        .ra-header p {
          max-width: 650px;
          margin: 0;
          color: var(--ra-muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .ra-header-icon {
          display: grid;
          width: 72px;
          height: 72px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 22px;
          background: #fff0e3;
          font-size: 34px;
        }

        .ra-overview {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .ra-overview-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          min-width: 0;
          padding: 20px;
          border: 1px solid var(--ra-border);
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 5px 25px rgba(30, 35, 45, .025);
        }

        .ra-overview-icon {
          display: grid;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 13px;
          font-size: 20px;
        }

        .ra-orange { background: #fff0e3; }
        .ra-green { background: #e5f8ed; }
        .ra-red { background: #fff0ee; }
        .ra-blue { background: #eaf3ff; }

        .ra-overview-card > div:last-child {
          display: grid;
          gap: 6px;
          min-width: 0;
        }

        .ra-overview-card span {
          color: var(--ra-muted);
          font-size: 11px;
          line-height: 1.5;
        }

        .ra-overview-card strong {
          font-size: 27px;
          line-height: 1.1;
          overflow-wrap: anywhere;
        }

        .ra-overview-card small {
          color: #999ca3;
          font-size: 10px;
          line-height: 1.5;
        }

        .ra-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 22px;
          align-items: stretch;
        }

        .ra-panel {
          min-width: 0;
          padding: 26px;
          border: 1px solid var(--ra-border);
          border-radius: 19px;
          background: #fff;
          box-shadow: 0 5px 25px rgba(30, 35, 45, .025);
        }

        .ra-panel-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 22px;
        }

        .ra-panel-heading h2 {
          margin: 8px 0 5px;
          font-size: 21px;
          letter-spacing: -.5px;
        }

        .ra-panel-heading p {
          margin: 0;
          color: var(--ra-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .ra-heading-icon {
          display: grid;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 13px;
          background: #fff4e9;
          font-size: 21px;
        }

        .ra-textarea {
          box-sizing: border-box;
          display: block;
          width: 100%;
          min-height: 220px;
          resize: vertical;
          padding: 15px;
          border: 1px solid #e2e5e9;
          border-radius: 12px;
          outline: none;
          background: #fcfcfd;
          color: #303238;
          font: inherit;
          font-size: 13px;
          line-height: 1.8;
          transition: border-color .2s, box-shadow .2s;
        }

        .ra-textarea:focus {
          border-color: var(--ra-orange);
          box-shadow: 0 0 0 3px rgba(252, 128, 25, .1);
        }

        .ra-textarea::placeholder {
          color: #a3a5aa;
        }

        .ra-input-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }

        .ra-input-footer > span {
          color: var(--ra-muted);
          font-size: 11px;
        }

        .ra-text-button {
          padding: 5px 0;
          border: 0;
          background: transparent;
          color: #d66c17;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .ra-analyze-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          min-height: 48px;
          margin-top: 20px;
          padding: 12px 16px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(110deg, #fc8019, #ff9c4b);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 15px rgba(252, 128, 25, .15);
          transition: transform .2s;
        }

        .ra-analyze-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .ra-analyze-button:disabled {
          cursor: wait;
          opacity: .7;
        }

        .ra-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, .4);
          border-top-color: white;
          border-radius: 50%;
          animation: ra-spin .7s linear infinite;
        }

        .ra-clear-button {
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          border: 1px solid #e7e8eb;
          border-radius: 10px;
          background: #fff;
          color: #555861;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .ra-clear-button:hover {
          background: #f8f9fb;
        }

        .ra-error {
          margin-top: 12px;
          padding: 12px;
          border: 1px solid #f3c4bf;
          border-radius: 10px;
          background: #fff3f1;
          color: #a82e23;
          font-size: 12px;
          line-height: 1.6;
        }

        .ra-empty-state {
          display: flex;
          min-height: 285px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 15px;
          text-align: center;
        }

        .ra-empty-state > div {
          display: grid;
          width: 76px;
          height: 76px;
          margin-bottom: 17px;
          place-items: center;
          border-radius: 24px;
          background: #fff2e6;
          font-size: 37px;
        }

        .ra-empty-state h3 {
          margin: 0 0 8px;
          font-size: 16px;
        }

        .ra-empty-state p {
          max-width: 300px;
          margin: 0;
          color: var(--ra-muted);
          font-size: 12px;
          line-height: 1.8;
        }

        .ra-sentiment-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 15px;
          border: 1px solid #f3e4d8;
          border-radius: 12px;
          background: #fffaf6;
        }

        .ra-sentiment-total span {
          color: #686b73;
          font-size: 12px;
        }

        .ra-sentiment-total strong {
          color: #cf6816;
          font-size: 24px;
        }

        .ra-sentiment-bars {
          display: grid;
          gap: 23px;
          margin-top: 27px;
        }

        .ra-sentiment-row {
          display: grid;
          gap: 10px;
        }

        .ra-sentiment-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 12px;
        }

        .ra-sentiment-label strong {
          font-size: 12px;
        }

        .ra-progress-track {
          width: 100%;
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: #f0f1f3;
        }

        .ra-progress-track > span {
          display: block;
          height: 100%;
          border-radius: inherit;
          transition: width .45s ease;
        }

        .ra-progress-positive { background: #29b56b; }
        .ra-progress-neutral { background: #8d98a8; }
        .ra-progress-negative { background: #ee5b50; }
        .ra-progress-aspect { background: linear-gradient(90deg, #fc8019, #ffb16e); }

        .ra-sentiment-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--ra-border);
        }

        .ra-sentiment-legend > div {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #646770;
          font-size: 11px;
        }

        .ra-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .ra-dot-positive { background: #29b56b; }
        .ra-dot-neutral { background: #8d98a8; }
        .ra-dot-negative { background: #ee5b50; }

        .ra-aspects-panel,
        .ra-insights-panel {
          margin-top: 22px;
        }

        .ra-aspects-placeholder {
          padding: 26px 18px;
          border: 1px dashed #e3e5e9;
          border-radius: 12px;
          background: #fcfcfd;
          color: var(--ra-muted);
          font-size: 13px;
          line-height: 1.8;
          text-align: center;
        }

        .ra-aspect-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .ra-aspect-card {
          min-width: 0;
          padding: 19px;
          border: 1px solid #eceef2;
          border-radius: 14px;
          background: #fdfdfd;
        }

        .ra-aspect-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 15px;
        }

        .ra-aspect-top span {
          font-size: 12px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .ra-aspect-top strong {
          color: #d76b16;
          font-size: 13px;
        }

        .ra-aspect-card p {
          margin: 12px 0 0;
          color: #92959c;
          font-size: 11px;
          line-height: 1.6;
        }

        .ra-insight-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .ra-insight-grid article {
          padding: 20px;
          border: 1px solid #eceef2;
          border-radius: 14px;
          background: #fff;
        }

        .ra-insight-icon {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 13px;
          background: #fff1e5;
          font-size: 21px;
        }

        .ra-insight-grid h3 {
          margin: 15px 0 8px;
          font-size: 14px;
          line-height: 1.5;
        }

        .ra-insight-grid p {
          margin: 0;
          color: var(--ra-muted);
          font-size: 12px;
          line-height: 1.8;
        }

        .ra-disclaimer {
          margin: 22px 0 0;
          color: #92959c;
          font-size: 11px;
          line-height: 1.8;
          text-align: center;
        }

        @keyframes ra-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1050px) {
          .ra-overview {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ra-main-grid {
            grid-template-columns: 1fr;
          }

          .ra-aspect-grid,
          .ra-insight-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 560px) {
          .review-analytics-page {
            width: calc(100% - 24px);
            margin-top: 20px;
          }

          .ra-header-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            font-size: 26px;
          }

          .ra-header h1 {
            font-size: 28px;
          }

          .ra-header p {
            font-size: 12px;
          }

          .ra-overview {
            gap: 10px;
          }

          .ra-overview-card {
            gap: 9px;
            padding: 13px;
          }

          .ra-overview-icon {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            font-size: 16px;
          }

          .ra-overview-card strong {
            font-size: 22px;
          }

          .ra-overview-card span {
            font-size: 10px;
          }

          .ra-overview-card small {
            font-size: 9px;
          }

          .ra-panel {
            padding: 19px;
          }

          .ra-panel-heading h2 {
            font-size: 19px;
          }

          .ra-aspect-grid,
          .ra-insight-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}