// src/components/YourTrips.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const YourTrips = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreVisible, setMoreVisible] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribeAuth;
  }, []);

  // Fetch & listen to the user's itineraries in real-time
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Query for docs where userId == current user's UID
    const itinerariesRef = collection(db, "itineraries");
    const q = query(itinerariesRef, where("userId", "==", user.uid));

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // If more than 3, slice to last 3
      if (docs.length > 3) {
        setMoreVisible(true);
        docs = docs.slice(-3);
      } else {
        setMoreVisible(false);
      }

      setItineraries(docs);
      setLoading(false);
    });

    return () => unsubscribe();
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
        {moreVisible && (
          <Button variant="text" onClick={() => navigate("/your-trips")}>
            More
          </Button>
        )}
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
