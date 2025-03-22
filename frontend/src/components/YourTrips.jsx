// src/components/YourTrips.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Container,
} from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const YourTrips = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreVisible, setMoreVisible] = useState(false);
  const [user, setUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchItineraries = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Use backticks for template literals
        const response = await fetch(
          `http://localhost:2200/api/view/user/${user.uid}`
        );
        const data = await response.json();

        // data should be an array of itinerary objects
        // Show last 3 if more than 3 exist
        let itineraryDocs = data;
        if (itineraryDocs.length > 3) {
          setMoreVisible(true);
          itineraryDocs = itineraryDocs.slice(-3);
        } else {
          setMoreVisible(false);
        }

        setItineraries(itineraryDocs);
      } catch (error) {
        console.error("Error fetching itineraries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [user]);

  if (loading) {
    return <Typography align="center">Loading your trips...</Typography>;
  }

  if (!user || itineraries.length === 0) return null;

  return (
    <Container sx={{ mt: 10 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Your Trips
        </Typography>
        {moreVisible && <Button variant="text">More</Button>}
      </Box>

      <Grid container spacing={3}>
        {itineraries.map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, height: "100%", p: 2 }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {trip.tripName}
                </Typography>
                <Typography variant="body2">Start: {trip.startDate}</Typography>
                <Typography variant="body2">End: {trip.endDate}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default YourTrips;
