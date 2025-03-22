import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Header from "../components/Header"; // Import the Header component

const ViewItinerary = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [days, setDays] = useState([]);
  
  useEffect(() => {
    fetch(`http://localhost:2200/api/view/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setItinerary(data);
        setDays(data.days);
      });
  }, [id]);

  const handleDragEnd = async (result) => {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <Header />
      
      {/* Content Container */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Google Maps Container - Fixed height */}
        <div style={{ width: "50%", height: "calc(100vh - 80px)" }}>
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API}>
            <GoogleMap 
              mapContainerStyle={mapContainerStyle} 
              center={{ lat: 41.8902, lng: 12.4922 }} 
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

        {/* Itinerary List - Scrollable independently */}
        <div style={{ 
          width: "50%", 
          height: "calc(100vh - 80px)", 
          overflowY: "auto", 
          padding: "20px"
        }}>
          <h1 style={{ marginBottom: "10px", textAlign: "left" }}>Say hello to your new holiday!</h1>
          <h4 style={{ marginBottom: "10px", textAlign: "left" }}>Drag around places between days to edit your itinerary.</h4>
          <DragDropContext onDragEnd={handleDragEnd}>
            {days.map((day, dayIndex) => (
              <Droppable droppableId={String(dayIndex)} key={day.dayId}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginBottom: "20px" }}>
                    <h3>Day {dayIndex + 1}</h3>
                    {day.destinations.map((destination, index) => (
                      <Draggable key={destination.name} draggableId={destination.name} index={index}>
                        {(provided) => (
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
