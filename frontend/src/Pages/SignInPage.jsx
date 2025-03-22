// src/pages/SignInPage.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Alert,
  Typography,
  Container,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
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

const SignInPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Switch between sign-up vs sign-in mode
  const [isSignUp, setIsSignUp] = useState(true);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // Watch for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const formatDate = (date) => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const clearForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
  };

  // Handle sign out if user is already logged in
  const handleSignOut = async () => {
    await auth.signOut();
    clearForm();
    navigate("/"); // redirect to homepage
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
        // Create user with email & password
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: username });

        // Create user doc
        await setDoc(doc(db, "users", userCredential.user.uid), {
          createdAt: formatDate(new Date()),
          email,
          password, // Reminder: insecure to store plain password
          savedItineraries: [],
          username,
        });

        clearForm();
        navigate("/"); // redirect after sign-up
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Sign In with username -> fetch email -> signInWithEmailAndPassword
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
        navigate("/"); // redirect after sign-in
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
  };

  // If user is already logged in, show a sign out button (optional)
  if (user) {
    return (
      <Container sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
        <Card variant="outlined" sx={{ maxWidth: 400, p: 2 }}>
          <CardContent>
            <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>
              You’re already signed in as {user.displayName || user.email}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
      <Card variant="outlined" sx={{ maxWidth: 400, p: 2 }}>
        <CardContent>
          {/* X button in top-right corner */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => navigate(-1)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>
            {isSignUp ? "Sign Up" : "Log In"}
            {/* If you prefer "Get Started", use that instead of "Log In" */}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
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
            <Button variant="contained" type="submit">
              {isSignUp ? "Create Account" : "Log In"}
              {/* or "Get Started" */}
            </Button>
            <Button variant="text" onClick={toggleMode}>
              {isSignUp
                ? "Already have an account? Log In"
                : "Don't have an account? Sign Up"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SignInPage;
