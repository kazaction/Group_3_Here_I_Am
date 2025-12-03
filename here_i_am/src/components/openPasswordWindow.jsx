import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/openPasswordWindow.css";

const ChangePasswordPopup = ({ }) => {
  const navigate = useNavigate();
  const userObj = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userObj.user_id;
  const apiBase = `http://localhost:3001/users/${userId}`;
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    navigate("/profile");
  };

  const checkOldPassword = async () => {
    if (!oldPass) return alert("Please enter your old password!");
    setLoading(true);

    try {
      const res = await axios.post(`${apiBase}/check-password`, { password: oldPass });
      if (res.data.valid) {
        alert("✅ Old password is correct!");
        setIsVerified(true);
      } else {
        alert("❌ Incorrect password!");
      }
    } catch (err) {
      console.error(err);
      alert("Error checking password.");
    } finally {
      setLoading(false);
    }
  };

  const saveNewPassword = async () => {
    if (!newPass) return alert("Please enter a new password!");
    setLoading(true);

    try {
      const res = await axios.put(`${apiBase}/update-password`, { newPassword: newPass });
      if (res.status === 200) {
        alert("✅ Password updated successfully!");
        onClose(); // close popup
      } else {
        alert("❌ Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-5 w-80 relative">
        <h2 className="text-lg font-semibold mb-3 text-center">Change Password</h2>

        <label className="block text-sm font-medium mb-1">Old Password:</label>
        <input
          type="password"
          className="border rounded w-full p-2 mb-2"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1">New Password:</label>
        <input
          type="password"
          className="border rounded w-full p-2 mb-3"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          disabled={!isVerified}
        />

        <div className="mt-4">
          <button
            onClick={isVerified ? saveNewPassword : checkOldPassword}
            className="bg-blue-500"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isVerified
              ? "Save Password"
              : "Check Old Password"}
          </button>

          <button
            onClick={onClose}
            className="bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPopup;