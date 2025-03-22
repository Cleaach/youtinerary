// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Avatar, IconButton } from "@mui/material";
import AuthDialog from "./AuthDialog";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const Header = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleAvatarClick = () => {
    if (!user) setAuthDialogOpen(true);
    else signOut(auth); // auto sign out if already signed in
  };

  const handleDialogClose = () => {
    setAuthDialogOpen(false);
  };

  return (
    <>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            YOUtinerary
          </Typography>
          <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
            <Avatar
              alt={user?.displayName || "Profile"}
              src={user?.photoURL || ""}
            />
          </IconButton>
        </Toolbar>
      </AppBar>
      <AuthDialog open={authDialogOpen} handleClose={handleDialogClose} />
    </>
  );
};

export default Header;
