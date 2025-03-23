// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import DragDrop from "./Pages/DragDrop.tsx";
import ViewItinerary from "./Pages/ViewItinerary.jsx";
import SignInPage from "./Pages/SignInPage";
import CreateTripPage from "./Pages/CreateTripPage.tsx";
import YourTripsPage from "./Pages/YourTripsPage.jsx";
import AllTripsPage from "./Pages/AllTripsPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-trip" element={<CreateTripPage />} />
        <Route path = "/view/:id" element={<ViewItinerary />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/your-trips" element={<YourTripsPage />} />
        <Route path="/all-trips" element={<AllTripsPage />} />
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
