// src/components/profile.jsx

import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import "../css/profile.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";

const Profile = () => {
  const navigate = useNavigate();

  const userObj = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userObj.user_id;
  const apiBase = `http://localhost:3001/users/${userId}`;

  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    profile_picture: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile text fields
  const handleSave = () => {
    setIsEditing(false);
    axios
      .put(apiBase, {
        name: profile.name,
        surname: profile.surname,
        email: profile.email,
        // ⚠️ username is UNIQUE; only send if your backend allows changing it
        // username: profile.username,
      })
      .then((res) => console.log("Profile updated:", res.data))
      .catch((err) => console.error(err));
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

    // Optional: instant preview while uploading
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({
      ...prev,
      profile_picture: previewUrl,
    }));

    const formData = new FormData();
    formData.append("profile_picture", file);

    axios
      .post(`http://localhost:3001/users/${userId}/profile-picture`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        // Use URL from backend so it works after refresh
        setProfile((prev) => ({
          ...prev,
          profile_picture: res.data.profile_picture,
        }));
      })
      .catch((err) => {
        console.error(err);
        alert("Error uploading profile picture");
      });
  };

  // Load user from backend
  useEffect(() => {
    if (!userId) return;
    axios
      .get(apiBase)
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => console.error(err));
  }, [apiBase, userId]);

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
          ✏️
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