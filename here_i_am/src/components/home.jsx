import { Link } from "react-router-dom";
import "../css/home.css";

// Navbar in same file
function NavbarLandingPage() {
  return (
    <header className="lp-nav-container">
      <div className="lp-nav-inner">
        {/* Logo */}
        <div className="lp-logo">
          <span className="lp-logo-icon">◆</span>
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
      <NavbarLandingPage />

      <main className="lp-main">
        {/* Hero */}
        <section className="lp-hero">
          <h1>Welcome to Here I Am</h1>
          <p>Your personal assistant for reminders, tasks and notes.</p>
        </section>

        {/* 4 rectangles (2x2 grid) */}
        <section className="lp-rect-section">
          <div className="lp-rect-grid">
            <Link to="/login" className="lp-rect">
              <h3>Rectangle 1</h3>
              <p>Click to go to login.</p>
            </Link>

            <Link to="/login" className="lp-rect">
              <h3>Rectangle 2</h3>
              <p>Click to go to login.</p>
            </Link>

            <Link to="/login" className="lp-rect">
              <h3>Rectangle 3</h3>
              <p>Click to go to login.</p>
            </Link>

            <Link to="/login" className="lp-rect">
              <h3>Rectangle 4</h3>
              <p>Click to go to login.</p>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}