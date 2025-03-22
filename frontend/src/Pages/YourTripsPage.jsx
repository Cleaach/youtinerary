// src/pages/YourTripsPage.jsx
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import Header from "../components/Header"; // ✅ Added Header import

const YourTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const itinerariesRef = collection(db, "itineraries");
    const q = query(itinerariesRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setTrips(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <>
        <Header /> {/* ✅ Consistent Header */}
        <Typography align="center" sx={{ mt: 10 }}>
          Loading all your trips...
        </Typography>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header /> {/* ✅ Consistent Header */}
        <Typography align="center" sx={{ mt: 10 }}>
          Please sign in to view your trips.
        </Typography>
      </>
    );
  }

  if (trips.length === 0) {
    return (
      <>
        <Header /> {/* ✅ Consistent Header */}
        <Typography align="center" sx={{ mt: 10 }}>
          You have no trips yet.
        </Typography>
      </>
    );
  }

  return (
    <>
      <Header /> {/* ✅ Consistent Header */}
      <Container sx={{ mt: 10 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          All Your Trips
        </Typography>
        <Grid container spacing={3}>
          {trips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip.id}>
              <Card
                variant="outlined"
                sx={{ borderRadius: 3, height: "100%", p: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {trip.tripName}
                  </Typography>
                  <Typography variant="body2">
                    Start: {trip.startDate}
                  </Typography>
                  <Typography variant="body2">
                    End: {trip.endDate}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default YourTripsPage;
