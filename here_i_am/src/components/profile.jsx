import React, { useEffect, useState } from "react";
import { useHistory} from "react-router-dom";
import logo from '../assets/logo.png';
import "../css/profile.css";
import axios from "axios";//To connect database with react
import ChangePasswordPopup from "./openPasswordWindow";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";

const Profile = () => {

    const navigate = useNavigate(); 

    const userObj = JSON.parse(localStorage.getItem("user") || '{}');
    const apiBase = `http://localhost:3001/users/${userId}`;
    
    const [profile, setProfile] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    profile_picture: ""
    });

    const [passwordTest, setProfilePassword] = useState({ password: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setProfile({ ...profile, [name]: value });
    };


    const handleSave = () => {
        setIsEditing(false);
        axios.put(apiBase, profile)
            .then(res => console.log("Profile updated:", res.data))
            .catch(err => console.error(err));
    };

    //initializing that are false
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);

    useEffect(() => {
        axios.get(apiBase).then((res) => setProfile(res.data)).catch((err) => console.error(err));

    }, []);


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