import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import './navbar.css'

import Hello from './components/hello';



function App() {
  return (
    <Router>
      <div>
        <Navbar />
      </div>
     </Router> 
  );
}

export default App;
