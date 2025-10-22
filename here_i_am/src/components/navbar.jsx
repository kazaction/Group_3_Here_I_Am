import React from "react";
import { Link } from 'react-router-dom';
//import '/src/navbar.css';

const Navbar = () => {
    return(
        <nav className='navbar'>
            <ul className='nav-links'>
                <li><Link to=''>Home</Link></li>
                <li><Link to=''>Events</Link></li>
                <li><Link to=''>Scheduales</Link></li>
                <li><Link to=''>Profile</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;