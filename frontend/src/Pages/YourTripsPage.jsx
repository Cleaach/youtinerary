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
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AllTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);

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
        <Footer />
      </>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box sx={{ flex: 1 }}>
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
                    onClick={() => navigate(`/trip/${trip.id}`)}
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
      </Box>

      <Footer />
    </Box>
  );
};

export default AllTripsPage;
