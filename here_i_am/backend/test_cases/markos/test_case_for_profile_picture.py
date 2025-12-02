import os
import io
import shutil
import sqlite3
from pathlib import Path

import pytest

import app as flask_app_module  # this imports your app.py


# Paths for test DB and pictures
BASE_DIR = Path(__file__).resolve().parent
TEST_DB = BASE_DIR / "test_database.db"
TEST_PICTURES_DIR = BASE_DIR / "test_pictures"


def setup_module(module):
    """
    Runs once before all tests:
    - Create fresh test DB with 'users' table
    - Insert one test user (id = 1)
    - Point app.DB_PATH and app.PICTURES_FOLDER to test locations
    """
    # Clean old artifacts if any
    if TEST_DB.exists():
        TEST_DB.unlink()
    if TEST_PICTURES_DIR.exists():
        shutil.rmtree(TEST_PICTURES_DIR)
    TEST_PICTURES_DIR.mkdir(parents=True, exist_ok=True)

    # Create test DB schema
    conn = sqlite3.connect(TEST_DB)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE users (
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

    # Insert test user with id = 1
    cur.execute("""
        INSERT INTO users (name, surname, username, email, password, profile_picture)
        VALUES ('Meowth', 'Meow', 'TR_Meowth', 'meowth@teamrocket.com', 'JessieJamesMeowth', NULL)
    """)

    conn.commit()
    conn.close()

    # Point the real app to our test DB and pictures folder
    flask_app_module.DB_PATH = str(TEST_DB)
    flask_app_module.PICTURES_FOLDER = str(TEST_PICTURES_DIR)

    # Expose app for tests
    global app
    app = flask_app_module.app
    app.config["TESTING"] = True


def teardown_module(module):
    """
    Clean up after all tests:
    - Delete test DB file
    - Delete test pictures folder
    """
    if TEST_DB.exists():
        TEST_DB.unlink()
    if TEST_PICTURES_DIR.exists():
        shutil.rmtree(TEST_PICTURES_DIR)


def get_user_from_db(user_id=1):
    """
    Helper to fetch user row from the test DB.
    Returns tuple:
    (id, name, surname, username, email, password, profile_picture)
    """
    conn = sqlite3.connect(TEST_DB)
    cur = conn.cursor()
    cur.execute("""
        SELECT id, name, surname, username, email, password, profile_picture
        FROM users WHERE id = ?
    """, (user_id,))
    row = cur.fetchone()
    conn.close()
    return row


# 1) Successful Profile Update with Valid Data
def test_successful_profile_update_persists_to_db():
    client = app.test_client()

    # New values we expect to be saved
    new_data = {
        "name": "Giovanni",
        "surname": "RocketBoss",
        "email": "giovanni@teamrocket.com"
    }

    # Call PUT /users/1
    resp = client.put("/users/1", json=new_data)
    assert resp.status_code == 200
    assert resp.get_json().get("message") == "User updated successfully"

    # Verify in DB
    row = get_user_from_db(1)
    # row: (id, name, surname, username, email, password, profile_picture)
    assert row[1] == "Giovanni"
    assert row[2] == "RocketBoss"
    assert row[4] == "giovanni@teamrocket.com"


# 2) Successful Profile Picture Upload and Persistence
def test_successful_profile_picture_upload():
    client = app.test_client()

    # Create a fake JPEG file in memory
    fake_image = io.BytesIO(b"fake-jpeg-data")
    fake_image.name = "avatar.jpg"

    # Call POST /users/1/profile-picture
    resp = client.post(
        "/users/1/profile-picture",
        content_type="multipart/form-data",
        data={"profile_picture": (fake_image, "avatar.jpg")},
    )

    assert resp.status_code == 200
    data = resp.get_json()
    assert "profile_picture" in data

    # URL returned by backend, e.g. http://localhost:3001/pictures/user_1.jpg
    url = data["profile_picture"]
    assert url.endswith("user_1.jpg")

    # Verify DB entry updated to 'user_1.jpg'
    row = get_user_from_db(1)
    assert row[6] == "user_1.jpg"

    # Verify file exists in test_pictures directory
    saved_path = TEST_PICTURES_DIR / "user_1.jpg"
    assert saved_path.exists()