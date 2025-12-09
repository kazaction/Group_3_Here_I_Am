import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/login.css';

function Login() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    setError('');

    fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, password }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));

        // If Flask returned an error status (4xx/5xx)
        if (!res.ok) {
          setError(body.error || body.message || 'Login failed');
          return;
        }

        // For the JWT backend we wrote, response looks like:
        // { success: true, user_id, username, email, token }
        if (!body.success) {
          setError(body.error || 'Login failed');
          return;
        }

        if (body.user_id && body.username && body.token) {
          // 🔐 store everything, including token
          localStorage.setItem(
            'user',
            JSON.stringify({
              user_id: body.user_id,
              username: body.username,
              email: body.email,
              token: body.token,          // 👈 IMPORTANT
            })
          );
          localStorage.setItem('auth', 'true'); // optional, if you use it elsewhere
        } else {
          setError('Invalid response from server');
          return;
        }

        navigate('/home');
      })
      .catch((err) => {
        console.error('Login error', err);
        setError('Unable to contact server');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="login-error">{error}</div>}

        <div className="field">
          <label className="koupas" htmlFor="credential">
            Username or Email
          </label>
          <input
            id="credential"
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder="Username or Email"
          />
        </div>

        <div className="field">
          <label className="koupas" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="login-links">
          <Link to="/forgot">Forgot password?</Link>
          <span className="separator">&nbsp;·&nbsp;</span>
          <Link to="/register">Don't have an account? Register here</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;