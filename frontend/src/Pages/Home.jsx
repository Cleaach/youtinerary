import React from "react";
import { Typography, Button, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import YourTrips from "../components/YourTrips";
import AllTrips from "../components/AllTrips";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            backgroundImage: 'url("/images/703892.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "100%",
            py: 10,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
            },
          }}
        >
          <Container
            sx={{
              textAlign: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold", color: "white" }}
            >
              Plan Less. Travel More.
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                mt: 2,
                maxWidth: 600,
                margin: "0 auto",
              }}
            >
              Whether you're escaping for the weekend or exploring the world,
              let our AI handle the planning—so YOU can focus on the adventure.
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
        </Box>

        <YourTrips />
        <AllTrips />
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
