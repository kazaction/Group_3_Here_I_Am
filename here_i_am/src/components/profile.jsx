import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar";
import { FiEdit2 } from "react-icons/fi"; // Feather pencil icon
import ChangePasswordPopup from "./openPasswordWindow"; // ChangePasswordModal component
import "../css/profile.css";

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
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

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
        authenticated_user_id: userId,
      })
      .then((res) => console.log("Profile updated:", res.data))
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Access denied");
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

    // Instant preview while uploading
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({
      ...prev,
      profile_picture: previewUrl,
    }));

    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("authenticated_user_id", userId);

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
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Access denied");
        } else {
          alert("Error uploading profile picture");
        }
      });
  };

  // Load user from backend
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${apiBase}?authenticated_user_id=${userId}`)
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Access denied");
          navigate("/login");
        }
      });
  }, [apiBase, userId, navigate]);

  // Open/close Change Password modal
  const handleOpenChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePassword = () => {
    setIsChangePasswordModalOpen(false);
  };

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        {/* Profile Picture Section */}
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

          {/* Pencil Icon to Edit Profile Picture */}
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

        {/* Profile Form */}
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
              <button className="markos-btn" onClick={() => setIsEditing(true)}>Edit</button>
            ) : (
              <button className="markos-btn" onClick={handleSave}>Save</button>
            )}

            <button className="markos-btn" onClick={handleOpenChangePassword}>Change Password</button>
          </div>
        </div>
      </div>

      {/* Modal for Change Password */}
      {isChangePasswordModalOpen && (
        <ChangePasswordPopup onClose={handleCloseChangePassword} />
      )}
    </div>
  );
};

export default Profile;