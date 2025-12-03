import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';
import Schedule from './components/schedule';
import Profile from './components/profile';
import Login from './components/login';
import Register from './components/register';
import ForgotPage from './components/ForgotPage';
import Home from './components/home';
import ChangePasswordPopup from './components/openPasswordWindow';
import StartMiniGame from './components/minigame';
import CvGeneration from './components/cvGeneration';
import History from './components/history';

// Render Navbar only on non-login routes
function NavbarWrapper() {
  const location = useLocation();
  if (location.pathname === '/' || location.pathname === '/register' || location.pathname === '/forgot') return null;
  return <Navbar />;
}

// Main content container adjusts layout based on current route
function MainRoutes() {
  const location = useLocation();
  // remove left margin for login so the login component can center itself
  const isAuthless = location.pathname === '/' || location.pathname === '/register' || location.pathname === '/forgot';
  const containerStyle = isAuthless ? { padding: '20px' } : { marginLeft: '200px', padding: '20px' };

  return (
    <div style={containerStyle}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/change-password" element={<ChangePasswordPopup userId={1}/>} />
        <Route path="/minigame" element={<StartMiniGame />} />
        <Route path="/cvGeneration" element={<CvGeneration />} />
        <Route path="/history" element={<History />} />
        {/* Add more routes like: */}
        {/* <Route path="/history" element={<History />} /> */}
        
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