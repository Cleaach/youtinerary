import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
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
import { Typography, Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../components/Header";
import { auth } from "../firebase";

// Sortable Item Component
const SortableItem = ({ id, children }) => {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);

      fetch(`http://localhost:2200/api/view/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setDays(data.days);
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

  const getMapCenter = () => {
    const allDestinations = days.flatMap((day) => day.destinations);
    const latitudes = allDestinations.map((d) => parseFloat(d.latitude));
    const longitudes = allDestinations.map((d) => parseFloat(d.longitude));
    const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
    return { lat: avgLat, lng: avgLng };
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
              {days.flatMap((day) =>
                day.destinations.map((dest, i) => (
                  <Marker
                    key={`${dest.name}-${i}`}
                    position={{
                      lat: parseFloat(dest.latitude),
                      lng: parseFloat(dest.longitude),
                    }}
                    title={dest.name}
                  />
                ))
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* Right: Itinerary */}
        <div style={{ width: "50%", overflowY: "scroll", padding: "20px" }}>
          <h2>{user ? "Your getaway starts now!" : "Say hello to your new holiday!"}</h2>
          {isOwner ? (
            <h4>Drag destinations across days to adjust your trip.</h4>
          ) : (
            <h4>View-only itinerary. Sign in to customize!</h4>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {days.map((day, dayIndex) => (
              <div key={day.dayId} style={{ marginBottom: "20px" }}>
                <h3>Day {dayIndex + 1}</h3>

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
                      <SortableItem key={`${dayIndex}-${i}`} id={`${dayIndex}-${i}`}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <strong>{dest.name}</strong>
                            <div style={{ marginTop: "5px" }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name)}`}
                                target="_blank"
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 500,
                                }}
                              >
                                View in Google Maps
                              </Button>
                            </div>
                          </div>
                          {isOwner && (
                            <IconButton onClick={() => handleDelete(dayIndex, i)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          )}
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
    </>
  );
};

export default ViewItinerary;