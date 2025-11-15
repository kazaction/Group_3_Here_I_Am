from cvprogram import (
    validate_name,
    validate_birthdate,
    validate_phone,
    validate_nonempty,
    validate_job_count,
    validate_skill_count,
    validate_email,
)

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

@app.post("/validate")
def validate_field():
    data = request.get_json(force=True)
    field = data.get("field")
    value = data.get("value", "")

    if field not in VALIDATORS:
        return jsonify({"ok": False, "error": f"unknown field: {field}"}), 400

    result = VALIDATORS[field](value)

    if isinstance(result, str) and result.startswith("error"):
        return jsonify({"ok": False, "error": result}), 200
    else:
        return jsonify({"ok": True, "value": result}), 200














