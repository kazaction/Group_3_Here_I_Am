import React, { useEffect, useState } from "react";
import { useHistory} from "react-router-dom";
import logo from '../assets/logo.png';
import "../css/profile.css";
import axios from "axios";//To connect database with react

const Profile = () => {

    
    const [profile, setProfile] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    //password: "",
    profile_picture: ""
    });

    //test password edit
    const [passwordTest, setProfilePassword] = useState({
        password: ""
    });


    //State for edit mode
    const [isEditing, setIsEditing] = useState(false);

    //test for extra edit button
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    //Hadnle input changes
    const handleChange = (e) => {
        const {name, value} = e.target;
        setProfile({ ...profile, [name]: value});
    };

    //Test password andle inout change
    const handleChangePassword = (e) => {
        const {name, value} = e.target;
        setProfilePassword({ ...passwordTest, [name]: value});
    };

    //Handle save (for now just exit mode)
    const handleSave = () => {
        setIsEditing(false);
        //Here you can call your backend API to save the changes
        axios.put("http://localhost:5000/users/TR_Meowth", profile)
            .then(res => console.log("Profile updated:", res.data))
            .catch(err => console.error(err));
    };

    //Test password handle save
    const handleSavePassword = () => {
        setIsEditingPassword(false);
        axios.put("http://localhost:5000/users/TR_Meowth", passwordTest)
        .then(res => console.log("Profile updated:",res.data))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        axios.get("http://localhost:5000/users/TR_Meowth")
            .then(res => setProfile(res.data))
            .catch(err => console.error(err));
    }, []);

    //Test use effect for password
    useEffect(() => {
    axios.get("http://localhost:5000/users/TR_Meowth")
        .then(res => {
            setProfile(res.data);
            setProfilePassword({ password: res.data.password || "" }); // <-- populate password state
        })
        .catch(err => console.error(err));
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
            
            {!isEditingPassword ? (
            <button onClick={() => setIsEditingPassword(true)}>Edit</button>
            ) : (
                <button onClick={handleSavePassword}>Save</button>
            )}
        </div>

    );
};

export default Profile;