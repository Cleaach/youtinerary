// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";

// import CreateTripPage from "./pages/CreateTripPage";
import SignInPage from "./Pages/SignInPage";
import YourTripsPage from "./Pages/YourTripsPage.jsx";
import AllTripsPage from "./Pages/AllTripsPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/your-trips" element={<YourTripsPage />} />
        <Route path="/all-trips" element={<AllTripsPage />} />

        {/* <Route path="/community-trips" element={<CommunityTripsPage />} /> */}
        {/* Optional catch-all for 404, if you want */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
