import React, { useEffect, useState } from "react";
import { useHistory} from "react-router-dom";
import logo from '../assets/logo.png';
import "../css/profile.css";
import axios from "axios";//To connect database with react

const Profile = () => {

    const userId = 1; // TEMP: hardcoded until login page exists
    const apiBase = `http://localhost:5001/users/${userId}`;
    
    const [profile, setProfile] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    //password: "",
    profile_picture: ""
    });

    const [passwordTest, setProfilePassword] = useState({ password: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleChangePassword = (e) => {
        const {name, value} = e.target;
        setProfilePassword({ ...passwordTest, [name]: value });
    };

    const handleSave = () => {
        setIsEditing(false);
        axios.put(apiBase, profile)
            .then(res => console.log("Profile updated:", res.data))
            .catch(err => console.error(err));
    };

    const handleSavePassword = (newPassword) => {
        setIsEditingPassword(false);
        axios.put(`${apiBase}/update-password`, { newPassword })
            .then(res => console.log("Password updated:", res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        axios.get(apiBase)
            .then(res => {
                setProfile(res.data);
                setProfilePassword({ password: res.data.password || "" });
            })
            .catch(err => console.error(err));
    }, []);

    //To open a new window to enter an old passowrd and then the new
    const openPasswordWindow = () => {
    const myWindow = window.open("", "Password", "width=400, height=400");
    myWindow.document.write(`
<html>
  <head>
    <title>Change Password</title>
    <style>
      body { font-family: Arial; padding: 20px; }
      input, button { margin-top: 8px; display: block; }
      input[disabled] { background-color: #eee; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  </head>
  <body>
    <h3>Change Password</h3>

    <label>Old Password:</label>
    <input type="password" id="oldPass" />

    <label>New Password:</label>
    <input type="password" id="newPass" disabled />

    <button id="checkOld">Check Old Password</button>
    <button id="saveNew" disabled>Save New Password</button>

    <script>
      const apiBase = "http://localhost:5001/users/" + ${userId};

      document.getElementById("checkOld").addEventListener("click", async () => {
        const oldPass = document.getElementById("oldPass").value;
        if (!oldPass) return alert("Please enter your old password!");

        try {
          const res = await axios.post(apiBase + "/check-password", { password: oldPass });
          
          if (res.data.valid) {
            alert("✅ Old password correct!");
            document.getElementById("newPass").disabled = false;
            document.getElementById("saveNew").disabled = false;
          } else {
            alert("❌ Incorrect password!");
          }
        } catch (err) {
          console.error(err);
          alert("Error checking password.");
        }
      });

      document.getElementById("saveNew").addEventListener("click", async () => {
        const newPass = document.getElementById("newPass").value;
        if (!newPass) return alert("Please enter a new password!");

        try {
          const res = await axios.put(apiBase + "/update-password", { newPassword: newPass });

          if (res.data.success) {
            alert("✅ Password updated successfully!");
            window.close();
          } else {
            alert("❌ Failed to update password.");
          }
        } catch (err) {
          console.error(err);
          alert("Error updating password.");
        }
      });
    </script>
  </body>
</html>
    `);
};

    return (
        <div>
            <img src={logo} alt="Logo" />
            <br/>

            <label>Name:</label>
            <input type = "text" name = "name" value={profile.name} onChange={handleChange} readOnly={!isEditing}/>
            <br/>

            <label>Surname:</label>
            <input type = "text" name = "surname" value={profile.surname} onChange={handleChange} readOnly={!isEditing} />
            <br/>

            <label>Username:</label>
            <input type = "text" name = "username" value={profile.username} onChange={handleChange} readOnly={!isEditing}/>
            <br/>

            <label>Email Address:</label>
            <input type = "email" name = "email" value={profile.email} onChange={handleChange} readOnly={!isEditing} />
            <br/>
            
            {/*<label>Password:</label>
            <input type = "password" name = "password" value={profile.password} onChange={handleChange} readOnly={!isEditing} />
            <br/>*/}

            {!isEditing ? (
            <button onClick={() => setIsEditing(true)}>Edit</button>
            ) : (
                <button onClick={handleSave}>Save</button>
            )}
            <br/>

            <label>Password:</label>
            <input type = "password" name = "password" value={passwordTest.password} onChange={handleChangePassword} readOnly={!isEditingPassword} />
            <br/>
            
            <button onClick={openPasswordWindow}>Edit Password</button>
        </div>

    );
};

export default Profile;