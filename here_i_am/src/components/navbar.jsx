import React from "react";
import { Link } from 'react-router-dom';
import '../css/navbar.css';

const Navbar = () => {
    return(
        <nav className='navbar'>
            <ul className='nav-links'>
                <li><Link to='/'>Here I Am</Link></li>
                <li><Link to='/schedule'>Schedule</Link></li>
                <li><Link to='/history'>History</Link></li>
                <li><Link to='/cvGeneration'>CV Generation</Link></li>
                <li><Link to='/profile'>Profile</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;