import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Top Nav */}
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left side: Logo + Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Replace with your own logo image or icon */}

            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              YOUtinerary
            </Typography>
          </Box>

          {/* Right side: Community Trips + Sign In */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/signin")}
              sx={{ borderColor: "black", color: "black" }}
            >
              Sign In
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

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
          YOUtinerary takes the stress out of travel planning by using AI to
          create smart, personalized itineraries in seconds. Whether you're
          escaping for the weekend or exploring the world, we handle the
          planning—so you can focus on the adventure.
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
    </>
  );
};

export default Home;
