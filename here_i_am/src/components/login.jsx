import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: replace with real auth call
    console.log('Mock login', { email });
    // On success, navigate to a protected page (example: profile)
    navigate('/profile');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="login-error">{error}</div>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button type="submit" className="login-btn">Login</button>

        <div className="login-links">
          {/* Placeholder links - implement functionality later */}
          <Link to="#" onClick={(e) => e.preventDefault()}>Forgot password?</Link>
          <span className="separator">&nbsp;·&nbsp;</span>
          <Link to="#" onClick={(e) => e.preventDefault()}>Don't have an account? Register here</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
