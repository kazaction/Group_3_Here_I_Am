import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parent / "database.db"

print(f"Initializing database at: {db_path}")

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
INSERT OR IGNORE INTO users (name, surname, username, email, password, profile_picture)
VALUES ('Meowth', 'Meow', 'TR_Meowth', 'meowth@teamrocket.com', 'JessieJamesMeowth', '/Users/markosmavroudi/Group_3_Here_I_Am/here_i_am/backend/Pictures/user_1.png')
""")

conn.commit()
conn.close()

print("✅ Database initialized successfully!")