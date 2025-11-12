import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import feather from "feather-icons";
import "../css/navbar.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  useEffect(() => {
    feather.replace(); // initialize Feather icons
  }, []);

  return (
    <nav className="navbar">
      <ul className="navbar__menu top-menu">
        <li className="navbar__item">
          <Link to="/home" className="navbar__link">
            <i data-feather="home"></i>
            <span>Here I Am</span>
          </Link>
        </li>
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
      </ul>

      {/* Profile pinned to bottom */}
      <ul className="navbar__menu bottom-menu">
        <li className="navbar__item">
          <Link to="/profile" className="navbar__link">
            <img src={logo} alt="Profile" className="profile-logo" />
            <span>Profile</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
