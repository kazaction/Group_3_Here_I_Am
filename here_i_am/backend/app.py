from flask import Flask, request, jsonify, send_from_directory
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


app = Flask(__name__)

# Folder where profile pictures are stored
PICTURES_FOLDER = os.path.join(os.path.dirname(__file__), "Pictures")
os.makedirs(PICTURES_FOLDER, exist_ok=True)  # create if not exists
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# allow rewuests from Rreact frontend
CORS(app)

# path to database
DB_PATH = os.path.join(os.path.dirname(__file__), "db", "database.db")

# function to connect


def get_db_connection():
    conn = sqlite3.connect("./db/database.db")
    conn.row_factory = sqlite3.Row
    return conn

# Login function - accept username OR email


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    credential = data.get("credential")  # can be username or email
    password = data.get("password")

    if not credential or not password:
        return jsonify({"success": False, "error": "Missing credential or password"}), 400

    conn = get_db_connection()
    # Try to find user by username first, then by email
    user = conn.execute(
        "SELECT id, username, email, password FROM users WHERE username = ? OR email = ?", (
            credential, credential)
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    if user["password"] != password:
        return jsonify({"success": False, "error": "Incorrect Password"}), 401

    # return user_id, username, and email from frontend to store
    return jsonify({"success": True, "user_id": user["id"], "username": user["username"], "email": user["email"]})


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
            (username, email)
        ).fetchone()
        if existing:
            return jsonify({"message": "Username or email already in use"}), 409

        # hashed = generate_password_hash(password)
        conn.execute(
            "INSERT INTO users (name, surname, username, email, password) VALUES (?, ?, ?, ?, ?)",
            (name, surname, username, email, password)
        )
        sign_up(email)
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Registered"}), 201

