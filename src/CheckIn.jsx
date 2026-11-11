import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase.js";

export default function CheckIn({ user }) {
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!mood) {
      setError("Please select how you are feeling.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await addDoc(collection(db, "users", user.uid, "checkIns"), {
        mood,
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
    <main>
      <h1>Daily Check-in</h1>

      <form onSubmit={handleSubmit}>
        <div>
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

        <div>
          <label htmlFor="notes">Notes (optional)</label>

          <textarea
            id="notes"
            value={notes}
            disabled={isSaving}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Write anything you would like to remember."
          />
        </div>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Check-in"}
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => navigate("/home")}
        >
          Cancel
        </button>

        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}