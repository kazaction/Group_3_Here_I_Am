import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';
import Schedule from './components/schedule';
import Profile from './components/profile';
import Login from './components/login';

// Render Navbar only on non-login routes
function NavbarWrapper() {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return <Navbar />;
}

// Main content container adjusts layout based on current route
function MainRoutes() {
  const location = useLocation();
  // remove left margin for login so the login component can center itself
  const containerStyle = location.pathname === '/' ? { padding: '20px' } : { marginLeft: '200px', padding: '20px' };

  return (
    <div style={containerStyle}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile" element={<Profile />} />
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
