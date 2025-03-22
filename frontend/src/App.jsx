// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your page components
import Home from "./Pages/Home.jsx";
import DragDrop from "./Pages/DragDrop.tsx";

import CreateTripPage from "./Pages/CreateTripPage";
// import SignInPage from "./pages/SignInPage";
// import CommunityTripsPage from "./pages/CommunityTripsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page at the root URL ("/") */}
        <Route path="/" element={<Home />} />

        {/* Other pages (adjust these paths as needed) */}
        <Route path="/create-trip" element={<CreateTripPage />} />
        {/* <Route path="/signin" element={<SignInPage />} />
        <Route path="/community-trips" element={<CommunityTripsPage />} /> */}
        <Route path="/drag-drop" element={<DragDrop />} />
        {/* Optional catch-all for 404, if you want */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
