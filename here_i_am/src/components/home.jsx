import { Link } from "react-router-dom";
import "../css/home.css";

// Navbar in same file
function NavbarLandingPage() {
  return (
    <header className="lp-nav-container">
      <div className="lp-nav-inner">
        {/* Logo */}
        <div className="lp-logo">
          <span className="lp-logo-text">Here I Am</span>
        </div>

        {/* Right buttons */}
        <div className="lp-nav-actions">
          <Link to="/login" className="lp-btn lp-btn-ghost">
            Sign In
          </Link>
          <Link to="/register" className="lp-btn lp-btn-primary">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* <NavbarLandingPage /> */}

      <main className="lp-main">
        {/* Hero */}
        <section className="lp-hero">
          <h1>Welcome to <span>Here I Am</span></h1>
          <p>Your personal assistant for reminders, tasks and notes.</p>
        </section>

        {/* 4 rectangles (2x2 grid) */}
        <section className="lp-rect-section">
          <div className="lp-rect-grid">
           <Link to="/schedule" className="lp-rect">
              <h3>Schedule Your Tasks</h3>
              <p>Start scheduling you tasks!</p>
            </Link>

            <Link to="/history" className="lp-rect">
              <h3>View Your Past and Scheduled Tasks</h3>
              <p>Have acces to your Agenda!</p>
            </Link>

            <Link to="/cvGeneration" className="lp-rect">
              <h3>Create Your Unique CV</h3>
              <p>Allow us to help showcase Yourself!</p>
            </Link>

            <Link to="/minigame" className="lp-rect">
              <h3>Play a fun Old-School Minigame!</h3>
              <p>Enjoy a time in between your checkings!</p>
            </Link>

          </div>
        </section>
      </main>
    </>
  );
}