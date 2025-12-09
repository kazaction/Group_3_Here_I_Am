import sqlite3
from pathlib import Path
import pytest

TEST_DB = Path(__file__).resolve().parent / "test_database.db"


def setup_module(module):
    """
    Runs once before all tests: 
    - creates a fresh test DB
    - creates users + events tables
    - inserts Meowth user
    """
    conn = sqlite3.connect(TEST_DB)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    # create users table
    cur.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL
    )
    """)

    # insert test user
    cur.execute("INSERT INTO users (username) VALUES ('TR_Meowth')")

    # create events table
    cur.execute("""
    CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_time_utc DATETIME,
    end_time_utc DATETIME,
    importance INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

    conn.commit()
    conn.close()


def teardown_module(module):
    """
    Removes test database after all tests are done
    """
    if TEST_DB.exists():
        TEST_DB.unlink()


def insert_event():
    """Runs the same logic as your script"""
    conn = sqlite3.connect(TEST_DB)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE username = ?", ("TR_Meowth",))
    row = cur.fetchone()

    if row is None:
        raise Exception("User not found — run init_db.py first!")

    user_id = row[0]

    cur.execute("""
    INSERT INTO events (user_id, title, description, start_time_utc, end_time_utc, importance)
    VALUES (?, 'Battle Plan', 'Steal Pikachu', '2025-01-01 10:00', '2025-01-01 12:00', 5)
    """, (user_id,))

    conn.commit()
    conn.close()


def test_event_inserts_successfully():
    insert_event()

    conn = sqlite3.connect(TEST_DB)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM events")
    count = cur.fetchone()[0]

    conn.close()

    assert count == 1


def test_event_links_to_correct_user():
    insert_event()

    conn = sqlite3.connect(TEST_DB)
    cur = conn.cursor()

    cur.execute("""
    SELECT e.user_id, u.username
    FROM events e
    JOIN users u ON e.user_id = u.id
    """)

    row = cur.fetchone()
    conn.close()

    assert row[1] == "TR_Meowth"


def test_raises_error_when_user_missing():
    # remove user
    conn = sqlite3.connect(TEST_DB)
    cur = conn.cursor()
    cur.execute("DELETE FROM users")
    conn.commit()
    conn.close()

    with pytest.raises(Exception, match="User not found"):
        insert_event()
