import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase.js";

const FACTORS = [
  "Sleep",
  "Work or school",
  "Relationships",
  "Food",
  "Exercise",
  "Health",
  "Money",
];

//Ensure entered data is same format, easier for data insights
function formatFactor(text) {
  const cleaned = text.trim().replace(/\s+/g, " ").toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default function CheckIn({ user }) {
  const [mood, setMood] = useState("");
  const [factors, setFactors] = useState([]);
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function toggleFactor(factor, checked) {
    setFactors((current) =>
      checked ? [...current, factor] : current.filter((item) => item !== factor)
    );
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!mood) {
      setError("Please select how you are feeling.");
      return;
    }

    const customFactor = otherChecked ? formatFactor(otherText) : "";

    if (otherChecked && !customFactor) {
      setError("Please write your own factor, or uncheck Other.");
      return;
    }

    const influences = [...factors];

    if (
      customFactor &&
      !influences.some((item) => item.toLowerCase() === customFactor.toLowerCase())
    ) {
      influences.push(customFactor);
    }

    if (influences.length === 0) {
      setError("Please select at least one factor that influenced your mood.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await addDoc(collection(db, "users", user.uid, "checkIns"), {
        mood,
        influences,
        notes: notes.trim(),
        createdAt: serverTimestamp(),
      });

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("We could not save your check-in. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="form-page">
      <section className="form-card checkin-card">
      <h1>Daily Check-in</h1>

      <form onSubmit={handleSubmit}>
        <div className="checkin-field">
          <label htmlFor="mood">How are you feeling today?</label>

          <select
            id="mood"
            value={mood}
            disabled={isSaving}
            onChange={(event) => {
              setMood(event.target.value);
              setError("");
            }}
          >
            <option value="">Select a feeling</option>
            <option value="great">Great</option>
            <option value="good">Good</option>
            <option value="okay">Okay</option>
            <option value="low">Low</option>
            <option value="struggling">Struggling</option>
          </select>
        </div>

        <fieldset disabled={isSaving}>
          <legend>What factors influenced your mood today? (required)</legend>

          {FACTORS.map((factor) => (
            <label key={factor}>
              <input
                type="checkbox"
                checked={factors.includes(factor)}
                onChange={(event) => toggleFactor(factor, event.target.checked)}
              />
              {factor}
            </label>
          ))}

          <label>
            <input
              type="checkbox"
              checked={otherChecked}
              onChange={(event) => {
                setOtherChecked(event.target.checked);
                setError("");
              }}
            />
            Other
          </label>

          {otherChecked && (
            <div>
              <label htmlFor="other-factor">Write your own</label>
              <input
                id="other-factor"
                type="text"
                value={otherText}
                maxLength={40}
                onChange={(event) => {
                  setOtherText(event.target.value);
                  setError("");
                }}
              />
            </div>
          )}
        </fieldset>

        <div className="checkin-field">
          <label htmlFor="notes">Notes (optional)</label>

          <textarea
            id="notes"
            rows={4}
            value={notes}
            disabled={isSaving}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Write anything you would like to remember."
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Check-in"}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={isSaving}
          onClick={() => navigate("/home")}
        >
          Cancel
        </button>

        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
      </section>
    </main>
  );
}
