from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import re
from werkzeug.utils import secure_filename
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor


from cvprogram import (
    validate_name,
    validate_birthdate,
    validate_phone,
    validate_nonempty,
    validate_job_count,
    validate_skill_count,
    validate_email,)



app = Flask(__name__)
#allow rewuests from Rreact frontend
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

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

# CV Generation Validation
VALIDATORS = {
    "name": validate_name,
    "surname": validate_name,
    "birthdate": validate_birthdate,
    "degree": validate_nonempty,
    "job_count": validate_job_count,
    "phone": validate_phone,
    "email": validate_email,
    "skill_count": validate_skill_count,
}

@app.route("/upload-picture", methods=["POST"])
def upload_picture():
    # check the file is in the request
    if "file" not in request.files:
        return jsonify(ok=False, error="No file part"), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify(ok=False, error="No selected file"), 400

    if not allowed_file(file.filename):
        return jsonify(ok=False, error="Invalid file type"), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    # send back the saved path (or just filename if you prefer)
    return jsonify(ok=True, value=save_path)

@app.route("/generate-cv", methods=["POST"])
def generate_cv():
    data = request.get_json(force=True) or {}

    full_name = f"{data.get('name', '')} {data.get('surname', '')}".strip()
    degree = data.get("degree", "")
    birthdate = data.get("birthdate", "")
    phone = data.get("phone", "")
    email = data.get("email", "")
    picture_path = data.get("picture_path", "")
    job_count = data.get("job_count", "")
    skill_count = data.get("skill_count", "")

    # --- CV Design Setup ---
    # Colors
    primary_color = HexColor("#2c3e50")  # A dark slate blue
    secondary_color = HexColor("#3498db") # A bright blue for accents
    text_color = HexColor("#34495e")      # A dark gray for text
    light_gray = HexColor("#ecf0f1")      # For the sidebar background

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # --- Left Column (Sidebar) ---
    sidebar_width = 7 * cm
    c.setFillColor(light_gray)
    c.rect(0, 0, sidebar_width, height, fill=1, stroke=0)

    # Profile Picture
    if picture_path:
        local_picture_path = os.path.join(os.path.dirname(__file__), picture_path.lstrip('/'))
        try:
            if os.path.exists(local_picture_path):
                # Draw a circular profile picture (by clipping)
                img_size = 4 * cm
                img_x = (sidebar_width - img_size) / 2
                img_y = height - 3 * cm - img_size
                
                p = c.beginPath()
                p.circle(img_x + img_size/2, img_y + img_size/2, img_size/2)
                c.clipPath(p, stroke=0)
                c.drawImage(local_picture_path, img_x, img_y, width=img_size, height=img_size, preserveAspectRatio=True, anchor='c')
                c.clipPath(None) # End clipping
        except Exception as e:
            print("Error drawing image:", e)

    # Contact Details in Sidebar
    c.setFillColor(text_color)
    c.setFont("Helvetica-Bold", 12)
    y_sidebar = height - 8.5 * cm
    c.drawCentredString(sidebar_width / 2, y_sidebar, "Contact")
    c.setStrokeColor(secondary_color)
    c.line(1.5*cm, y_sidebar - 0.2*cm, sidebar_width - 1.5*cm, y_sidebar - 0.2*cm)

    c.setFont("Helvetica", 10)
    y_sidebar -= 1 * cm
    if phone:
        c.drawCentredString(sidebar_width / 2, y_sidebar, f"📞 {phone}")
        y_sidebar -= 0.6 * cm
    if email:
        c.drawCentredString(sidebar_width / 2, y_sidebar, f"📧 {email}")
        y_sidebar -= 0.6 * cm
    if birthdate:
        c.drawCentredString(sidebar_width / 2, y_sidebar, f"🎂 {birthdate}")

    # --- Right Column (Main Content) ---
    margin_right = 2 * cm
    content_x = sidebar_width + margin_right

    # Header with Name
    c.setFillColor(primary_color)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(content_x, height - 3.5 * cm, full_name or "Your Name")

    # Main content starts here
    y_main = height - 6 * cm

    def draw_section(title, content_lines):
        nonlocal y_main
        c.setFillColor(secondary_color)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(content_x, y_main, title)
        y_main -= 0.7 * cm
        c.setFillColor(text_color)
        c.setFont("Helvetica", 11)
        for line in content_lines:
            c.drawString(content_x, y_main, line)
            y_main -= 0.6 * cm
        y_main -= 0.5 * cm # Extra space after section

    # Education Section
    if degree:
        draw_section("Education", [degree])

    # Work Experience Section (using job_count as text)
    if job_count:
        draw_section("Work Experience", [f"Number of previous jobs: {job_count}"])

    # Skills Section (using skill_count as text)
    if skill_count:
        draw_section("Skills", [f"Number of skills: {skill_count}"])
    c.showPage()
    c.save()

    buffer.seek(0)

    return (
        buffer.getvalue(),
        200,
        {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="cv.pdf"',
        },
    )

@app.route("/validate", methods=["POST"])
def validate_field():
    data = request.get_json(force=True)
    field = data.get("field")
    value = data.get("value", "")

    if field not in VALIDATORS:
        return jsonify({"ok": False, "error": f"unknown field: {field}"}), 400

    result = VALIDATORS[field](value)

    if isinstance(result, str) and result.startswith("error"):
        return jsonify({"ok": False, "error": result})
    else:
        return jsonify({"ok": True, "value": result})


#Run Flask
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3001)