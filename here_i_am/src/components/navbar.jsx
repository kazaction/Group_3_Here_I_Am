import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import feather from "feather-icons";
import "../css/navbar.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    feather.replace();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <ul className="navbar__menu top-menu">
          

          {/* this commented out so that he home button is not outputted */}
          {/* <li className="navbar__item">
            <Link to="/home" className="navbar__link">
              <i data-feather="home"></i>
              <span>Here I Am</span>
            </Link>
          </li> */}
         
          <li className="navbar__item">
            <Link to="/schedule" className="navbar__link">
              <i data-feather="calendar"></i>
              <span>Schedule</span>
            </Link>
          </li>
          <li className="navbar__item">
            <Link to="/history" className="navbar__link">
              <i data-feather="clock"></i>
              <span>History</span>
            </Link>
          </li>
          <li className="navbar__item">
            <Link to="/cvGeneration" className="navbar__link">
              <i data-feather="file-text"></i>
              <span>CV Generation</span>
            </Link>
          </li>
          <li className="navbar__item">
            <Link to="/minigame" className="navbar__link">
              <i data-feather="headphones"></i>
              <span>MiniGame</span>
            </Link>
          </li>
        </ul>

        <ul className="navbar__menu bottom-menu">
          <li className="navbar__item">
            <Link to="/profile" className="navbar__link">
              <img src={logo} alt="Profile" className="profile-logo" />
              <span>Profile</span>
            </Link>
          </li>
          <li className="navbar__item">
            <div onClick={() => setShowLogoutModal(true)} className="navbar__link logout-btn">
              <i data-feather="log-out"></i>
              <span>Logout</span>
            </div>
          </li>
        </ul>
      </nav>

      {showLogoutModal && (
        <div className="logout-overlay">
          <div className="logout-dialog">
            <h3>Are you sure you want to logout?</h3>
            <div className="logout-actions">
              <button onClick={handleLogout} className="btn-yes">Yes</button>
              <button onClick={() => setShowLogoutModal(false)} className="btn-no">No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
