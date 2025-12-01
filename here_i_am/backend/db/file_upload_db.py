import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parent / "database.db"

print(f"Initializing database at: {db_path}")

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    filedata BLOB,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

conn.commit()
conn.close()

print("Database initialized successfully!")