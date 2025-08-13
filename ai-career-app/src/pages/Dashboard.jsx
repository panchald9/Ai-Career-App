import React, { useEffect, useState } from "react";
import Header from "../pages/Header";
import { useNavigate } from "react-router-dom";
import ChatBox from "../compoent/chatbot";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found");
          navigate("/"); // Redirect if no token is found
          return;
        }

        const res = await fetch("http://127.0.0.1:5000/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          // Handle unauthorized, e.g., token expired or invalid
          localStorage.removeItem("token");
          alert("Session expired. Please log in again.");
          navigate("/");
        } else {
          // Handle other errors
          console.error("Error fetching user:", res.statusText);
          alert("Failed to fetch user data.");
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        alert("An error occurred. Please try again.");
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) {
    // Show a loading state while fetching user data
    return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
  }

  return (
    <div>
      <Header />
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h2>Welcome, {user.user_name} 👋</h2>
        <p>Email: {user.user_email}</p>
        <p>This is your AI Career App Dashboard.</p>
        <ChatBox />
      </div>
    </div>
  );
}