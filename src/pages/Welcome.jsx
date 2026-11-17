import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebase.js";

export default function Welcome({ user }) {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function saveUserProfile(addPrivacyAcknowledgement) {
    const userData = {
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      lastUpdatedAt: serverTimestamp(),
    };

    if (addPrivacyAcknowledgement) {
      userData.privacyAcknowledged = true;
      userData.privacyAcknowledgedAt = serverTimestamp();
    }

    await setDoc(doc(db, "users", user.uid), userData, {
      merge: true,
    });
  }

  async function handleStartCheckIn() {
    if (!privacyAccepted) {
      setError("Please acknowledge the privacy notice before continuing.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await saveUserProfile(true);
      navigate("/check-in");
    } catch (err) {
      console.error(err);
      setError(
        "We could not save your privacy acknowledgement. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSkip() {
    setError("");
    setIsSaving(true);

    try {
      await saveUserProfile(false);
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("We could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main>
      <h1>Welcome, {user.displayName || user.email}</h1>

      <section>
        <h2>Your private check-in</h2>

        <p>
          Take a moment to reflect on how you are feeling. Your check-in
          information will remain private to your account.
        </p>

        <label>
          <input
            type="checkbox"
            checked={privacyAccepted}
            disabled={isSaving}
            onChange={(event) => {
              setPrivacyAccepted(event.target.checked);
              setError("");
            }}
          />
          I understand that my check-in information is private and connected
          to my account.
        </label>

        <div>
          <button
            type="button"
            disabled={!privacyAccepted || isSaving}
            onClick={handleStartCheckIn}
          >
            {isSaving ? "Saving..." : "Start Check-in"}
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSkip}
          >
            Skip for now
          </button>
        </div>

        {error && <p role="alert">{error}</p>}
      </section>
    </main>
  );
}
