import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/logout", {
        method: "POST",
        credentials: "include", // Send cookies for session logout
      });

      const data = await res.json();
      console.log("Logout Response:", data);

      if (res.ok) {
        alert("Logged out successfully");
        navigate("/"); // redirect to login page
      } else {
        alert(data.message || "Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")} // Click title to go home
        >
          AI Career App
        </Typography>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
