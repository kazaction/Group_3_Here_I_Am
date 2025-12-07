import sqlite3
from pathlib import Path

# Go up from backend/db/ → backend/
BASE_DIR = Path(__file__).resolve().parent.parent

# Point to backend/db/database.db
db_path = BASE_DIR / "db" / "database.db"

print(f"Initializing database at: {db_path}")

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    filedata BLOB,
    user_id INTEGER,
    event_id INTEGER,
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

conn.commit()
conn.close()

print("Database initialized successfully!")
