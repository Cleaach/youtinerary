// src/pages/Home.jsx
import React from "react";
import { Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header"; // ← new header
import YourTrips from "../components/YourTrips";
import AllTrips from "../components/AllTrips";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      {/* Hero Section */}
      <Container
        sx={{
          textAlign: "center",
          mt: 8,
          mb: 8,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: "bold" }}>
          Plan Less. Travel More.
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: "text.secondary",
            mt: 2,
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          Whether you're escaping for the weekend or exploring the world, let
          our AI handle the planning—so YOU can focus on the adventure.
        </Typography>

        <Button
          variant="contained"
          size="large"
          color="success"
          sx={{ mt: 4, px: 4, py: 1.5, fontSize: "1rem", borderRadius: 2 }}
          onClick={() => navigate("/create-trip")}
        >
          Create a new trip
        </Button>
      </Container>

      <YourTrips />
      <AllTrips />
    </>
  );
};

export default Home;