# Get user info by id
@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    # Verify authenticated user can only access their own data
    authenticated_user_id = request.args.get("authenticated_user_id")
    
    if not authenticated_user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        authenticated_user_id = int(authenticated_user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid authentication"}), 401
    
    if authenticated_user_id != user_id:
        return jsonify({"error": "Forbidden - Access denied"}), 403

    conn = get_db_connection()
    try:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        
        if user is None:
            return jsonify({"error": "User not found"}), 404

        user_dict = dict(user)
        
        # Remove password from response for security
        if "password" in user_dict:
            del user_dict["password"]

        # If profile_picture has a filename, convert to full URL
        if user_dict.get("profile_picture"):
            filename = user_dict["profile_picture"]
            user_dict["profile_picture"] = f"http://localhost:3001/pictures/{filename}"

        return jsonify(user_dict)
    finally:
        conn.close()


# Update user info
@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    
    # Verify authenticated user can only update their own data
    authenticated_user_id = data.get("authenticated_user_id")
    
    if not authenticated_user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        authenticated_user_id = int(authenticated_user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid authentication"}), 401
    
    if authenticated_user_id != user_id:
        return jsonify({"error": "Forbidden - Access denied"}), 403
    
    fields = ["name", "surname", "email", "profile_picture"]

    updates = [f"{field} = ?" for field in fields if field in data]
    values = [data[field] for field in fields if field in data]

    if not updates:
        return jsonify({"error": "No valid fields provided"}), 400

    conn = get_db_connection()
    try:
        conn.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE id = ?", (*values, user_id)
        )
        conn.commit()
        return jsonify({"message": "User updated successfully"})
    finally:
        conn.close()


# Check password
@app.route("/users/<int:user_id>/check-password", methods=["POST"])
def check_password(user_id):
    data = request.get_json()
    password = data.get("password")
    authenticated_user_id = data.get("authenticated_user_id")
    
    if not authenticated_user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        authenticated_user_id = int(authenticated_user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid authentication"}), 401
    
    if authenticated_user_id != user_id:
        return jsonify({"error": "Forbidden - Access denied"}), 403

    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT password FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        
        if user and user["password"] == password:
            return jsonify({"valid": True})
        return jsonify({"valid": False})
    finally:
        conn.close()


# Update password
@app.route("/users/<int:user_id>/update-password", methods=["PUT"])
def update_password(user_id):
    data = request.get_json()
    new_password = data.get("newPassword")
    authenticated_user_id = data.get("authenticated_user_id")
    
    if not authenticated_user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        authenticated_user_id = int(authenticated_user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid authentication"}), 401
    
    if authenticated_user_id != user_id:
        return jsonify({"error": "Forbidden - Access denied"}), 403

    if not new_password:
        return jsonify({"error": "Missing new password"}), 400

    conn = get_db_connection()
    try:
        conn.execute("UPDATE users SET password = ? WHERE id = ?",
                     (new_password, user_id))
        conn.commit()
        changes = conn.total_changes
        
        if changes == 0:
            return jsonify({"success": False}), 404
        return jsonify({"success": True})
    finally:
        conn.close()


# Register the blueprint for CV routes
app.register_blueprint(cv_bp)

# for the pictures


@app.route("/pictures/<filename>")
def get_picture(filename):
    return send_from_directory(PICTURES_FOLDER, filename)
# fore the pictrures


@app.route("/users/<int:user_id>/profile-picture", methods=["POST"])
def upload_profile_picture(user_id):
    # Verify authenticated user can only upload their own profile picture
    authenticated_user_id = request.form.get("authenticated_user_id")
    
    if not authenticated_user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        authenticated_user_id = int(authenticated_user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid authentication"}), 401
    
    if authenticated_user_id != user_id:
        return jsonify({"error": "Forbidden - Access denied"}), 403
    
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
    try:
        conn.execute(
            "UPDATE users SET profile_picture = ? WHERE id = ?",
            (filename, user_id)
        )
        conn.commit()
        url = f"http://localhost:3001/pictures/{filename}"
        return jsonify({"profile_picture": url}), 200
    finally:
        conn.close()


@app.route("/history", methods=["GET"])
def get_events():
    conn = get_db_connection()
    try:
        user_id = request.args.get("user_id")
        rows = conn.execute(
            "SELECT * FROM events WHERE user_id = ?", (user_id,)).fetchall()
    finally:
        conn.close()
    return jsonify([dict(r) for r in rows])


######################################## for eventlist #######################################

@app.route("/events", methods=["POST"])
def create_event():

    # data = request.get_json(silent=True) or {}
    # print("Incoming /events POST:", data)

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
    user_id = data.get("user_id")

    # validation
    if not user_id:
        print("Missing user_id")
        return jsonify({"error": "User must be logged in"}), 401

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        print("Invalid user_id:", user_id)
        return jsonify({"error": "Invalid user_id"}), 400

    if not title or not date:
        print("Missing title or date")
        return jsonify({"error": "title and date are required"}), 400

    #  datetime strings
    if time:
        start_dt = f"{date}T{time}:00"
    else:
        start_dt = f"{date}T00:00:00"
    end_dt = start_dt

    # Insert into DB with error logging

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
        # next week add the functionality of the email verification and upload file feature to the form

        event_id = cur.lastrowid

        # calling the save_file function kikos made
        file = request.files.get("file")
        if file and file.filename:
            save_file(file, user_id, event_id)

        cur.execute("SELECT email FROM users WHERE id = ?", (user_id,))
        user_row = cur.fetchone()
        user_email = user_row["email"] if user_row else None

        # event_creation(user_email, title, description,
        #                start_dt, str(importance))

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

        # event_creation(email,title,description,start_time_utc,importance)
    except Exception as e:
        conn.rollback()
        print(" DB error on INSERT into events:", repr(e))
        return jsonify({"error": "database error", "details": str(e)}), 500

    # event_id = cur.lastrowid
    row = conn.execute(
        "SELECT * FROM events WHERE id = ?",
        (event_id,)
    ).fetchone()
    conn.close()

    print("Event inserted with id:", event_id)
    return jsonify(dict(row)), 201


@app.route("/events", methods=["GET"])
def list_events_for_day():

    date = request.args.get("date")
    user_id = request.args.get("user_id")
    if not date:
        return jsonify({"error": "missing date parameter"}), 400

    if not user_id:
        return jsonify({"error": "missing user_id parameter"}), 401

    start_dt = f"{date}T00:00:00"
    end_dt = f"{date}T23:59:59"

    conn = get_db_connection()
    rows = conn.execute("""
        SELECT 
            e.*,
            EXISTS (
                SELECT 1 FROM uploads u 
                WHERE u.event_id = e.id
            ) AS has_file
        FROM events e
        WHERE start_time_utc BETWEEN ? AND ?
        AND user_id = ?
        ORDER BY start_time_utc
    """, (start_dt, end_dt, user_id)).fetchall()

    return jsonify([dict(r) for r in rows])

    ######################################## delete event#######################################


@app.route("/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):

    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "missing user_id parameter"}), 400

    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "invalid user_id"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # 1️⃣ Ensure the event exists and belongs to this user
    row = cur.execute(
        "SELECT user_id FROM events WHERE id = ?",
        (event_id,)
    ).fetchone()

    if not row:
        conn.close()
        return jsonify({"error": "event not found"}), 404

    if row["user_id"] != user_id_int:
        conn.close()
        return jsonify({"error": "forbidden: event does not belong to this user"}), 403

    try:
        # 2️⃣ Delete associated uploads first (because of FK)
        cur.execute("DELETE FROM uploads WHERE event_id = ?", (event_id,))

        # 3️⃣ Then delete the event
        cur.execute("DELETE FROM events WHERE id = ?", (event_id,))

        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        print("DB error on DELETE event:", repr(e))
        return jsonify({"error": "database error", "details": str(e)}), 500

    conn.close()
    return jsonify({"status": "ok", "deleted_id": event_id}), 200

######################################## delete event #######################################


######################################## for eventlist #######################################

# had to manualy import the file in the app.py
def save_file(file_storage, user_id, event_id):
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
        (filename, file_data, user_id, event_id)
    )
    conn.commit()
    conn.close()

    print(f"File saved successfully: {filename}")
    return filename


# Run Flask
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3001)
