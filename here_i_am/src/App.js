import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';
import Schedule from './components/schedule';
import Profile from './components/profile';
import Login from './components/login';
import Register from './components/register';
import Home from './components/home';

// Render Navbar only on non-login routes
function NavbarWrapper() {
  const location = useLocation();
  if (location.pathname === '/' || location.pathname === '/register') return null;
  return <Navbar />;
}

// Main content container adjusts layout based on current route
function MainRoutes() {
  const location = useLocation();
  // remove left margin for login so the login component can center itself
  const isAuthless = location.pathname === '/' || location.pathname === '/register';
  const containerStyle = isAuthless ? { padding: '20px' } : { marginLeft: '200px', padding: '20px' };

  return (
    <div style={containerStyle}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<Home />} />
        {/* Add more routes like: */}
        {/* <Route path="/history" element={<History />} /> */}
        {/* <Route path="/cv" element={<CVGeneration />} /> */}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <NavbarWrapper />
      <MainRoutes />
    </Router>
  );
}

export default App;
