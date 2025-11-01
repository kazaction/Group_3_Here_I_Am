import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleNavbar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger stays outside the sidebar so it’s always clickable */}
      <div className={`hamburger ${isOpen ? "shifted" : ""}`} onClick={toggleNavbar}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={`navbar ${isOpen ? "open" : "closed"}`}>
        <ul className="nav-links">
          <li><Link to="/">Here I Am</Link></li>
          <li><Link to="/schedule">Schedule</Link></li>
          <li><Link to="/history">History</Link></li>
          <li><Link to="/cvGeneration">CV Generation</Link></li>
          
        </ul>

        <ul className="nav-links bottom-links">
          <li><Link to="/profile">Profile</Link></li>
        </ul>

      </nav>
    </>
  );
};

export default Navbar;
