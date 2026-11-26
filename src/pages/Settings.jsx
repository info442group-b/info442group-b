import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../firebase.js";
import Reminders from "../components/Reminders.jsx";

export default function Settings({ user }) {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [textSize, setTextSize] = useState("medium");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const accessibilityReference = doc(
          db,
          "users",
          user.uid,
          "settings",
          "accessibility"
        );

        const accessibilitySnapshot = await getDoc(accessibilityReference);

        if (accessibilitySnapshot.exists()) {
          const accessibilityData = accessibilitySnapshot.data();

          setHighContrast(accessibilityData.highContrast ?? false);
          setReducedMotion(accessibilityData.reducedMotion ?? false);
          setTextSize(accessibilityData.textSize ?? "medium");
        }
      } catch (err) {
        console.error(err);
        setMessage("We could not load your settings. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user.uid]);

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const accessibilityReference = doc(
        db,
        "users",
        user.uid,
        "settings",
        "accessibility"
      );

      await setDoc(
        accessibilityReference,
        {
          highContrast,
          reducedMotion,
          textSize,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMessage("Settings saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage("We could not save your settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p>Loading settings...</p>;
  }

  return (
    <main>
      <h1>Settings</h1>

      <Reminders user={user} />

      <form onSubmit={handleSave}>
        <section>
          <h2>Accessibility</h2>

          <label>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(event) => setHighContrast(event.target.checked)}
            />
            Use high contrast
          </label>

          <label>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(event) => setReducedMotion(event.target.checked)}
            />
            Reduce motion
          </label>

          <div>
            <label htmlFor="text-size">Text size</label>

            <select
              id="text-size"
              value={textSize}
              onChange={(event) => setTextSize(event.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </section>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </button>

        {message && <p role="status">{message}</p>}
      </form>
    </main>
  );
}
