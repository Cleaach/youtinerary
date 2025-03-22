// src/components/Header.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="inherit" elevation={0}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            YOUtinerary
          </Typography>
        </Box>

        {/* Sign In Button */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/signin")}
            sx={{ borderColor: "black", color: "black" }}
          >
            Sign In
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
