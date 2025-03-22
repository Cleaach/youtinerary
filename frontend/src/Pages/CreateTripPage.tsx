// src/pages/CreateTripForm.jsx
import React, { useState } from "react";
import {
  Container,
  TextField,
  Typography,
  MenuItem,
  Button,
  Box,
  Chip,
  OutlinedInput,
  InputLabel,
  Select,
  FormControl,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Header from "../components/Header";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const CreateTripForm = () => {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState("");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destinationInput, setDestinationInput] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [budget, setBudget] = useState("");
  const [group, setGroup] = useState("");
  const [pace, setPace] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const interestOptions = [
    "Foodie",
    "Culture",
    "History",
    "Nightlife",
    "Nature",
    "Shopping",
    "Instagram Worthy",
    "Hidden Gems",
  ];

  const handleDestinationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && destinationInput.trim()) {
      e.preventDefault();
      setDestinations([...destinations, destinationInput.trim()]);
      setDestinationInput("");
    }
  };

  const handleRemoveDestination = (destToRemove: string) => {
    setDestinations(destinations.filter((dest) => dest !== destToRemove));
  };

  const handleInterestsChange = (
    event: SelectChangeEvent<typeof interests>
  ) => {
    const {
      target: { value },
    } = event;
    setInterests(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmit = async () => {
    if (!tripName || !startDate || !endDate || destinations.length === 0) {
      alert(
        "Please fill in the required fields: Trip Name, Destinations, Start Date, and End Date."
      );
      return;
    }

    setIsLoading(true);

    const data = {
      tripName,
      destinations,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      budget,
      group,
      pace,
      interests,
    };

    try {
      const response = await fetch(
        "http://localhost:2200/api/generateItinerary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();

      const tripId = result.tripId;
      if (tripId) {
        navigate(`/view/${tripId}`);
      } else {
        console.error("No tripId returned from server");
        alert("Failed to generate trip itinerary. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Create Your Trip
        </Typography>

        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label="Trip Name"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            fullWidth
            required
          />

          {/* Destination Input */}
          <Box sx={{ width: "100%" }}>
            <TextField
              label="Add Destinations"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              onKeyDown={handleDestinationKeyDown}
              fullWidth
              placeholder="Type and press Enter to add"
              required
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
              {destinations.map((dest) => (
                <Chip
                  key={dest}
                  label={dest}
                  onDelete={() => handleRemoveDestination(dest)}
                />
              ))}
            </Box>
          </Box>

          {/* Date Pickers */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box sx={{ flex: 1, border: "1px solid #ccc", borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Start Date
              </Typography>
              <DayPicker
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                footer={
                  startDate ? (
                    <p>You selected {format(startDate, "PP")}.</p>
                  ) : (
                    <p>Please select a day.</p>
                  )
                }
                styles={{
                  caption: { color: "#1976d2" },
                  day_selected: { backgroundColor: "#1976d2" },
                }}
              />
            </Box>

            <Box sx={{ flex: 1, border: "1px solid #ccc", borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                End Date
              </Typography>
              <DayPicker
                mode="single"
                selected={endDate}
                disabled={!startDate ? undefined : { before: startDate }}
                onSelect={setEndDate}
                footer={
                  endDate ? (
                    <p>You selected {format(endDate, "PP")}.</p>
                  ) : (
                    <p>Please select a day.</p>
                  )
                }
                styles={{
                  caption: { color: "#1976d2" },
                  day_selected: { backgroundColor: "#1976d2" },
                }}
              />
            </Box>
          </Box>

          {/* Select Inputs */}
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

          {/* Interests Multi-select */}
          <FormControl fullWidth>
            <InputLabel id="multiple-interests-label">
              Trip Vibe / Interests
            </InputLabel>
            <Select
              labelId="multiple-interests-label"
              id="multiple-interests"
              multiple
              value={interests}
              onChange={handleInterestsChange}
              input={
                <OutlinedInput
                  id="select-multiple-interests"
                  label="Trip Vibe / Interests"
                />
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {interestOptions.map((interest) => (
                <MenuItem
                  key={interest}
                  value={interest.toLowerCase().replace(/\s/g, "_")}
                >
                  {interest}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={24} /> : null}
          >
            {isLoading ? "Creating Trip..." : "Submit"}
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default CreateTripForm;
