import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Schedule from './components/schedule';



function App() {
  return (
    <Router>
      <Navbar />

      <div style={{ marginLeft: '200px', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<h1>Welcome to Here I Am</h1>} />
          <Route path="/schedule" element={<Schedule />} />
          {/* Add more routes like: */}
          {/* <Route path="/history" element={<History />} /> */}
          {/* <Route path="/cv" element={<CVGeneration />} /> */}
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
