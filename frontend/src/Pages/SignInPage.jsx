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
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
} from "firebase/firestore";

const SignInPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

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

  const handleSignOut = async () => {
    await auth.signOut();
    clearForm();
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setError("Username already taken. Please choose another.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: username });

        await setDoc(doc(db, "users", userCredential.user.uid), {
          createdAt: formatDate(new Date()),
          email,
          password,
          savedItineraries: [],
          username,
        });

        clearForm();
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    } else {
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
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const userRef = doc(db, "users", googleUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          createdAt: formatDate(new Date()),
          email: googleUser.email,
          username: googleUser.displayName,
          savedItineraries: [],
          provider: "google",
        });
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Google Sign-In failed. Try again.");
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
  };

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
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => navigate(-1)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>
            {isSignUp ? "Sign Up" : "Log In"}
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
            </Button>

            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
            >
              Continue with Google
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
