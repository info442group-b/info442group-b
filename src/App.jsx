import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { auth } from "./firebase.js";
import Login from "./Login.jsx";
import Welcome from "./Welcome.jsx";
import CheckIn from "./CheckIn.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./Home.jsx";
import Insights from "./Insights.jsx";
import Settings from "./Settings.jsx";
import Support from "./Support.jsx";

function AppContent() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <header>
        <p>
          Signed in as <strong>{user.displayName || user.email}</strong>
        </p>

        <button type="button" onClick={() => signOut(auth)}>
          Sign out
        </button>
      </header>

      <Routes>
        <Route path="/" element={<Welcome user={user} />} />
        <Route path="/check-in" element={<CheckIn user={user} />} />

        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/insights" element={<Insights />} />
          <Route
            path="/settings"
            element={<Settings user={user} />}
          />
          <Route path="/support" element={<Support />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}