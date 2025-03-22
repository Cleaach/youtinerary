// src/pages/AllTripsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import Header from "../components/Header"; // ✅ Import Header

const AllTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const itinerariesRef = collection(db, "itineraries");

    const unsubscribe = onSnapshot(itinerariesRef, async (snapshot) => {
      let fetchedTrips = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      fetchedTrips = fetchedTrips.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      const uniqueUserIds = new Set(fetchedTrips.map((trip) => trip.userId));
      const newUserMap = { ...userMap };

      for (let uid of uniqueUserIds) {
        if (!newUserMap[uid]) {
          const userDocSnap = await getDoc(doc(db, "users", uid));
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            newUserMap[uid] = userData.username || uid;
          } else {
            newUserMap[uid] = uid;
          }
        }
      }

      setUserMap(newUserMap);
      setTrips(fetchedTrips);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <Typography align="center" sx={{ mt: 10 }}>
          Loading all trips...
        </Typography>
      </>
    );
  }

  if (trips.length === 0) {
    return (
      <>
        <Header />
        <Typography align="center" sx={{ mt: 10 }}>
          No trips found.
        </Typography>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container sx={{ mt: 10 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            All Trips
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {trips.map((trip) => {
            const username = userMap[trip.userId] || "Unknown User";
            return (
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
                    <Typography variant="body2">End: {trip.endDate}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Created by: {username}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </>
  );
};

export default AllTripsPage;
