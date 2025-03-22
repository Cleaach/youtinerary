// src/components/AuthDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Alert,
  useTheme,
} from "@mui/material";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const AuthDialog = ({ open, handleClose }) => {
  const theme = useTheme();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const formatDate = (date) => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  // Clears the form fields
  const clearForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      // Check if username is already taken
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError("Username already taken. Please choose another.");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: username });

        await setDoc(doc(db, "users", userCredential.user.uid), {
          createdAt: formatDate(new Date()),
          email,
          password, // ⚠️ Reminder: Storing plain passwords is insecure!
          savedItineraries: [],
          username,
        });

        clearForm();
        handleClose();
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          setError("Email already in use. Please sign in instead.");
        } else {
          setError(err.message);
        }
      }
    } else {
      // Sign In flow: using username to lookup the email first
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("No account found with that username.");
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userEmail = userData.email;

        await signInWithEmailAndPassword(auth, userEmail, password);
        clearForm();
        handleClose();
      } catch (err) {
        if (err.code === "auth/wrong-password") {
          setError("Incorrect password. Please try again.");
        } else if (
          err.code === "auth/invalid-email" ||
          err.message.includes("No account found")
        ) {
          setError("No account found. Please sign up instead.");
        } else {
          setError(err.message);
        }
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle
        sx={{ textAlign: "center", color: theme.palette.primary.main }}
      >
        {isSignUp ? "Sign Up" : "Sign In"}
      </DialogTitle>
      <DialogContent>
        <Card variant="outlined" sx={{ bgcolor: "background.paper" }}>
          <CardContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: 300,
              }}
            >
              {/* Always display username */}
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              {/* Show email field only during sign up */}
              {isSignUp && (
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button variant="contained" color="primary" type="submit">
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
              <Button variant="text" onClick={toggleMode}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
