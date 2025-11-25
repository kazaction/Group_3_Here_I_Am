import React, { useEffect, useState } from "react";
import { useHistory} from "react-router-dom";
import logo from '../assets/logo.png';
import "../css/profile.css";
import axios from "axios";//To connect database with react
import ChangePasswordPopup from "./openPasswordWindow";//window for changing password
import { useNavigate } from "react-router-dom";//to mavigate throw the pages
import Navbar from "./navbar";

const Profile = () => {

    const navigate = useNavigate(); 

    const userObj = JSON.parse(localStorage.getItem("user") || '{}');
    const userId = userObj.user_id; // TEMP: hardcoded until login page exists
    const apiBase = `http://localhost:3001/users/${userId}`;
    
    const [profile, setProfile] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    profile_picture: ""
    });//place holders for the info

    const [passwordTest, setProfilePassword] = useState({ password: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setProfile({ ...profile, [name]: value });
    };//for the changes 


    const handleSave = () => {
        setIsEditing(false);
        axios.put(apiBase, profile)
            .then(res => console.log("Profile updated:", res.data))
            .catch(err => console.error(err));
    };//when the user saves it handles it

    //initializing that are false
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);

    useEffect(() => {
        axios.get(apiBase).then((res) => setProfile(res.data)).catch((err) => console.error(err));

    }, []);//use the api and if not working promt the user with an error


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
            
            {/* when user press button to edit we set isEditing to true so the user can edit */}
            {!isEditing ? (
            <button onClick={() => setIsEditing(true)}>Edit</button>
            ) : (
                <button onClick={handleSave}>Save</button>
            )}
            <br/>

            <button onClick={() => navigate("/change-password")}>Edit Password</button>

        </div>

    );
};

export default Profile;