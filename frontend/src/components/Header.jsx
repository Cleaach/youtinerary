// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  useTheme,
  Divider,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  // Access the MUI theme to get the primary color
  const theme = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    handleMenuClose();
    navigate("/");
  };

  return (
    <AppBar position="static" color="inherit" elevation={0}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left side: Logo + Title + Explore Button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              cursor: "pointer",
              transition: "color 0.2s",
              "&:hover": {
                color: "primary.main",
              },
            }}
            onClick={() => navigate("/")}
          >
            YOUtinerary
          </Typography>

          {/* Vertical Divider - adjusted to align with text */}
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              mx: 1, 
              my: 'auto', 
              height: '1.5rem',
              alignSelf: 'center'
            }} 
          />

          <Button
            variant="text"
            onClick={() => navigate("/all-trips")}
            sx={{
              color: "black",
              textTransform: "none",
              transition: "all 0.2s",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            Explore Other Trips!
          </Button>
        </Box>

        {/* Right side: User Controls */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {user ? (
            <>
              <Button
                variant="outlined"
                startIcon={<AccountCircle />}
                onClick={handleMenuOpen}
                sx={{
                  borderColor: "black",
                  color: "black",
                  textTransform: "none",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    color: "primary.main",
                  },
                }}
              >
                {user.displayName || user.email}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {/* "Your Trips" menu item */}
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/your-trips");
                  }}
                  sx={{
                    fontWeight: 500,
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: "#fff",
                    },
                  }}
                >
                  Your Trips
                </MenuItem>

                {/* Sign Out menu item */}
                <MenuItem
                  onClick={handleSignOut}
                  sx={{
                    fontWeight: 500,
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: "#fff",
                    },
                  }}
                >
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              onClick={() => navigate("/signin")}
              sx={{
                borderColor: "black",
                color: "black",
                textTransform: "none",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  color: "primary.main",
                },
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;