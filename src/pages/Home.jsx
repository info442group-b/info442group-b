import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import ActivityCard, { ACTIVITIES } from "../components/ActivityCard.jsx";

function convertToDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value.seconds) {
    return new Date(value.seconds * 1000);
  }

  const convertedDate = new Date(value);

  return Number.isNaN(convertedDate.getTime()) ? null : convertedDate;
}

function isToday(date) {
  if (!date) {
    return false;
  }

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function getReminderText(reminder) {
  return (
    reminder.title ||
    reminder.text ||
    reminder.message ||
    reminder.name ||
    "Reminder"
  );
}

export default function Home({ user }) {
  const navigate = useNavigate();

  const [checkIns, setCheckIns] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState(
    ACTIVITIES[0].id
  );
  const [openedActivityId, setOpenedActivityId] = useState(null);
  const [reminderLimit, setReminderLimit] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const checkInsReference = collection(
          db,
          "users",
          user.uid,
          "checkIns"
        );

        const remindersReference = collection(
          db,
          "users",
          user.uid,
          "reminders"
        );

        const [checkInsSnapshot, remindersSnapshot] = await Promise.all([
          getDocs(checkInsReference),
          getDocs(remindersReference),
        ]);

        const loadedCheckIns = checkInsSnapshot.docs
          .map((checkInDocument) => {
            const data = checkInDocument.data();

            return {
              id: checkInDocument.id,
              ...data,
              date: convertToDate(data.createdAt || data.timestamp),
            };
          })
          .sort((first, second) => {
            const firstTime = first.date?.getTime() || 0;
            const secondTime = second.date?.getTime() || 0;

            return secondTime - firstTime;
          });

        const reminderMap = new Map();

        remindersSnapshot.docs.forEach((reminderDocument) => {
          const reminder = {
            id: reminderDocument.id,
            ...reminderDocument.data(),
          };

          if (!reminder.type) return;

          const reminderText = getReminderText(reminder);
          const duplicateKey = reminderText.trim().toLowerCase();

          if (!reminderMap.has(duplicateKey)) {
            reminderMap.set(duplicateKey, reminder);
          }
        });

        setCheckIns(loadedCheckIns);
        setReminders(Array.from(reminderMap.values()));
      } catch (loadError) {
        console.error(loadError);
        setError("We could not load your dashboard. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const todaysCheckIn = useMemo(
    () => checkIns.find((checkIn) => isToday(checkIn.date)),
    [checkIns]
  );

  const selectedActivity =
    ACTIVITIES.find(
      (activity) => activity.id === selectedActivityId
    ) || ACTIVITIES[0];

  const visibleReminders = reminders.slice(0, reminderLimit);
  const hasMoreReminders = reminderLimit < reminders.length;

  if (openedActivityId) {
    return (
      <ActivityCard
        initialActivityId={openedActivityId}
        onBack={() => setOpenedActivityId(null)}
      />
    );
  }

  if (loading) {
    return (
      <main className="dashboard">
        <p role="status">Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow">Your daily space</p>
          <h1>How are you feeling today?</h1>
          <p>
            Welcome back, {user?.displayName || user?.email || "friend"}.
          </p>
        </div>
      </header>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <div className="dashboard-grid">
        <section className="dashboard-card check-in-card">
          <p className="card-label">Daily check-in</p>
          <h2>Today&apos;s check-in</h2>

          {todaysCheckIn ? (
            <>
              <p>You have completed today&apos;s check-in.</p>
              <p className="feeling-value">
                Feeling:{" "}
                <strong>
                  {todaysCheckIn.feeling ||
                    todaysCheckIn.mood ||
                    "Recorded"}
                </strong>
              </p>

              {(todaysCheckIn.note || todaysCheckIn.notes) && (
                <p className="check-in-note">
                  “{todaysCheckIn.note || todaysCheckIn.notes}”
                </p>
              )}

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/check-in")}
              >
                Update check-in
              </button>
            </>
          ) : (
            <>
              <p>
                Take a moment to record how you are feeling. Your response is
                private to your account.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => navigate("/check-in")}
              >
                Start Check-in
              </button>
            </>
          )}
        </section>

        <section className="dashboard-card activity-suggestions-card">
          <p className="card-label">Activity suggestions</p>
          <h2>Choose something supportive</h2>

          <div className="activity-options" aria-label="Activity suggestions">
            {ACTIVITIES.map((activity) => (
              <button
                type="button"
                key={activity.id}
                className={
                  selectedActivityId === activity.id
                    ? "activity-option selected"
                    : "activity-option"
                }
                onClick={() => setSelectedActivityId(activity.id)}
              >
                <span>{activity.title}</span>
                <small>{activity.minutes} min</small>
              </button>
            ))}
          </div>

          <div className="selected-activity-details">
            <h3>{selectedActivity.title}</h3>
            <p>{selectedActivity.description}</p>
            <p>About {selectedActivity.minutes} minutes</p>

            <button
              type="button"
              className="primary-button"
              onClick={() => setOpenedActivityId(selectedActivity.id)}
            >
              Open Activity
            </button>
          </div>
        </section>

        <section className="dashboard-card insights-card">
          <p className="card-label">Insights</p>
          <h2>Your check-in history</h2>

          {checkIns.length > 0 ? (
            <>
              <p className="insight-number">{checkIns.length}</p>
              <p>
                {checkIns.length === 1
                  ? "check-in recorded"
                  : "check-ins recorded"}
              </p>
            </>
          ) : (
            <p>
              Your insights will appear after you complete your first
              check-in.
            </p>
          )}

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/insights")}
          >
            View Insights
          </button>
        </section>

        <section className="dashboard-card reminders-card">
          <p className="card-label">Reminders</p>
          <h2>Your reminders</h2>

          {visibleReminders.length > 0 ? (
            <ul className="reminder-list">
              {visibleReminders.map((reminder) => (
                <li key={reminder.id}>{getReminderText(reminder)}</li>
              ))}
            </ul>
          ) : (
            <p>
              You do not have any reminders yet. You can manage reminders in
              Settings.
            </p>
          )}

          {hasMoreReminders && (
            <button
              type="button"
              className="text-button"
              onClick={() =>
                setReminderLimit((currentLimit) => currentLimit + 10)
              }
            >
              + View 10 More
            </button>
          )}

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/settings")}
          >
            Manage Reminders
          </button>
        </section>
      </div>
    </main>
  );
}