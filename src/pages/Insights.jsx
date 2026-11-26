import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../firebase.js";
import {
  DEFAULT_RANGE,
  RANGES,
  buildInsights,
  normalizeCheckIn,
} from "../components/InsightsUtils.js";

export default function Insights({ user }) {
  const [checkIns, setCheckIns] = useState([]);
  const [rangeDays, setRangeDays] = useState(DEFAULT_RANGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCheckIns() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "checkIns")
        );

        setCheckIns(
          snapshot.docs.map((item) => normalizeCheckIn(item.id, item.data()))
        );
      } catch (loadError) {
        console.error(loadError);
        setError("We could not load your insights. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCheckIns();
  }, [user?.uid]);

  const insights = useMemo(
    () => buildInsights(checkIns, rangeDays),
    [checkIns, rangeDays]
  );

  const selectedLabel = RANGES.find((range) => range.id === rangeDays)?.label;

  if (loading) {
    return (
      <main className="dashboard">
        <p role="status">Loading your insights...</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <h1>Insights</h1>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <div className="activity-options" role="group" aria-label="Time range">
        {RANGES.map((range) => (
          <button
            type="button"
            key={range.id}
            className={
              rangeDays === range.id ? "activity-option selected" : "activity-option"
            }
            aria-pressed={rangeDays === range.id}
            onClick={() => setRangeDays(range.id)}
          >
            {range.label}
          </button>
        ))}
      </div>

      {insights.total === 0 ? (
        <p>
          No check-ins in this time range. Try a longer range, or complete a
          check-in.
        </p>
      ) : (
        <div className="dashboard-grid">
          <section className="dashboard-card">
            <p className="card-label">{selectedLabel}</p>
            <h2>Check-in totals</h2>
            <p className="insight-number">{insights.total}</p>
            <p>
              {insights.total === 1 ? "check-in" : "check-ins"} across{" "}
              {insights.daysWithCheckIns}{" "}
              {insights.daysWithCheckIns === 1 ? "day" : "days"}
            </p>
          </section>

          <section className="dashboard-card">
            <p className="card-label">{selectedLabel}</p>
            <h2>Daily feelings</h2>
            <ol className="insight-list">
              {insights.daily.map((day) => (
                <li key={day.dateKey}>
                  <strong>
                    {day.date.toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </strong>
                  : {day.feelings.join(", ")}
                </li>
              ))}
            </ol>
          </section>

          <section className="dashboard-card">
            <p className="card-label">{selectedLabel}</p>
            <h2>Common influences</h2>
            {insights.influences.length > 0 ? (
              <ol className="insight-list">
                {insights.influences.map((influence) => (
                  <li key={influence.label.toLowerCase()}>
                    {influence.label}: {influence.count}{" "}
                    {influence.count === 1 ? "time" : "times"}
                  </li>
                ))}
              </ol>
            ) : (
              <p>No influences were recorded in this time range.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
