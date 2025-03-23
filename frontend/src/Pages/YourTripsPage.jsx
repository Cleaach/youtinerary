import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

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

    // Query all itinerary docs for the current user
    const itinerariesRef = collection(db, "itineraries");
    const q = query(itinerariesRef, where("userId", "==", user.uid));

    // Real-time listener
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
    return <Typography align="center">Loading all your trips...</Typography>;
  }

  if (!user) {
    return (
      <Typography align="center">Please sign in to view your trips.</Typography>
    );
  }

  if (trips.length === 0) {
    return <Typography align="center">You have no trips yet.</Typography>;
  }

  return (
    <>
      <Header />
      <Container sx={{ mt: 10 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          All Your Trips
        </Typography>
        <Grid container spacing={3}>
          {trips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip.id}>
              <Link to={`/view/${trip.id}`} style={{ textDecoration: "none" }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    p: 2,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                      cursor: "pointer",
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {trip.tripName}
                    </Typography>
                    <Typography variant="body2">Start: {trip.startDate}</Typography>
                    <Typography variant="body2">End: {trip.endDate}</Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default YourTripsPage;
