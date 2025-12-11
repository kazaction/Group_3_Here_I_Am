// src/pages/landing.jsx
import { Link } from "react-router-dom";
import "../css/landing.css"; 

function LogoutLandingPage() {
  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        {/* Logo */}
        <div className="landing-logo">
          <span className="landing-logo-text">Here I Am</span>
        </div>

        {/* Right buttons */}
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-btn landing-btn-ghost">
            Sign In
          </Link>
          <Link to="/register" className="landing-btn landing-btn-primary">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <LogoutLandingPage />

      <main className="landing-main">
        {/* Hero */}
        <section className="landing-hero">
          <h1>
            Welcome to <span>Here I Am</span>
          </h1>
          <p>Your personal assistant for Scheduling Tasks, Notes and CV Generation.</p>
        </section>

        {/* 4 rectangles (2x2 grid) */}
        <section className="landing-section">
          <div className="landing-grid">
            <Link to="/login" className="landing-card">
              <h3>Schedule Your Tasks</h3>
              <p>Start scheduling your tasks!</p>
            </Link>

            <Link to="/login" className="landing-card">
              <h3>View Your Past and Scheduled Tasks</h3>
              <p>Have access to your Agenda!</p>
            </Link>

            <Link to="/login" className="landing-card">
              <h3>Create Your Unique CV</h3>
              <p>Allow us to help showcase Yourself!</p>
            </Link>

            <Link to="/login" className="landing-card">
              <h3>Play a fun Old-School Minigame!</h3>
              <p>Enjoy a time in between your checkings!</p>
            </Link>
          </div>

        </section>
      </main>
    </div>
  );
}
