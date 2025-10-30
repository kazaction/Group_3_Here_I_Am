import React from "react";
import logo from '../assets/logo.png';
import "../css/profile.css";

const Profile = () => {
    return (
        <div>
            <img src={logo} alt="Logo" />

            <label>Name:</label>
            <input type = "tetx" name = "name" />
            <br/>

            <lable>Surname:</lable>
            <input type = "text" name = "surname" />
            <br/>

            <lable>Username:</lable>
            <input type = "text" name = "username" />
            <br/>

            <lable>Email Address:</lable>
            <input type = "email" name = "email" />
            <br/>

            <lable>Password:</lable>
            <input type = "password" name = "password" />
        </div>
    );
};

export default Profile;