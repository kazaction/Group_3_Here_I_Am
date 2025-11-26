import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/login.css';

function Login() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    if (!credential) {
      setError('Username or email is required');
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

    // Call backend to verify credentials
    fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, password }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body.error || body.message || 'Login failed');
          return;
        }
        // success — store user info from Flask response
        if (body.user_id && body.username) {
          localStorage.setItem('user', JSON.stringify({ user_id: body.user_id, username: body.username, email: body.email }));
          localStorage.setItem('auth', 'true');
        }
        navigate('/home');
      })
      .catch((err) => {
        console.error('Login error', err);
        setError('Unable to contact server');
      });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="login-error">{error}</div>}

        <div className="field">
          <label className="koupas" htmlFor="credential">Username or Email</label>
          <input
            id="credential"
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder="Username or Email"
          />
        </div>

        <div className="field">
          <label className="koupas" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <button type="submit" className="login-btn">Login</button>

        <div className="login-links">
          {/* Placeholder links - implement functionality later */}
          <Link to="/forgot">Forgot password?</Link>
          <span className="separator">&nbsp;·&nbsp;</span>
          <Link to="/register">Don't have an account? Register here</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;