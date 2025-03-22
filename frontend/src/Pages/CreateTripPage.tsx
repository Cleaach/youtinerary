import React, { useState } from "react";
import {
  Container,
  TextField,
  Typography,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const CreateTripForm = () => {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState("");
  const [group, setGroup] = useState("");
  const [pace, setPace] = useState("");
  const [vibe, setVibe] = useState("");

  const handleSubmit = async () => {
    if (!tripName || !startDate || !endDate) {
      alert("Please fill in the required fields.");
      return;
    }

    const data = {
      tripName,
      destination,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      budget,
      group,
      pace, 
      vibe,
    };

    try {
      const response = await fetch("http://localhost:2200/api/generateItinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Trip generated:", result);

      // Optional: download the JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${tripName || "trip"}_data.json`;
      link.click();

      // Navigate to the DragDrop page
      navigate("/DragDrop");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit trip. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Create Your Trip
      </Typography>

      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Trip Name"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          fullWidth
        />

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ marginBottom: 4, display: "block" }}>Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              dateFormat="yyyy-MM-dd"
              className="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputAdornedEnd"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ marginBottom: 4, display: "block" }}>End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate ?? undefined}
              placeholderText="End Date"
              dateFormat="yyyy-MM-dd"
              className="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputAdornedEnd"
            />
          </div>
        </div>

        <TextField
          select
          label="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          fullWidth
        >
          {["Low", "Medium", "High"].map((option) => (
            <MenuItem key={option} value={option.toLowerCase()}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          fullWidth
        >
          {["Solo", "Couple", "Friends", "Family and Kids", "Seniors"].map(
            (option) => (
              <MenuItem key={option} value={option.toLowerCase()}>
                {option}
              </MenuItem>
            )
          )}
        </TextField>

        <TextField
          select
          label="Pace"
          value={pace}
          onChange={(e) => setPace(e.target.value)}
          fullWidth
        >
          {["Relaxed", "Balanced", "Fast-paced"].map((option) => (
            <MenuItem key={option} value={option.toLowerCase()}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Trip Vibe / Interest"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          fullWidth
        >
          {[
            "Foodie",
            "Culture",
            "History",
            "Nightlife",
            "Nature",
            "Shopping",
            "Instagram Worthy",
            "Hidden Gems",
          ].map((option) => (
            <MenuItem key={option} value={option.toLowerCase().replace(/\s/g, "_")}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default CreateTripForm;
