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
      main: "#2E8B57", // Coral
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
    fontFamily: "Poppins, sans-serif",
  },
});

export default theme;
