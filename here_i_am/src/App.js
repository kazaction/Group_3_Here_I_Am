import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import Landing from './components/landing';

// Check if user is authenticated
const isAuthenticated = () => {
  const auth = localStorage.getItem('auth');
  const user = localStorage.getItem('user');
  return auth === 'true' && user !== null;
};

// Protected Route Component
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Render Navbar only on non-login routes
function NavbarWrapper() {
  const location = useLocation();
  if (location.pathname === '/landing' || location.pathname === '/register' || location.pathname === '/forgot' || location.pathname === '/login' || location.pathname === '/') return null;
  return <Navbar />;
}

// || location.pathname == '/home'

// Main content container adjusts layout based on current route
function MainRoutes() {
  const location = useLocation();
  // remove left margin for login so the login component can center itself
  const isAuthless = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot' || location.pathname === '/' || location.pathname === '/landing';
  const containerStyle = isAuthless ? { padding: '20px' } : { marginLeft: '200px', padding: '20px' };

  return (
    <div style={containerStyle}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPage />} />
        
        {/* Protected routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPopup /></ProtectedRoute>} />
        <Route path="/minigame" element={<ProtectedRoute><StartMiniGame /></ProtectedRoute>} />
        <Route path="/cvGeneration" element={<ProtectedRoute><CvGeneration /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  // Clear localStorage on app launch
  React.useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <Router>
      <NavbarWrapper />
      <MainRoutes />
    </Router>
  );
}

export default App;