// src/components/YourTrips.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid2,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

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
        // Get the user's document
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const savedItineraries = userData.savedItineraries || [];

          // Fetch each itinerary document from the "itineraries" collection.
          // Check if the itinerary value is a string (ID) or already a DocumentReference.
          const promises = savedItineraries.map(async (itineraryValue) => {
            let itineraryDocRef;
            if (typeof itineraryValue === "string") {
              itineraryDocRef = doc(db, "itineraries", itineraryValue);
            } else if (itineraryValue && itineraryValue.id) {
              // Assume it's already a DocumentReference.
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

          // If there are more than 2 itineraries, only show the last two and reveal the "More" button
          if (itineraryDocs.length > 2) {
            setMoreVisible(true);
            itineraryDocs = itineraryDocs.slice(-2);
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
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Your Trips</Typography>
        {moreVisible && <Button variant="text">More</Button>}
      </Box>
      <Grid2 container spacing={2}>
        {itineraries.map((trip) => (
          // Remove the `item` prop and breakpoint props
          <Grid2
            key={trip.id}
            sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{trip.tripName}</Typography>
                <Typography variant="body2">Start: {trip.startDate}</Typography>
                <Typography variant="body2">End: {trip.endDate}</Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

export default YourTrips;
