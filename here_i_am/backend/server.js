const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

    // Authentication successful — return basic user info (omit password)
    const { id, name, surname, username } = row;
    res.json({ success: true, user: { id, name, surname, username, email } });
  });
});


// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
