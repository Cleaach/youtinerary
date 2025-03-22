import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 10,
        py: 4,
        textAlign: "center",
        borderTop: "1px solid #ddd",
        backgroundColor: "#EFE3D3",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} YOUtinerary ·{" "}
        <Link
          href="https://github.com/Cleaach/youtinerary"
          target="_blank"
          rel="noopener"
          underline="hover"
        >
          View on GitHub
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
