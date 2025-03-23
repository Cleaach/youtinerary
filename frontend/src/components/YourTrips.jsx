import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Container,
  Grid
} from "@mui/material";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import MapIcon from '@mui/icons-material/Map';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

const YourTrips = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreVisible, setMoreVisible] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

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
      let docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

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

  // Show description section when user is not logged in or has no trips
  if (!user || itineraries.length === 0) {
    return (
      <Box sx={{ py: 6 }}>
        <Container>
          <Typography variant="h3" sx={{ mb: 4, textAlign: "center" }}>
            How It Works
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                  <Box sx={{ 
                    bgcolor: "primary.light", 
                    p: 2, 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    boxShadow: 2
                  }}>
                    <MapIcon sx={{ fontSize: 40, color: "white" }} />
                  </Box>
                </Box>
                <Box sx={{ fontSize: "2.5rem", color: "primary.main", mb: 1 }}>1</Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tell us about your trip
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Share your destination, dates, interests, and travel style. The more details you provide, the better your itinerary will be.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                  <Box sx={{ 
                    bgcolor: "primary.light", 
                    p: 2, 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    boxShadow: 2
                  }}>
                    <AutoAwesomeIcon sx={{ fontSize: 40, color: "white" }} />
                  </Box>
                </Box>
                <Box sx={{ fontSize: "2.5rem", color: "primary.main", mb: 1 }}>2</Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Our AI builds your itinerary
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Our advanced AI creates a personalized day-by-day plan with activities, restaurants, and accommodations tailored to your preferences.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                  <Box sx={{ 
                    bgcolor: "primary.light", 
                    p: 2, 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    boxShadow: 2
                  }}>
                    <BeachAccessIcon sx={{ fontSize: 40, color: "white" }} />
                  </Box>
                </Box>
                <Box sx={{ fontSize: "2.5rem", color: "primary.main", mb: 1 }}>3</Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Customize and enjoy
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Review your itinerary, make adjustments if needed, and access it anywhere during your trip. Save favorites for future adventures.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: "center", mt: 4, mb: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "800px", mx: "auto" }}>
              Not sure where to start? Browse through other travelers' itineraries for inspiration and ideas to help plan your perfect trip. Discover hidden gems, popular attractions, and expert recommendations from fellow adventurers.
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "medium" }}>
              Ready to take off?
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              color="success"
              onClick={() => navigate(user ? "/create-trip" : "/signin")}
            >
              {user ? "Create your first trip" : "Try it now"}
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

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