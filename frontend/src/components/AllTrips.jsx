// src/components/AllTrips.jsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function AllTrips() {
  const [trips, setTrips] = useState([]);
  const [userMap, setUserMap] = useState({}); // userId -> username
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const itinerariesRef = collection(db, "itineraries");
    const unsubscribe = onSnapshot(itinerariesRef, async (snapshot) => {
      const fetchedTrips = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Collect unique userIds
      const uniqueUserIds = new Set(fetchedTrips.map((trip) => trip.userId));
      const newUserMap = { ...userMap };

      // For each userId, fetch user doc for username
      for (let uid of uniqueUserIds) {
        if (!newUserMap[uid]) {
          const userDocSnap = await getDoc(doc(db, "users", uid));
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            newUserMap[uid] = userData.username || uid;
          } else {
            newUserMap[uid] = uid; // fallback
          }
        }
      }

      setUserMap(newUserMap);
      setTrips(fetchedTrips);
      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <Typography align="center">Loading all trips...</Typography>;
  }

  if (trips.length === 0) {
    return <Typography align="center">No trips found.</Typography>;
  }

  return (
    <Container sx={{ mt: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
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
  );
}

export default AllTrips;
