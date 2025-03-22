import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Typography, Alert, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { auth } from "../firebase.js";

const ViewItinerary = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [user, setUser] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // First effect to handle auth only
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Second effect to fetch data after auth is handled
  useEffect(() => {
    setIsLoading(true);

    fetch(`http://localhost:2200/api/view/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setItinerary(data);
        setDays(data.days);

        if (user && user.uid) {
          setIsOwner(user.uid === data.userId);
        } else {
          setIsOwner(false);
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading itinerary:", err);
        setIsLoading(false);
      });
  }, [id, user]);

  const handleDragEnd = async (result) => {
    if (!isOwner) return;

    if (!result.destination) return;

    const sourceDayId = days[result.source.droppableId].dayId;
    const targetDayId = days[result.destination.droppableId].dayId;
    const destName =
      days[result.source.droppableId].destinations[result.source.index].name;

    await fetch(`http://localhost:2200/view/${id}/move-destination`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceDayId, targetDayId, destName }),
    });

    const updatedDays = [...days];
    const [movedItem] = updatedDays[
      result.source.droppableId
    ].destinations.splice(result.source.index, 1);
    updatedDays[result.destination.droppableId].destinations.splice(
      result.destination.index,
      0,
      movedItem
    );
    setDays(updatedDays);
  };

  const handleDeleteDestination = async (dayId, destName) => {
    if (!isOwner) return;

    try {
      const response = await fetch(
        `http://localhost:2200/api/view/${id}/${dayId}/${encodeURIComponent(
          destName
        )}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Update the local state to reflect the deletion
        const updatedDays = [...days];
        const dayIndex = updatedDays.findIndex((day) => day.dayId === dayId);

        if (dayIndex !== -1) {
          updatedDays[dayIndex].destinations = updatedDays[
            dayIndex
          ].destinations.filter((dest) => dest.name !== destName);
          setDays(updatedDays);
        }
      } else {
        console.error("Failed to delete destination");
      }
    } catch (error) {
      console.error("Error deleting destination:", error);
    }
  };

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const getMapCenter = () => {
    const allDestinations = days.flatMap((day) => day.destinations);
    if (allDestinations.length === 0) {
      // Default center if no destinations
      return { lat: 21.3069, lng: -157.8583 }; // Honolulu coordinates
    }

    const latitudes = allDestinations.map((dest) => parseFloat(dest.latitude));
    const longitudes = allDestinations.map((dest) =>
      parseFloat(dest.longitude)
    );

    const avgLat =
      latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
    const avgLng =
      longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;

    return { lat: avgLat, lng: avgLng };
  };

  // Handle Maps API loading
  const handleMapsApiLoaded = () => {
    setMapsLoaded(true);
  };

  if (isLoading) {
    return (
      <div>
        <Header />
        <div style={{ padding: "20px" }}>
          <Typography variant="h6">Loading itinerary...</Typography>
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left - Map */}
        <Box sx={{ width: "50%", height: "calc(100vh - 80px)" }}>
          {!isLoading && (
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API}
              onLoad={handleMapsApiLoaded}
            >
              {days.length > 0 && (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={getMapCenter()}
                  zoom={6}
                >
                  {days.flatMap((day) =>
                    day.destinations.map((destination) => (
                      <Marker
                        key={`${day.dayId}-${destination.name}`}
                        position={{
                          lat: parseFloat(destination.latitude),
                          lng: parseFloat(destination.longitude),
                        }}
                        title={destination.name}
                        label={{
                          text: destination.name,
                          fontSize: "12px",
                          color: "#000",
                          fontWeight: "bold",
                        }}
                      />
                    ))
                  )}
                </GoogleMap>
              )}
            </LoadScript>
          )}
        </Box>

        {/* Right - Itinerary */}
        <Box
          sx={{
            width: "50%",
            height: "calc(100vh - 80px)",
            overflowY: "auto",
            p: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            {user
              ? "Your getaway starts now!"
              : "Say hello to your new holiday!"}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            {isOwner
              ? "Drag destinations between days or delete them to customize your itinerary."
              : "Note that this is a read-only view of the itinerary. To customize, create your own!"}
          </Typography>

          <DragDropContext onDragEnd={handleDragEnd}>
            {days.map((day, dayIndex) => (
              <Droppable
                droppableId={String(dayIndex)}
                key={day.dayId}
                isDropDisabled={!isOwner}
              >
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Day {dayIndex + 1}
                    </Typography>

                    {day.destinations.map((destination, index) => {
                      const lat = parseFloat(destination.latitude);
                      const lng = parseFloat(destination.longitude);
                      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        destination.name
                      )}+${lat},${lng}`;

                      return (
                        <Draggable
                          key={destination.name}
                          draggableId={destination.name}
                          index={index}
                        >
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: 2,
                                mb: 1,
                                backgroundColor: "lightgray",
                                borderRadius: 1,
                                cursor: "grab",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span>{destination.name}</span>
                                <button
                                  onClick={() =>
                                    window.open(googleMapsUrl, "_blank")
                                  }
                                  style={{
                                    marginLeft: "10px",
                                    backgroundColor: "#1976d2",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "6px 8px",
                                    cursor: "pointer",
                                  }}
                                >
                                  View in Maps
                                </button>
                              </Box>
                            </Box>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default ViewItinerary;
