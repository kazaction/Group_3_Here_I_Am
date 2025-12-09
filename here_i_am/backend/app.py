from flask import Flask, request, jsonify, send_from_directory, g
from flask_cors import CORS
import sqlite3
import os
import re
from cv_routes import cv_bp
from email_services import sign_up
from email_services import forgot_password
from werkzeug.utils import secure_filename
from email_services import event_reminder
from email_services import event_creation
from upload_services import save_file
import jwt
from functools import wraps
from datetime import datetime, timedelta

app = Flask(__name__)

# ================= JWT CONFIG =================
SECRET_KEY = "CHANGE_THIS_TO_A_RANDOM_SECRET"  # use env var in production
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = 60


def create_token(user_id, username):
    """Create JWT token for a user."""
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MINUTES),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
    # In newer PyJWT, this is already a str; in older it's bytes
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def login_required(f):
    """Decorator to protect routes with JWT."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing"}), 401

        token = auth_header.split(" ", 1)[1]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        user_id = payload.get("user_id")
        if user_id is None:
            return jsonify({"error": "Invalid token payload"}), 401

        # store user id in flask's global context
        g.current_user_id = user_id
        g.current_username = payload.get("username")

        return f(*args, **kwargs)

    return wrapper


# =============== FILE / PICTURES SETUP ===============
PICTURES_FOLDER = os.path.join(os.path.dirname(__file__), "Pictures")
os.makedirs(PICTURES_FOLDER, exist_ok=True)  # create if not exists
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# allow requests from React frontend
CORS(app)

# path to database
DB_PATH = os.path.join(os.path.dirname(__file__), "db", "database.db")


def get_db_connection():
    conn = sqlite3.connect("./db/database.db")
    conn.row_factory = sqlite3.Row
    return conn


# ===================== AUTH =====================

# Login function - accept username OR email
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    credential = data.get("credential")  # can be username or email
    password = data.get("password")

    if not credential or not password:
        return jsonify({"success": False, "error": "Missing credential or password"}), 400

    conn = get_db_connection()
    # Try to find user by username or email
    user = conn.execute(
        "SELECT id, username, email, password FROM users WHERE username = ? OR email = ?",
        (credential, credential),
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    # NOTE: still plain text compare (no hashing) as requested
    if user["password"] != password:
        return jsonify({"success": False, "error": "Incorrect Password"}), 401

    # create JWT token
    token = create_token(user["id"], user["username"])

    # return token + user info
    return jsonify({
        "success": True,
        "user_id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "token": token,
    })


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    surname = (data.get("surname") or "").strip()
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not all([name, surname, username, email, password]):
        return jsonify({"message": "All fields required"}), 400

    conn = get_db_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            (username, email),
        ).fetchone()
        if existing:
            return jsonify({"message": "Username or email already in use"}), 409

        # NOTE: password stored as plain text (you should hash in production)
        conn.execute(
            "INSERT INTO users (name, surname, username, email, password) VALUES (?, ?, ?, ?, ?)",
            (name, surname, username, email, password),
        )
        sign_up(email)
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Registered"}), 201


# ===================== USER ROUTES =====================

# Get user info by id
@app.route("/users/<int:user_id>", methods=["GET"])
@login_required
def get_user(user_id):
    # Only allow the logged-in user to get their own data
    if g.current_user_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    user_dict = dict(user)

    # Never return password
    user_dict.pop("password", None)

    # If profile_picture has a filename, convert to full URL
    if user_dict.get("profile_picture"):
        filename = user_dict["profile_picture"]
        user_dict["profile_picture"] = f"http://localhost:3001/pictures/{filename}"

    return jsonify(user_dict)


# Update user info
@app.route("/users/<int:user_id>", methods=["PUT"])
@login_required
def update_user(user_id):
    # Only allow the logged-in user to update their own data
    if g.current_user_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}
    fields = ["name", "surname", "email", "profile_picture"]

    updates = [f"{field} = ?" for field in fields if field in data]
    values = [data[field] for field in fields if field in data]

    if not updates:
        return jsonify({"error": "No valid fields provided"}), 400

    conn = get_db_connection()
    conn.execute(
        f"UPDATE users SET {', '.join(updates)} WHERE id = ?",
        (*values, user_id),
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "User updated successfully"})


# Check password
@app.route("/users/<int:user_id>/check-password", methods=["POST"])
@login_required
def check_password(user_id):
    # Only allow the logged-in user
    if g.current_user_id != user_id:
        return jsonify({"valid": False}), 403

    data = request.get_json() or {}
    password = data.get("password")

    conn = get_db_connection()
    user = conn.execute(
        "SELECT password FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()
    conn.close()

    # NOTE: plain text compare
    if user and user["password"] == password:
        return jsonify({"valid": True})
    return jsonify({"valid": False})


# update password
@app.route("/users/<int:user_id>/update-password", methods=["PUT"])
@login_required
def update_password(user_id):
    # Only allow the logged-in user
    if g.current_user_id != user_id:
        return jsonify({"success": False}), 403

    data = request.get_json() or {}
    new_password = data.get("newPassword")

    if not new_password:
        return jsonify({"error": "Missing new password"}), 400

    conn = get_db_connection()
    conn.execute(
        "UPDATE users SET password = ? WHERE id = ?",
        (new_password, user_id),
    )
    conn.commit()
    changes = conn.total_changes
    conn.close()

    if changes == 0:
        return jsonify({"success": False})
    return jsonify({"success": True})


# Register the blueprint for CV routes
app.register_blueprint(cv_bp)


# ===================== PICTURES =====================

@app.route("/pictures/<filename>")
def get_picture(filename):
    return send_from_directory(PICTURES_FOLDER, filename)


@app.route("/users/<int:user_id>/profile-picture", methods=["POST"])
@login_required
def upload_profile_picture(user_id):
    # Only allow the logged-in user
    if g.current_user_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    if "profile_picture" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["profile_picture"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only .jpg, .jpeg, .png allowed."}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = secure_filename(f"user_{user_id}.{ext}")
    save_path = os.path.join(PICTURES_FOLDER, filename)
    file.save(save_path)

    # Save filename in DB
    conn = get_db_connection()
    conn.execute(
        "UPDATE users SET profile_picture = ? WHERE id = ?",
        (filename, user_id),
    )
    conn.commit()
    conn.close()

    url = f"http://localhost:3001/pictures/{filename}"
    return jsonify({"profile_picture": url}), 200


# ===================== HISTORY =====================

@app.route("/history", methods=["GET"])
@login_required
def get_events():
    conn = get_db_connection()
    try:
        # Ignore any user_id passed and use the one from the token
        user_id = g.current_user_id
        rows = conn.execute(
            "SELECT * FROM events WHERE user_id = ?",
            (user_id,),
        ).fetchall()
    finally:
        conn.close()
    return jsonify([dict(r) for r in rows])


######################################## for eventlist #######################################

@app.route("/events", methods=["POST"])
@login_required
def create_event():
    if request.content_type and request.content_type.startswith("multipart/form-data"):
        data = request.form
    else:
        data = request.get_json(silent=True) or {}

    print("Incoming /events POST:", data)

    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    date = (data.get("date") or "").strip()       # "YYYY-MM-DD"
    time = (data.get("time") or "").strip()       # "HH:MM" or ""
    importance = data.get("importance", 0)

    # Always use user_id from token
    user_id = g.current_user_id

    if not title or not date:
        print("Missing title or date")
        return jsonify({"error": "title and date are required"}), 400

    # datetime strings
    if time:
        start_dt = f"{date}T{time}:00"
    else:
        start_dt = f"{date}T00:00:00"
    end_dt = start_dt

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            INSERT INTO events (user_id, event_id, title, description,
                                start_time_utc, end_time_utc, importance)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                None,
                title,
                description,
                start_dt,
                end_dt,
                importance,
            ),
        )
        conn.commit()

        event_id = cur.lastrowid

        # calling the save_file function kikos made
        file = request.files.get("file")
        if file and file.filename:
            save_file(file, user_id, event_id)

        cur.execute("SELECT email FROM users WHERE id = ?", (user_id,))
        user_row = cur.fetchone()
        user_email = user_row["email"] if user_row else None

        if user_email:
            try:
                event_creation(
                    email=user_email,
                    title=title,
                    description=description,
                    start_time_utc=start_dt,
                    importance=str(importance),
                )
            except Exception as e:
                # You probably don't want email failure to break the API
                print("Error sending event creation email:", repr(e))

    except Exception as e:
        conn.rollback()
        print(" DB error on INSERT into events:", repr(e))
        return jsonify({"error": "database error", "details": str(e)}), 500

    row = conn.execute(
        "SELECT * FROM events WHERE id = ?",
        (event_id,),
    ).fetchone()
    conn.close()

    print("Event inserted with id:", event_id)
    return jsonify(dict(row)), 201


@app.route("/events", methods=["GET"])
@login_required
def list_events_for_day():
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "missing date parameter"}), 400

    user_id = g.current_user_id

    start_dt = f"{date}T00:00:00"
    end_dt = f"{date}T23:59:59"

    conn = get_db_connection()
    rows = conn.execute(
        """
        SELECT * FROM events
        WHERE user_id = ?
          AND start_time_utc BETWEEN ? AND ?
        ORDER BY start_time_utc
        """,
        (user_id, start_dt, end_dt),
    ).fetchall()
    conn.close()

    return jsonify([dict(r) for r in rows])


######################################## for eventlist #######################################

# had to manually import the file in the app.py 
def save_file_local(file_storage, user_id, event_id):
    """
    file_storage = request.files["file"]
    """
    filename = file_storage.filename
    file_data = file_storage.read()

    # Save to database
    conn = sqlite3.connect("./db/database.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO uploads (filename, filedata, user_id, event_id) VALUES (?, ?, ?, ?)",
        (filename, file_data, user_id, event_id),
    )
    conn.commit()
    conn.close()

    print(f"File saved successfully: {filename}")
    return filename


# Run Flask
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3001)