from datetime import datetime, date
import re

def validate_name(name):
    if not name:
        return "error your name can't be empty"
    if not all(char.isalpha() or char.isspace() for char in name):
        return "error: name can only contain letters and spaces"
    if len(name) < 2:
        return "error: name too short"
    return name.strip()

def validate_birthdate(birthdate):
    birthdate = birthdate.strip()
    if not birthdate:
        return "error: birthdate can't be empty"
    try:
        birth_date_obj = datetime.strptime(birthdate, "%d/%m/%Y").date()
    except ValueError:
        return "error: invalid date format"

    today = date.today()
    if birth_date_obj > today:
        return "error: birthday cannot be in the future"
    return birthdate

def validate_phone(phone):
    phone = phone.strip()
    
    if not phone:
        return "error: phone number can't be empty"
    
    if phone.startswith("+"):
        digits = phone[1:]
    else:
        digits = phone

    if not digits.isdigit():
        return "error: phone number must contain only digits (except leading +)"

    if len(digits) < 8 or len(digits) > 19:
        return "error: phone number length is invalid"

    return phone


def validate_nonempty(value):
    stripped_value = value.strip()
    if not stripped_value:
        return "error: this field cannot be empty"
    return stripped_value

def validate_job_count(value):
    stripped_value = value.strip()
    if not stripped_value.isdigit():
        return "error: this field must be a number"
    n = int(stripped_value)
    if n < 0 or n > 10:
        return "error: this field must be between 0 and 10"
    return stripped_value

def validate_skill_count(value):
    stripped_value = value.strip()
    if not stripped_value.isdigit():
        return "error: this field must be a number"
    n = int(stripped_value)
    if n < 0 or n > 20:
        return "error: this field must be between 0 and 20"
    return stripped_value

def validate_email(email):
    regex = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    email = email.strip()
    if not email:
        return "error: email can't be empty"
    if re.fullmatch(regex, email):
        return email
    else:
        return "error: Invalid Email"
    
def validate_portfolio(url):
    url = url.strip()
    if not url:
        return ""
    pattern = r"^https?://.+"
    if not re.match(pattern, url):
        return "error: portfolio must be a valid URL starting with http:// or https://"
    return url


def validate_english_level(level):
    level = level.strip()
    if not level:
      
        return ""
    cefr = {"A1", "A2", "B1", "B2", "C1", "C2"}
    words = {
        "beginner",
        "elementary",
        "intermediate",
        "upper-intermediate",
        "advanced",
        "fluent",
        "native",
    }

    if level.upper() in cefr or level.lower() in words:
        return level

    return "error: enter a CEFR level (A1-C2) or level like Intermediate/Advanced"


def validate_optional_text(value):
    value = value.strip()
    if not value:
        return ""   
    if len(value) < 5:
        return "error: text is too short"
    return value

