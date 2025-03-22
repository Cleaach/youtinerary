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
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const YourTrips = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreVisible, setMoreVisible] = useState(false);
  const [user, setUser] = useState(null);

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
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const savedItineraries = userData.savedItineraries || [];

          const promises = savedItineraries.map(async (itineraryValue) => {
            let itineraryDocRef;
            if (typeof itineraryValue === "string") {
              itineraryDocRef = doc(db, "itineraries", itineraryValue);
            } else if (itineraryValue?.id) {
              itineraryDocRef = itineraryValue;
            } else {
              return null;
            }
            const itineraryDocSnap = await getDoc(itineraryDocRef);
            if (itineraryDocSnap.exists()) {
              return { id: itineraryDocSnap.id, ...itineraryDocSnap.data() };
            }
            return null;
          });

          let itineraryDocs = await Promise.all(promises);
          itineraryDocs = itineraryDocs.filter((doc) => doc !== null);

          console.log("Fetched itineraries:", itineraryDocs);

          // Show last 3 if more than 3 exist
          if (itineraryDocs.length > 3) {
            setMoreVisible(true);
            itineraryDocs = itineraryDocs.slice(-3);
          } else {
            setMoreVisible(false);
          }

          setItineraries(itineraryDocs);
        }
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
