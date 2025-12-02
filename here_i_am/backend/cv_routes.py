from flask import Blueprint, request, jsonify, send_file
from io import BytesIO
import os
from werkzeug.utils import secure_filename
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from cvprogram import (
    validate_name,
    validate_birthdate,
    validate_phone,
    validate_nonempty,
    validate_job_count,
    validate_skill_count,
    validate_email,
)


cv_bp = Blueprint("cv_routes", __name__)


VALIDATORS = {
    "name": validate_name,
    "surname": validate_name,
    "birthdate": validate_birthdate,
    "degree": validate_nonempty,
    "job_count": validate_job_count,
    "phone": validate_phone,
    "email": validate_email,
    "picture_path": validate_nonempty,
    "skill_count": validate_skill_count,
}


@cv_bp.route("/validate", methods=["POST"])
def validate_field():
    """
    Validate a single field coming from the React form.
    Body: { "field": "...", "value": "..." }
    Response: { ok: bool, error?: string, value?: string }
    """
    data = request.get_json(force=True) or {}
    field = data.get("field")
    value = data.get("value", "")

    if field not in VALIDATORS:
        return jsonify({"ok": False, "error": f"unknown field: {field}"}), 400

    result = VALIDATORS[field](value)

   
    if isinstance(result, str) and result.startswith("error"):
        return jsonify({"ok": False, "error": result})
    else:
        return jsonify({"ok": True, "value": result})



UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@cv_bp.route("/upload-picture", methods=["POST"])
def upload_picture():
    
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"ok": False, "error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"ok": False, "error": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    
    return jsonify({"ok": True, "path": save_path})



@cv_bp.route("/generate-cv", methods=["POST"])
def generate_cv():
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    import os  

    data = request.get_json(force=True) or {}

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4

    margin_left = 50
    margin_right = 50
    top_y = height - 80
    right_col_x = width * 0.62
    right_y = top_y      

    
    c.setStrokeColorRGB(0.85, 0.85, 0.85)
    c.setLineWidth(1)
    c.line(right_col_x - 20, 70, right_col_x - 20, height - 70)
    c.setFillColor(colors.black)

    full_name = f"{data.get('name', '')} {data.get('surname', '')}".strip() or "Your Name"
    degree = data.get("degree", "").strip()

    c.setFont("Helvetica-Bold", 24)
    c.drawString(margin_left, top_y, full_name)

    c.setFont("Helvetica", 14)
    subtitle = degree
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawString(margin_left, top_y - 24, subtitle)
    c.setFillColor(colors.black)

    y = top_y - 70
    c.setFont("Helvetica", 9)
    c.setFillColorRGB(0.55, 0.55, 0.55)
    c.drawString(margin_left, y, "EXPERIENCE")
    c.setFillColor(colors.black)
    y -= 18

    c.setFont("Helvetica", 10)

    job_count = data.get("job_count", "")
    jobs_text = f"Previous job(s): {job_count}"

    
    text_obj = c.beginText()
    text_obj.setTextOrigin(margin_left, y)
    text_obj.setLeading(14)
    text_obj.textLines(jobs_text)
    c.drawText(text_obj)

    
    y -= 14 * (jobs_text.count("\n") + 2)

    
    c.setFont("Helvetica", 10)
    skill_count = data.get("skill_count", "")
    skills_line = f"Number of skills entered: {skill_count}"
    c.drawString(margin_left, y, skills_line)

    y -= 18


    y -= 10
    c.setFont("Helvetica", 9)
    c.setFillColorRGB(0.55, 0.55, 0.55)
    c.drawString(margin_left, y, "EDUCATION")
    c.setFillColor(colors.black)
    y -= 18

    c.setFont("Helvetica", 10)
    c.drawString(margin_left, y, f"Degree: {degree}")
    y -= 16

  

    picture_path = data.get("picture_path")
    avatar_center_x = right_col_x + 80
    avatar_center_y = right_y - 10
    avatar_size = 80  

    if picture_path and os.path.exists(picture_path):
        try:
            c.saveState()
            c.drawImage(
                picture_path,
                avatar_center_x - avatar_size / 2,
                avatar_center_y - avatar_size / 2,
                width=avatar_size,
                height=avatar_size,
                preserveAspectRatio=True,
                mask="auto",
            )
            c.restoreState()
        except Exception as e:
            print("Error drawing image:", e)
            c.setStrokeColorRGB(0.85, 0.85, 0.85)
            c.circle(avatar_center_x, avatar_center_y, 35, stroke=1, fill=0)
            c.setStrokeColor(colors.black)
    else:
        c.setStrokeColorRGB(0.85, 0.85, 0.85)
        c.circle(avatar_center_x, avatar_center_y, 35, stroke=1, fill=0)
        c.setStrokeColor(colors.black)

    right_y -= 80

    c.setFont("Helvetica", 10)
    email = data.get("email", "")
    phone = data.get("phone", "")
    birthdate = data.get("birthdate", "")

    label_font = "Helvetica"
    value_font = "Helvetica-Bold"

    if email:
        c.setFont(value_font, 10)
        c.drawString(right_col_x, right_y, "email: ")
    
        c.setFont(label_font, 10)
        c.drawString(right_col_x + 32, right_y, email)

    right_y -= 16

    if phone:
        c.setFont(value_font, 10)
        c.drawString(right_col_x, right_y, "phone: ")
    
        c.setFont(label_font, 10)
        c.drawString(right_col_x + 37, right_y, phone)

    right_y -= 16

    if birthdate:
        c.setFont(value_font, 10)
        c.drawString(right_col_x, right_y, "Birthdate: ")
    
        c.setFont(label_font, 10)
        c.drawString(right_col_x + 50, right_y, birthdate)

    right_y -= 24

    c.showPage()
    c.save()
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="cv.pdf",
    )
