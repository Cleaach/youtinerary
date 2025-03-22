import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Typography, Alert, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../components/Header";
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
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
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
      .catch(err => {
        console.error("Error loading itinerary:", err);
        setIsLoading(false);
      });
  }, [id, user]);

  const handleDragEnd = async (result) => {
    if (!isOwner) return;

    if (!result.destination) return;

    const sourceDayId = days[result.source.droppableId].dayId;
    const targetDayId = days[result.destination.droppableId].dayId;
    const destName = days[result.source.droppableId].destinations[result.source.index].name;

    await fetch(`http://localhost:2200/view/${id}/move-destination`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceDayId, targetDayId, destName }),
    });

    const updatedDays = [...days];
    const [movedItem] = updatedDays[result.source.droppableId].destinations.splice(result.source.index, 1);
    updatedDays[result.destination.droppableId].destinations.splice(result.destination.index, 0, movedItem);
    setDays(updatedDays);
  };

  const handleDeleteDestination = async (dayId, destName) => {
    if (!isOwner) return;

    try {
      const response = await fetch(`http://localhost:2200/api/view/${id}/${dayId}/${encodeURIComponent(destName)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update the local state to reflect the deletion
        const updatedDays = [...days];
        const dayIndex = updatedDays.findIndex(day => day.dayId === dayId);
        
        if (dayIndex !== -1) {
          updatedDays[dayIndex].destinations = updatedDays[dayIndex].destinations.filter(
            dest => dest.name !== destName
          );
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
    const allDestinations = days.flatMap(day => day.destinations);
    if (allDestinations.length === 0) {
      // Default center if no destinations
      return { lat: 21.3069, lng: -157.8583 }; // Honolulu coordinates
    }
    
    const latitudes = allDestinations.map(dest => parseFloat(dest.latitude));
    const longitudes = allDestinations.map(dest => parseFloat(dest.longitude));

    const avgLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
    const avgLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;

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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: "50%", height: "calc(100vh - 80px)" }}>
          {!isLoading && (
            <LoadScript 
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API}
              onLoad={handleMapsApiLoaded}
            >
              {days.length > 0 && (
                <GoogleMap 
                  mapContainerStyle={mapContainerStyle} 
                  center={getMapCenter()}
                  zoom={6}
                >
                  {days.flatMap((day) =>
                    day.destinations.map((destination, index) => (
                      <Marker
                        key={`${day.dayId}-${destination.name}`}
                        position={{ lat: parseFloat(destination.latitude), lng: parseFloat(destination.longitude) }}
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
        </div>

        <div style={{ 
          width: "50%", 
          height: "calc(100vh - 80px)", 
          overflowY: "auto", 
          padding: "20px"
        }}>
          <h1 style={{ marginBottom: "10px", textAlign: "left" }}>
            {user ? "Your getaway starts now!" : "Say hello to your new holiday!"}
          </h1>
          
          {isOwner ? (
            <h4 style={{ marginBottom: "10px", textAlign: "left" }}>
              Drag destinations between days or delete them to customize your itinerary.
            </h4>
          ) : (
            <h4 style={{ marginBottom: "10px", textAlign: "left" }}>
              Note that this is a read-only view of the itinerary. To customize, create your own!
            </h4>
          )}
          
          <DragDropContext onDragEnd={handleDragEnd}>
            {days.map((day, dayIndex) => (
              <Droppable 
                droppableId={String(dayIndex)} 
                key={day.dayId}
                isDropDisabled={!isOwner} 
              >
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginBottom: "20px" }}>
                    <h3>Day {dayIndex + 1}</h3>
                    {day.destinations.map((destination, index) => (
                      <Draggable key={destination.name} draggableId={destination.name} index={index}>
                        {(provided) => {
                          const lat = parseFloat(destination.latitude);
                          const lng = parseFloat(destination.longitude);
                          // Include the place name + coordinates in the query
                          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name)}+${lat},${lng}`;
                    
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                padding: "10px",
                                marginBottom: "5px",
                                backgroundColor: "lightgray",
                                cursor: "grab",
                                borderRadius: "5px",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>{destination.name}</span>
                                <button
                                  onClick={() => window.open(googleMapsUrl, "_blank")}
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
                              </div>
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default ViewItinerary;