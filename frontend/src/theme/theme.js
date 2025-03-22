// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#FAF4EF",
      paper: "#FFFFFF",
    },
    primary: {
      main: "#FF6B6B", // Coral
    },
    secondary: {
      main: "#4FC3F7", // Sky Blue
    },
    text: {
      primary: "#2E2E2E", // Charcoal
      secondary: "#6F4E37", // Warm Brown
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

export default theme;
