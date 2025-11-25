from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from cv_routes import cv_bp

app = Flask(__name__)
#allow rewuests from Rreact frontend
CORS(app)

app.register_blueprint(cv_bp)

#path to database
DB_PATH = os.path.join(os.path.dirname(__file__), "db", "database.db")

#function to connect
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

#Login function - accept username OR email
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
        "SELECT id, username, email, password FROM users WHERE username = ? OR email = ?", (credential, credential)
    ).fetchone()
    conn.close()
    
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
    
    if user["password"] != password:
        return jsonify({"success": False, "error": "Incorrect Password"}), 401
    
    #return user_id, username, and email from frontend to store
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

        #hashed = generate_password_hash(password)
        conn.execute(
            "INSERT INTO users (name, surname, username, email, password) VALUES (?, ?, ?, ?, ?)",
            (name, surname, username, email, password)
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Registered"}), 201

#Get user info by id
@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(dict(user))


#Update user info
@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    fields = ["name", "surname", "email", "profile_picture"]

    updates = [f"{field} = ?" for field in fields if field in data]
    values = [data[field] for field in fields if field in data]

    if not updates:
        return jsonify({"error": "No valid fields provided"}), 400

    conn = get_db_connection()
    conn.execute(
        f"UPDATE users SET {', '.join(updates)} WHERE id = ?", (*values, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "User updated successfully"})


#Check password
@app.route("/users/<int:user_id>/check-password", methods=["POST"])
def check_password(user_id):
    data = request.get_json()
    password = data.get("password")

    conn = get_db_connection()
    user = conn.execute("SELECT password FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    if user and user["password"] == password:
        return jsonify({"valid": True})
    return jsonify({"valid": False})


#update passowrd
@app.route("/users/<int:user_id>/update-password", methods=["PUT"])
def update_password(user_id):
    data = request.get_json()
    new_password = data.get("newPassword")

    if not new_password:
        return jsonify({"error": "Missing new password"}), 400

    conn = get_db_connection()
    conn.execute("UPDATE users SET password = ? WHERE id = ?", (new_password, user_id))
    conn.commit()
    changes = conn.total_changes
    conn.close()

    if changes == 0:
        return jsonify({"success": False})
    return jsonify({"success": True})

#Run Flask
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3001)