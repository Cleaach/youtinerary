import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Typography, Alert } from "@mui/material"; // Import Typography and Alert
import Header from "../components/Header";
import { auth } from "../firebase.js"; // Import auth from firebase

const ViewItinerary = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [user, setUser] = useState(null); // Track user state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoading(true);
      setUser(user); // Update the user state

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
    });

    return () => unsubscribe();
  }, [id]);

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

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  // Calculate the center of the map based on the destinations' latitudes and longitudes
  const getMapCenter = () => {
    const allDestinations = days.flatMap(day => day.destinations);
    const latitudes = allDestinations.map(dest => parseFloat(dest.latitude));
    const longitudes = allDestinations.map(dest => parseFloat(dest.longitude));

    const avgLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
    const avgLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;

    return { lat: avgLat, lng: avgLng };
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
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API}>
            <GoogleMap 
              mapContainerStyle={mapContainerStyle} 
              center={getMapCenter()} // Set the center dynamically
              zoom={6}
            >
              {days.flatMap((day) =>
                day.destinations.map((destination, index) => (
                  <Marker
                    key={index}
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
          </LoadScript>
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
            <h4 style={{ marginBottom: "10px", textAlign: "left" }}>Drag around places between days to edit your itinerary.</h4>
          ) : (
            <h4 style={{ marginBottom: "10px", textAlign: "left" }}>Note that this is a read-only view of the itinerary. To customize, create your own!</h4>
          )}
          
          <DragDropContext onDragEnd={handleDragEnd}>
            {days.map((day, dayIndex) => (
              <Droppable 
                droppableId={String(dayIndex)} 
                key={day.dayId}
                isDropDisabled={!isOwner} // Disable dropping for non-owners
              >
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginBottom: "20px" }}>
                    <h3>Day {dayIndex + 1}</h3>
                    {day.destinations.map((destination, index) => (
                      <Draggable 
                        key={destination.name} 
                        draggableId={destination.name} 
                        index={index}
                        isDragDisabled={!isOwner} // Disable dragging for non-owners
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              padding: "10px",
                              marginBottom: "5px",
                              backgroundColor: "lightgray",
                              cursor: isOwner ? "grab" : "default", // Change cursor based on ownership
                              borderRadius: "5px",
                              ...provided.draggableProps.style,
                            }}
                          >
                            {destination.name}
                          </div>
                        )}
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