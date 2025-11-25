import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';

function ForgotPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  const validateEmail = (emailValue) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(emailValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter an email address');
      setMessageType('error');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Incorrect format, Please try again!');
      setMessageType('error');
      return;
    }

    // Email is valid
    setMessage('If the email is correct, a new password was sent to your email.');
    setMessageType('success');
    
    // Reset form after 2 seconds
    setTimeout(() => {
      setEmail('');
      setMessage('');
      setMessageType('');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        {message && (
          <div className={messageType === 'success' ? 'forgot-success' : 'login-error'}>
            {message}
          </div>
        )}

        <div className="field">
          <label className = "koupas" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button type="submit" className="login-btn" style={{ flex: 1 }}>
            Reset password
          </button>
          <button 
            type="button" 
            className="login-btn" 
            onClick={handleCancel}
            style={{ flex: 1, background: '#999' }}
          >
            Back to Login Page
          </button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPage;
