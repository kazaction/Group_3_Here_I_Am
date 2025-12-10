import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parent / "database.db"

print(f"Initializing database at: {db_path}")

conn = sqlite3.connect(db_path)
conn.execute("PRAGMA foreign_keys = ON")
cur = conn.cursor()

#Create a table for the events and use a Foreign key from the table users that are in the init_db.py
cur.execute("""
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_time_utc DATETIME,
    end_time_utc DATETIME,
    scheduled_to_send DATETIME,
    importance INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

#maybe add the file upload filename and file data in this table for ease of use !

conn.commit()
conn.close()

print("Database initialized successfully!")