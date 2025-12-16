import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/openPasswordWindow.css"; // Ensure the styles are updated

const ChangePasswordPopup = ({ onClose }) => {
  const navigate = useNavigate();
  const userObj = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userObj.user_id;
  const apiBase = `http://localhost:3001/users/${userId}`;
  
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

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
        onClose(); // Close the modal when password is updated
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
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-header">Change Password</h2>

        <form>
          <div className="field">
            <label>Old Password:</label>
            <input
              type="password"
              className="input-field"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
          </div>

          <div className="field">
            <label>New Password:</label>
            <input
              type="password"
              className="input-field"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              disabled={!isVerified}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={isVerified ? saveNewPassword : checkOldPassword}
              disabled={loading}
            >
              {loading ? "Please wait..." : isVerified ? "Save Password" : "Check Old Password"}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPopup;