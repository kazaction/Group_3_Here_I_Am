# test_add_event.py
import sqlite3
from pathlib import Path
import pytest

TEST_DB = Path(__file__).resolve().parent / "test_add_event.db"


def setup_module(module):
    """
    Runs once before all tests:
    - creates a fresh test DB
    - creates users + events tables
    - inserts a test user used by AddEvent
    """
    conn = sqlite3.connect(TEST_DB)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    # creates table for the users
    cur.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL
    )
    """)

    # insert test user
    cur.execute("INSERT INTO users (username) VALUES ('AddEventUser')")
    user_id = cur.lastrowid

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


def insert_event_from_addEvent(
    title="Team Standup",
    date_str="2025-12-03",   # matches how Schedule/AddEvent send date
    time_str="10:00",        # HH:MM from the time input
    description="Daily sync-up",
    importance=2,
):
    """
    Simulates what the backend does when the create_event form is submitted:
    - finds the logged-in user 
    - builds start_time_utc from date + time
    - inserts row into events table
    """
    conn = sqlite3.connect(TEST_DB)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    # gets the  user id
    cur.execute("SELECT id FROM users WHERE username = ?",
                ("create_event_User",))
    row = cur.fetchone()
    if row is None:
        raise Exception("User not found - user must exist")

    user_id = row[0]

    if time_str:
        start_dt = f"{date_str}T{time_str}:00"
    else:
        start_dt = f"{date_str}T00:00:00"

    end_dt = start_dt  # in your backend you currently use same start/end

    cur.execute(
        """
        INSERT INTO events (user_id, title, description, start_time_utc, end_time_utc, importance)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (user_id, title, description, start_dt, end_dt, importance),
    )

    conn.commit()
    conn.close()


def test_create_event_inserts_event_with_correct_fields():
    """
    Verifies that the create_event flow stores:
    - title
    - description
    - datetime (built from date + time)
    - importance
    - and links it to the correct user
    """
    insert_event_from_addEvent(
        title="Project Meeting",
        date_str="2025-12-03",
        time_str="14:30",
        description="Discuss sprint tasks",
        importance=3,
    )

    conn = sqlite3.connect(TEST_DB)
    cur = conn.cursor()

    cur.execute("""
        SELECT e.user_id, e.title, e.description, e.start_time_utc, e.end_time_utc, e.importance, u.username
        FROM events e
        JOIN users u ON e.user_id = u.id
    """)
    row = cur.fetchone()
    conn.close()

    # unpack for readability
    user_id, title, description, start_dt, end_dt, importance, username = row

    assert username == "AddEventUser"
    assert title == "Project Meeting"
    assert description == "test test test"
    assert start_dt == "2025-12-03T14:30:00"
    assert end_dt == "2025-12-03T14:30:00"
    assert importance == 3  # High in other words


def test_create_event_raises_if_user_missing():
    """
    If the logged-in user does not exist in the DB,
    the insert should fail.
    """

    # remove all users
    conn = sqlite3.connect(TEST_DB)
    cur = conn.cursor()
    cur.execute("DELETE FROM users")
    conn.commit()
    conn.close()

    # now it should not find the way to do it
    with pytest.raises(Exception, match="User not found"):
        insert_event_from_addEvent()
