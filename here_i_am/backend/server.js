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


// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
