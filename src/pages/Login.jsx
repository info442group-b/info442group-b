import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";

export default function Login() {
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleGoogleSignIn() {
    setError("");
    setIsSigningIn(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setError("The sign-in popup was blocked. Please allow popups.");
      } else {
      setError(`Google sign-in failed: ${err.code} — ${err.message}`);
      console.error(err);
      }
    } finally {
      setIsSigningIn(false);
    }
  } 

  return (
    <main>
      <h1>Welcome to Kindly</h1>
      <p>Sign in to continue to your private check-ins.</p>

      <button type="button" className="btn btn-primary form-button" onClick={handleGoogleSignIn} disabled={isSigningIn}>
        {isSigningIn ? "Signing in..." : "Continue with Google"}
      </button>

      {error && 
        <p className="form-error" role="alert">
          {error}
        </p>
      }
    </main>
  );
}
