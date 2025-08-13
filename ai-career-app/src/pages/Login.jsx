import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for Flask session cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        alert("Login successful!");
        navigate("/dashboard"); 
        localStorage.setItem("token", data.token); // must match the name you retrieve later// redirect after login
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Something went wrong");
    }
  };

  return (
    <Container sx={{ mt: 15 }}>
      {/* Flex container for left image and right form */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          flexWrap: "wrap", // so it’s responsive on small screens
        }}
      >
        {/* Left side - Image */}
        <Box sx={{ flex: 1, textAlign: "center" }}>
          <img
            src="/draw2.svg"
            alt="Login Illustration"
            style={{ width: "100%", height: "100%" }}
          />
        </Box>

        {/* Right side - Form */}
        <Box sx={{ flex: 1 ,height: "100%", maxWidth: 400}}>
          <Typography variant="h4" gutterBottom align="center">
            AI Career App - Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Login
            </Button>
          </form>
          <Button sx={{ mt: 2 }} onClick={() => navigate("/signup")} fullWidth>
            Create an account
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
