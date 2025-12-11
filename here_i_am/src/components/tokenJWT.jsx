import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Custom hook to handle JWT token checking and passing it to requests
const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the JWT token stored in localStorage
    const storedUser = localStorage.getItem("user");

    // Check if the user is logged in by verifying the presence of the token
    if (!storedUser) {
      alert("You must be logged in to access this page.");
      navigate("/login");  // Redirect to login if no user data is found
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error("Failed to parse stored user:", err);
      alert("Login information is corrupted. Please log in again.");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    const token = user.token; // Retrieve the JWT token

    // Check if the token is available
    if (!token) {
      alert("Missing token. Please log in again.");
      navigate("/login");  // Redirect to login if no token is found
      return;
    }

    // You can now pass the token in the header for your API requests
    // Example: You could call fetchUserData() or any function to send requests with token
    const headers = {
      Authorization: `Bearer ${token}`,  // JWT token to be sent with the request
    };

    // Example function to use the token to fetch data (you can modify based on your needs)
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/some-protected-endpoint", {
          method: "GET",
          headers,  // Add JWT token to the request headers
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data.");
        }

        const data = await response.json();
        console.log("Fetched data:", data);
      } catch (error) {
        console.error("Error:", error);
        alert("Error fetching data.");
      }
    };

    fetchData();
  }, [navigate]);
};

export default useAuth;