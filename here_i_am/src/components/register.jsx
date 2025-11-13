import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/login.css';

function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !surname || !email || !password) return setError('All fields required');

    fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, surname, email, password }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) return setError(body.message || 'Registration failed');
        setSuccess('Registered. Check your email for verification (link expires in 15 minutes).');
        // Optionally navigate to login
        setTimeout(() => navigate('/'), 1500);
      })
      .catch((err) => setError('Unable to contact server'));
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <div className="login-error">{error}</div>}
        {success && <div style={{ background: '#e6ffea', color: '#006400', padding: '8px', borderRadius: 4, marginBottom: 8 }}>{success}</div>}

        <div className="field">
          <label className="koupas">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label className="koupas">Surname</label>
          <input value={surname} onChange={(e) => setSurname(e.target.value)} />
        </div>

        <div className="field">
          <label className="koupas">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="field">
          <label className="koupas">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>

        <div className="field">
          <label className="koupas">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </div>

        <button type="submit" className="login-btn">Register</button>

        <div className="login-links" style={{ marginTop: 12 }}>
          <Link to="/">Already have an account? Login Here</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;