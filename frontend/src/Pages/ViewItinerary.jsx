import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker, OverlayView } from "@react-google-maps/api";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Typography, Button, IconButton, Tooltip, Snackbar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import Header from "../components/Header";
import { auth } from "../firebase";

// Sortable Item Component
const SortableItem = ({ id, children, onMouseEnter, onMouseLeave }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px",
    marginBottom: "5px",
    backgroundColor: "lightgray",
    borderRadius: "5px",
    cursor: "grab",
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

const ViewItinerary = () => {
  const { id } = useParams();
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [hoveredDestination, setHoveredDestination] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);

      fetch(`http://localhost:2200/api/view/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setDays(data.days);
          setStartDate(data.startDate);
          if (user?.uid === data.userId) setIsOwner(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading itinerary:", err);
          setIsLoading(false);
        });
    });

    return () => unsubscribe();
  }, [id]);

  const getFormattedDate = (baseDate, dayOffset) => {
    if (!baseDate) return "";
    
    const date = new Date(baseDate);
    date.setDate(date.getDate() + dayOffset);
    
    // Format date as "DD Month YYYY"
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDragEnd = async (event) => {
    if (!isOwner) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const [activeDayIndex, activeItemIndex] = active.id.split("-");
    const [overDayIndex, overItemIndex] = over.id.split("-");

    const sourceDay = days[+activeDayIndex];
    const targetDay = days[+overDayIndex];
    const movedItem = sourceDay.destinations[+activeItemIndex];

    const updatedDays = [...days];
    updatedDays[+activeDayIndex].destinations.splice(+activeItemIndex, 1);
    updatedDays[+overDayIndex].destinations.splice(+overItemIndex || 0, 0, movedItem);
    setDays(updatedDays);

    await fetch(`http://localhost:2200/api/view/${id}/move-destination`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceDayId: sourceDay.dayId,
        targetDayId: targetDay.dayId,
        destName: movedItem.name,
      }),
    });
  };

  const handleDelete = async (dayIndex, destIndex) => {
    const dayId = days[dayIndex].dayId;
    const destName = days[dayIndex].destinations[destIndex].name;

    try {
      await fetch(
        `http://localhost:2200/api/view/${id}/${dayId}/${encodeURIComponent(destName)}`,
        { method: "DELETE" }
      );

      const updatedDays = [...days];
      updatedDays[dayIndex].destinations.splice(destIndex, 1);
      setDays(updatedDays);
    } catch (error) {
      console.error("Failed to delete destination:", error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Failed to copy URL:", error);
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getMapCenter = () => {
    const allDestinations = days.flatMap((day) => day.destinations);
    if (allDestinations.length === 0) return { lat: 0, lng: 0 };
    
    const latitudes = allDestinations.map((d) => parseFloat(d.latitude)).filter(lat => !isNaN(lat));
    const longitudes = allDestinations.map((d) => parseFloat(d.longitude)).filter(lng => !isNaN(lng));
    
    if (latitudes.length === 0 || longitudes.length === 0) return { lat: 0, lng: 0 };
    
    const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
    return { lat: avgLat, lng: avgLng };
  };

  // New methods for handling hover states
  const handleDestinationHover = (dayIndex, destIndex) => {
    const destination = days[dayIndex].destinations[destIndex];
    setHoveredDestination({
      name: destination.name,
      lat: parseFloat(destination.latitude),
      lng: parseFloat(destination.longitude),
      dayIndex,
      destIndex
    });
  };

  const handleDestinationLeave = () => {
    setHoveredDestination(null);
  };

  // Create a unique ID for each destination for tracking purposes
  const getDestinationId = (dayIndex, destIndex, destName) => {
    return `${dayIndex}-${destIndex}-${destName.replace(/\s+/g, '-')}`;
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Typography sx={{ mt: 10 }} align="center">
          Loading itinerary...
        </Typography>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        {/* Left: Google Map */}
        <div style={{ width: "50%" }}>
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API}>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={getMapCenter()}
              zoom={6}
            >
              {days.flatMap((day, dayIndex) =>
                day.destinations.map((dest, destIndex) => {
                  const position = {
                    lat: parseFloat(dest.latitude),
                    lng: parseFloat(dest.longitude),
                  };
                  
                  const isHovered = hoveredDestination && 
                    hoveredDestination.dayIndex === dayIndex && 
                    hoveredDestination.destIndex === destIndex;
                  
                  return (
                    <React.Fragment key={getDestinationId(dayIndex, destIndex, dest.name)}>
                      <Marker
                        position={position}
                        title={dest.name}
                        animation={isHovered ? window.google.maps.Animation.BOUNCE : null}
                      />
                      
                      {isHovered && (
                        <OverlayView
                          position={position}
                          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                          <div style={{
                            background: "white",
                            padding: "5px 10px",
                            border: "1px solid #3f51b5",
                            borderRadius: "4px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                            fontWeight: "bold",
                            transform: "translate(-50%, -320%)", 
                            minWidth: "max-content",
                            fontSize: "14px",
                            marginBottom: "10px" // Added extra space below
                          }}>
                            {dest.name}
                          </div>
                        </OverlayView>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* Right: Itinerary */}
        <div style={{ width: "50%", overflowY: "scroll", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0px" }}>
            <h2 style={{ marginBottom: "0px" }}>{user ? "Your getaway starts now!" : "Say hello to your new holiday!"}</h2>
            <Tooltip title="Share Itinerary">
              <IconButton 
                onClick={handleShare} 
                color="primary" 
                size="large"
                sx={{ 
                  backgroundColor: "#f0f7ff", 
                  "&:hover": { backgroundColor: "#e0f0ff" } 
                }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </div>
          {isOwner ? (
            <h4 style={{ marginTop: "8px" }}>Drag destinations across days to adjust your trip. Hover over destinations to highlight them on the map.</h4>
          ) : (
            <h4 style={{ marginTop: "8px" }}>View-only itinerary. Sign in to customize! Hover over destinations to see them on the map.</h4>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {days.map((day, dayIndex) => (
              <div key={day.dayId} style={{ marginBottom: "20px" }}>
                <h3>Day {dayIndex + 1} - {getFormattedDate(startDate, dayIndex)}</h3>

                <SortableContext
                  items={day.destinations.map((_, i) => `${dayIndex}-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {day.destinations.length === 0 ? (
                    <SortableItem id={`${dayIndex}-0`}>
                      <div style={{ fontStyle: "italic", opacity: 0.5 }}>
                        Drag a destination here...
                      </div>
                    </SortableItem>
                  ) : (
                    day.destinations.map((dest, i) => (
                      <SortableItem 
                        key={`${dayIndex}-${i}`} 
                        id={`${dayIndex}-${i}`}
                        onMouseEnter={() => handleDestinationHover(dayIndex, i)}
                        onMouseLeave={handleDestinationLeave}
                      >
                        <div 
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            backgroundColor: hoveredDestination && 
                                           hoveredDestination.dayIndex === dayIndex && 
                                           hoveredDestination.destIndex === i ? "#e0f0ff" : "transparent",
                            padding: "5px",
                            borderRadius: "3px"
                          }}
                        >
                          <strong>{dest.name}</strong>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name)}`}
                              target="_blank"
                              sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                marginRight: "8px"
                              }}
                            >
                              Google Maps
                            </Button>
                            {isOwner && (
                              <IconButton onClick={() => handleDelete(dayIndex, i)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </div>
                        </div>
                      </SortableItem>
                    ))
                  )}
                </SortableContext>
              </div>
            ))}
          </DndContext>
        </div>
      </div>
      
      {/* Notification for successful copy */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Itinerary link copied to clipboard!"
      />
    </>
  );
};

export default ViewItinerary;