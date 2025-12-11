import React, { useState, useEffect } from "react";
import "../css/profile.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import { FiEdit2 } from "react-icons/fi";
import useAuth from "./tokenJWT"; // Import the useAuth hook

const Profile = () => {
  const navigate = useNavigate();

  // Ensure the user is authenticated using the custom useAuth hook
  useAuth(); // The hook will redirect the user to the login page if they are not authenticated

  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    profile_picture: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state to show while data is being fetched

  const userObj = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userObj.user_id;
  const token = userObj.token; // Get the JWT token from localStorage

  const apiBase = `http://localhost:3001/users/${userId}`;

  // Common axios config with auth header
  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`, // JWT auth header
    },
  };

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile text fields
  const handleSave = () => {
    setIsEditing(false);
    axios
      .put(
        apiBase,
        {
          name: profile.name,
          surname: profile.surname,
          email: profile.email,
        },
        authConfig // include token in the request header
      )
      .then((res) => {
        console.log("Profile updated:", res.data);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login"); // Redirect to login if unauthorized
        }
      });
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only .jpg, .jpeg, .png files are allowed.");
      return;
    }

    // instant preview while uploading
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({
      ...prev,
      profile_picture: previewUrl,
    }));

    const formData = new FormData();
    formData.append("profile_picture", file);

    axios
      .post(
        `http://localhost:3001/users/${userId}/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // include token
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        // Use URL from backend so it works after refresh
        setProfile((prev) => ({
          ...prev,
          profile_picture: res.data.profile_picture,
        }));
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        } else {
          alert("Error uploading profile picture");
        }
      });
  };

  // Load user data from backend
  useEffect(() => {
    if (!userId || !token) return;

    // Set loading state to true when fetching starts
    setLoading(true);

    axios
      .get(apiBase, authConfig) // Include token in the header
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        }
      })
      .finally(() => {
        // Set loading state to false once the data is fetched
        setLoading(false);
      });
  }, [apiBase, userId, token, navigate]);

  // Show loading spinner if the data is being fetched
  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        {/* Picture + pencil */}
        <div className="profile-picture-wrapper">
          {profile.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <div className="profile-picture placeholder">
              <span>Profile</span>
            </div>
          )}

          {/* Pencil icon */}
          <label htmlFor="profilePicInput" className="edit-profile-icon">
            <FiEdit2 className="edit-profile-icon-svg" />
          </label>

          <input
            id="profilePicInput"
            type="file"
            accept=".jpg,.jpeg,.png"
            style={{ display: "none" }}
            onChange={handleProfilePictureChange}
          />
        </div>

        {/* FORM UNDER THE PICTURE */}
        <div className="profile-form">
          <div className="profile-field">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>

          <div className="profile-field">
            <label>Surname:</label>
            <input
              type="text"
              name="surname"
              value={profile.surname}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>

          <div className="profile-field">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              readOnly
            />
          </div>

          <div className="profile-field">
            <label>Email Address:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>

          <div className="profile-buttons">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}>Edit</button>
            ) : (
              <button onClick={handleSave}>Save</button>
            )}

            <button onClick={() => navigate("/change-password")}>
              Edit Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;