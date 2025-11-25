from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from io import BytesIO
import os
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
    validate_email,
)

cv_bp = Blueprint('cv_routes', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

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

# upload picture for cv
@cv_bp.route("/upload-picture", methods=["POST"])
def upload_picture():
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

    return jsonify(ok=True, value=save_path)

@cv_bp.route("/generate-cv", methods=["POST"])
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

    primary_color = HexColor("#2c3e50")
    secondary_color = HexColor("#3498db")
    text_color = HexColor("#34495e")
    light_gray = HexColor("#ecf0f1")

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    sidebar_width = 7 * cm
    c.setFillColor(light_gray)
    c.rect(0, 0, sidebar_width, height, fill=1, stroke=0)

    if picture_path:
        local_picture_path = os.path.join(os.path.dirname(__file__), picture_path.lstrip('/'))
        try:
            if os.path.exists(local_picture_path):
                img_size = 4 * cm
                img_x = (sidebar_width - img_size) / 2
                img_y = height - 3 * cm - img_size
                
                p = c.beginPath()
                p.circle(img_x + img_size/2, img_y + img_size/2, img_size/2)
                c.clipPath(p, stroke=0)
                c.drawImage(local_picture_path, img_x, img_y, width=img_size, height=img_size, preserveAspectRatio=True, anchor='c')
                c.clipPath(None)
        except Exception as e:
            print("Error drawing image:", e)

    c.setFillColor(text_color)
    c.setFont("Helvetica-Bold", 12)
    y_sidebar = height - 8.5 * cm
    c.drawCentredString(sidebar_width / 2, y_sidebar, "Contact")
    c.setStrokeColor(secondary_color)
    c.line(1.5*cm, y_sidebar - 0.2*cm, sidebar_width - 1.5*cm, y_sidebar - 0.2*cm)

    c.setFont("Helvetica", 10)
    y_sidebar -= 1 * cm
    if phone:
        c.drawCentredString(sidebar_width / 2, y_sidebar, f" {phone}")
        y_sidebar -= 0.6 * cm
    if email:
        c.drawCentredString(sidebar_width / 2, y_sidebar, f" {email}")
        y_sidebar -= 0.6 * cm
    if birthdate:
        c.drawCentredString(sidebar_width / 2, y_sidebar, f" {birthdate}")

    margin_right = 2 * cm
    content_x = sidebar_width + margin_right

    c.setFillColor(primary_color)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(content_x, height - 3.5 * cm, full_name or "Your Name")

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
        y_main -= 0.5 * cm

    if degree:
        draw_section("Education", [degree])

    if job_count:
        draw_section("Work Experience", [f"Number of previous jobs: {job_count}"])

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

@cv_bp.route("/validate", methods=["POST"])
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
