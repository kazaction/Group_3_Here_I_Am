require('dotenv').config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_env_secret';

// Connect to SQLite database
const path = require("path");
const dbPath = path.join(__dirname, "db", "database.db"); // points to your actual DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database connection error:", err.message);
  else console.log("Connected to SQLite database.");
});

// Initialize DB schema if missing
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      surname VARCHAR(100) NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      verified INTEGER DEFAULT 0,
      profile_picture VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Seed a test user if table is empty (username: testuser, email: test@example.com, password: test123)
  db.get("SELECT COUNT(*) AS cnt FROM users", (err, row) => {
    if (err) return console.error('Error checking users table:', err.message);
    if (row && row.cnt === 0) {
      db.run(
        `INSERT INTO users (name, surname, username, email, password, profile_picture) VALUES (?,?,?,?,?,?)`,
        [
          'Test',
          'User',
          'testuser',
          'test@example.com',
          'test123',
          null,
        ],
        (err) => {
          if (err) console.error('Error seeding user:', err.message);
          else console.log('Seeded test user: test@example.com / test123');
        }
      );
    }
  });
});

// Ensure 'verified' column exists (for older DBs)
db.serialize(() => {
  db.all("PRAGMA table_info(users)", (err, cols) => {
    if (err) return console.error('pragma error', err.message);
    const hasVerified = cols && cols.some(c => c.name === 'verified');
    if (!hasVerified) {
      db.run('ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0', (err) => {
        if (err) console.error('Error adding verified column:', err.message);
        else console.log('Added verified column to users table');
      });
    }
  });
});


// ✅ GET user by username (React calls this in useEffect)
app.get("/users/:username", (req, res) => {
  const { username } = req.params;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: "User not found" });
    res.json(row);
  });
});


// ✅ UPDATE user info (React calls this in handleSave)
app.put("/users/:username", (req, res) => {
  const { username } = req.params;
  const { name, surname, email, password, profile_picture } = req.body;

  db.run(
    `UPDATE users 
     SET name = ?, surname = ?, email = ?, password = ?, profile_picture = ?
     WHERE username = ?`,
    [name, surname, email, password, profile_picture, username],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User updated successfully", changes: this.changes });
    }
  );
});


// POST /login - authenticate user
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!row) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // NOTE: Passwords are stored in plaintext in this example. Replace with hashed passwords in production.
    if (row.password !== password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (row.verified === 0) return res.status(403).json({ success: false, message: 'Email not verified' });

    // Authentication successful — return basic user info (omit password)
    const { id, name, surname, username } = row;
    res.json({ success: true, user: { id, name, surname, username, email } });
  });
});

// POST /register - create a new user and send verification email
app.post('/register', (req, res) => {
  const { name, surname, email, password } = req.body;
  if (!name || !surname || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });

  // basic username generation
  const username = (name + '_' + surname).replace(/\s+/g, '_').toLowerCase();

  db.run(
    `INSERT INTO users (name, surname, username, email, password, verified) VALUES (?,?,?,?,?,0)`,
    [name, surname, username, email, password],
    function (err) {
      if (err) {
        if (err.message && err.message.includes('UNIQUE')) return res.status(409).json({ success: false, message: 'Email or username already exists' });
        return res.status(500).json({ success: false, message: err.message });
      }

      const userId = this.lastID;

      // create a short-lived verification token (15 minutes)
      const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '15m' });

      // send verification email
      // Create a transport using environment variables (configure for your SMTP server)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'user@example.com',
          pass: process.env.SMTP_PASS || 'password',
        },
      });

      const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify?token=${token}`;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@example.com',
        to: email,
        subject: 'Please verify your email',
        text: `Click the link to verify your email: ${verifyUrl}. This link expires in 15 minutes.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending verification email:', error);
          return res.status(500).json({ success: false, message: 'User created but failed to send verification email' });
        }
        res.json({ success: true, message: 'Registered. Verification email sent.' });
      });
    }
  );
});

// GET /verify - verify email by token
app.get('/verify', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Missing token');

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).send('Invalid or expired token');

    const { id } = decoded;
    db.run('UPDATE users SET verified = 1 WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).send('Database error');
      res.send('Email verified. You can close this window and login.');
    });
  });
});


// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
