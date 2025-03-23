// src/components/AllTrips.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function AllTrips() {
  const [trips, setTrips] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  const navigate = useNavigate();

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
      setShowMore(fetchedTrips.length > 6);
      setTrips(fetchedTrips.slice(0, 6));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Typography align="center">Loading all trips...</Typography>;
  }

  if (trips.length === 0) {
    return <Typography align="center">No trips found.</Typography>;
  }

  return (
    <Container sx={{ mt: 8 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          All Trips
        </Typography>
        {showMore && (
          <Button variant="text" onClick={() => navigate("/all-trips")}>
            More
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {trips.map((trip) => {
          const username = userMap[trip.userId] || "Unknown User";
          return (
            <Grid item xs={12} sm={6} md={4} key={trip.id}>
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
                onClick={() => navigate(`/view/${trip.id}`)}
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
