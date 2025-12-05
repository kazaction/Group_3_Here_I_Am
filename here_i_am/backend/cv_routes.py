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
    validate_portfolio,
    validate_english_level,
    validate_optional_text,
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
    "skill_count": validate_skill_count,
    "portfolio": validate_portfolio,
    "english_level": validate_english_level,
    "job_history": validate_optional_text,
    "skill_history": validate_optional_text,
}


@cv_bp.route("/validate", methods=["POST"])
def validate_field():
   
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
    from reportlab.lib.utils import ImageReader
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

    # Helper function to wrap text based on actual pixel width
    def wrap_text_by_width(text, font_name, font_size, max_width):
        """Wrap text based on actual rendered width, breaking long words if needed"""
        if not text or not str(text).strip():
            return ""
        
        if max_width <= 0:
            return str(text)
        
        text = str(text)
        
        # Set font for width calculation
        try:
            c.setFont(font_name, font_size)
        except:
            # Fallback to default font if specified font fails
            c.setFont("Helvetica", font_size)
        
        # Split by newlines first, then process each line
        paragraphs = text.split('\n')
        all_lines = []
        
        for para in paragraphs:
            if not para.strip():
                all_lines.append("")
                continue
                
            words = para.split()
            lines = []
            current_line = ""
            
            for word in words:
                # Check if word itself is too long
                word_width = c.stringWidth(word)
                if word_width > max_width:
                    # Break the long word
                    if current_line:
                        lines.append(current_line.strip())
                        current_line = ""
                    # Break word into chunks character by character
                    chars = list(word)
                    chunk = ""
                    for char in chars:
                        test_chunk = chunk + char
                        if c.stringWidth(test_chunk) <= max_width:
                            chunk = test_chunk
                        else:
                            if chunk:
                                lines.append(chunk)
                            chunk = char
                    if chunk:
                        current_line = chunk + " "
                    continue
                
                # Test if adding this word fits
                test_line = current_line + word + " " if current_line else word + " "
                test_width = c.stringWidth(test_line)
                
                if test_width <= max_width:
                    current_line = test_line
                else:
                    # Current line is full
                    if current_line:
                        lines.append(current_line.strip())
                    current_line = word + " "
            
            if current_line:
                lines.append(current_line.strip())
            
            all_lines.extend(lines)
        
        return "\n".join(all_lines) if all_lines else text

    # vertical separator (very light to not dominate)
    c.setStrokeColorRGB(0.902, 0.902, 0.902)  # #e6e6e6
    c.setLineWidth(1)
    c.line(right_col_x - 20, 70, right_col_x - 20, height - 70)
    c.setFillColor(colors.black)

    full_name = f"{data.get('name', '')} {data.get('surname', '')}".strip() or "Your Name"
    degree = data.get("degree", "").strip()

    # Wrap name if too long
    name_max_width = (right_col_x - 20 - margin_left) * 0.95
    wrapped_name = wrap_text_by_width(full_name, "Helvetica-Bold", 24, name_max_width)
    c.setFont("Helvetica-Bold", 24)
    name_text = c.beginText()
    name_text.setTextOrigin(margin_left, top_y)
    name_text.setLeading(28)
    name_text.textLines(wrapped_name)
    c.drawText(name_text)
    
    name_lines = wrapped_name.count("\n") + 1 if wrapped_name else 1
    degree_y = top_y - (28 * name_lines)

    # Wrap degree if too long
    if degree:
        wrapped_degree = wrap_text_by_width(degree, "Helvetica", 14, name_max_width)
        c.setFont("Helvetica", 14)
        c.setFillColorRGB(0.2, 0.2, 0.2)
        degree_text = c.beginText()
        degree_text.setTextOrigin(margin_left, degree_y)
        degree_text.setLeading(18)
        degree_text.textLines(wrapped_degree)
        c.drawText(degree_text)
        degree_lines = wrapped_degree.count("\n") + 1 if wrapped_degree else 1
    else:
        degree_lines = 0
    
    c.setFillColor(colors.black)

    # EXPERIENCE
    # Calculate y position based on name and degree height
    if degree:
        y = degree_y - (18 * degree_lines) - 20
    else:
        y = top_y - (28 * name_lines) - 20
    c.setFont("Helvetica-Bold", 13)
    c.setFillColorRGB(0.267, 0.267, 0.267)  # #444
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

    y -= 10 * (jobs_text.count("\n") + 2)

    # job history
    job_history = data.get("job_history", "").strip()
    if job_history:
        # Calculate max width for left column
        max_width = (right_col_x - 20 - margin_left) * 0.95
        wrapped_job_history = wrap_text_by_width(job_history, "Helvetica", 10, max_width)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margin_left, y, "Job history:")
        y -= 14
        c.setFont("Helvetica", 10)
        job_text = c.beginText()
        job_text.setTextOrigin(margin_left, y)
        job_text.setLeading(14)
        job_text.textLines(wrapped_job_history)
        c.drawText(job_text)
        y -= 14 * (wrapped_job_history.count("\n") + 1)

    # skills count + history
    y -= 12  # Add extra spacing to distinguish skills section
    skill_count = data.get("skill_count", "")
    skills_line = f"Number of skills entered: {skill_count}"
    c.setFont("Helvetica", 10)
    c.drawString(margin_left, y, skills_line)
    y -= 18

    skill_history = data.get("skill_history", "").strip()
    if skill_history:
        # Calculate max width for left column
        max_width = (right_col_x - 20 - margin_left) * 0.95
        wrapped_skill_history = wrap_text_by_width(skill_history, "Helvetica", 10, max_width)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margin_left, y, "Skill history:")
        y -= 14
        c.setFont("Helvetica", 10)
        skill_text = c.beginText()
        skill_text.setTextOrigin(margin_left, y)
        skill_text.setLeading(14)
        skill_text.textLines(wrapped_skill_history)
        c.drawText(skill_text)
        y -= 14 * (wrapped_skill_history.count("\n") + 1)

    # EDUCATION
    y -= 10
    c.setFont("Helvetica-Bold", 13)
    c.setFillColorRGB(0.267, 0.267, 0.267)  # #444
    c.drawString(margin_left, y, "EDUCATION")
    c.setFillColor(colors.black)
    y -= 18

    if degree:
        # Wrap degree text if too long
        max_width = (right_col_x - 20 - margin_left) * 0.95
        wrapped_degree_text = wrap_text_by_width(f"Degree: {degree}", "Helvetica", 10, max_width)
        c.setFont("Helvetica", 10)
        degree_display_text = c.beginText()
        degree_display_text.setTextOrigin(margin_left, y)
        degree_display_text.setLeading(14)
        degree_display_text.textLines(wrapped_degree_text)
        c.drawText(degree_display_text)
        y -= 14 * (wrapped_degree_text.count("\n") + 1)
    y -= 2

    # AVATAR
    picture_path = data.get("picture_path", "")
    avatar_center_x = right_col_x + 80
    avatar_center_y = right_y - 10

    circle_radius = 40
    diameter = circle_radius * 2

    if picture_path and os.path.exists(picture_path):
        try:
            c.saveState()

            p = c.beginPath()
            p.circle(avatar_center_x, avatar_center_y, circle_radius)
            c.clipPath(p, stroke=0, fill=0)

            img = ImageReader(picture_path)
            img_w, img_h = img.getSize()
            aspect = img_h / float(img_w)

            if img_w < img_h:
                new_w = diameter
                new_h = diameter * aspect
            else:
                new_h = diameter
                new_w = diameter / aspect

            c.drawImage(
                picture_path,
                avatar_center_x - new_w / 2,
                avatar_center_y - new_h / 2,
                width=new_w,
                height=new_h,
                mask="auto",
            )

            c.restoreState()

            c.setStrokeColorRGB(0.7, 0.7, 0.7)
            c.setLineWidth(2)
            c.circle(avatar_center_x, avatar_center_y, circle_radius, stroke=1, fill=0)

        except Exception as e:
            print("Error drawing image:", e)
            c.setStrokeColorRGB(0.7, 0.7, 0.7)
            c.setLineWidth(2)
            c.circle(avatar_center_x, avatar_center_y, circle_radius, stroke=1, fill=0)
            c.setStrokeColor(colors.black)
    else:
        name = data.get("name", "").strip()
        surname = data.get("surname", "").strip()
        initials = ""
        if name:
            initials += name[0].upper()
        if surname:
            initials += surname[0].upper()

        c.setFillColorRGB(0.85, 0.85, 0.85)
        c.circle(avatar_center_x, avatar_center_y, circle_radius, stroke=0, fill=1)

        if initials:
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 24)
            c.drawCentredString(avatar_center_x, avatar_center_y - 8, initials)

        c.setStrokeColorRGB(0.7, 0.7, 0.7)
        c.setLineWidth(2)
        c.circle(avatar_center_x, avatar_center_y, circle_radius, stroke=1, fill=0)

    # CONTACT (right column)
    right_y -= 80
    c.setFillColor(colors.black)

    c.setFont("Helvetica", 10)
    email = data.get("email", "")
    phone = data.get("phone", "")
    birthdate = data.get("birthdate", "")
    portfolio = data.get("portfolio", "")
    english_level = data.get("english_level", "")

    label_font = "Helvetica"
    value_font = "Helvetica-Bold"

    # Calculate max width for right column
    right_col_max_width = (width - right_col_x - margin_right) * 0.95

    if email:
        wrapped_email = wrap_text_by_width(email, label_font, 10, right_col_max_width - 35)
        c.setFont(value_font, 10)
        c.drawString(right_col_x, right_y, "email: ")
        c.setFont(label_font, 10)
        email_text = c.beginText()
        email_text.setTextOrigin(right_col_x + 32, right_y)
        email_text.setLeading(15)  # Increased for better spacing
        email_text.textLines(wrapped_email)
        c.drawText(email_text)
        right_y -= 15 * (wrapped_email.count("\n") + 1) + 1  # Increased spacing

    if phone:
        wrapped_phone = wrap_text_by_width(phone, label_font, 10, right_col_max_width - 40)
        c.setFont(value_font, 10)
        c.drawString(right_col_x, right_y, "phone: ")
        c.setFont(label_font, 10)
        phone_text = c.beginText()
        phone_text.setTextOrigin(right_col_x + 37, right_y)
        phone_text.setLeading(15)  # Increased for better spacing
        phone_text.textLines(wrapped_phone)
        c.drawText(phone_text)
        right_y -= 15 * (wrapped_phone.count("\n") + 1) + 1  # Increased spacing

    if birthdate:
        wrapped_birthdate = wrap_text_by_width(birthdate, label_font, 10, right_col_max_width - 55)
        c.setFont(value_font, 10)
        c.drawString(right_col_x, right_y, "Birthdate: ")
        c.setFont(label_font, 10)
        birthdate_text = c.beginText()
        birthdate_text.setTextOrigin(right_col_x + 50, right_y)
        birthdate_text.setLeading(15)  # Increased for better spacing
        birthdate_text.textLines(wrapped_birthdate)
        c.drawText(birthdate_text)
        right_y -= 15 * (wrapped_birthdate.count("\n") + 1) + 1  # Increased spacing

    if portfolio:
        wrapped_portfolio = wrap_text_by_width(portfolio, label_font, 10, right_col_max_width - 52)
        c.setFont(value_font, 10)
        c.drawString(right_col_x, right_y, "Portfolio: ")
        c.setFont(label_font, 10)
        portfolio_text = c.beginText()
        portfolio_text.setTextOrigin(right_col_x + 48, right_y)
        portfolio_text.setLeading(15)  # Increased for better spacing
        portfolio_text.textLines(wrapped_portfolio)
        c.drawText(portfolio_text)
        right_y -= 15 * (wrapped_portfolio.count("\n") + 1) + 1  # Increased spacing

    if english_level:
        wrapped_english = wrap_text_by_width(english_level, label_font, 10, right_col_max_width - 48)
        c.setFont(value_font, 10)
        c.drawString(right_col_x, right_y, "English: ")
        c.setFont(label_font, 10)
        english_text = c.beginText()
        english_text.setTextOrigin(right_col_x + 45, right_y)
        english_text.setLeading(15)  # Increased for better spacing
        english_text.textLines(wrapped_english)
        c.drawText(english_text)
        right_y -= 15 * (wrapped_english.count("\n") + 1) + 1  # Increased spacing

    c.showPage()
    c.save()
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="cv.pdf",
    )
