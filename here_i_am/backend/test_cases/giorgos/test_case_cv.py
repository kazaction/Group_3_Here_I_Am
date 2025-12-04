import os
from pathlib import Path

import pytest
import requests
from PIL import Image


BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:3001")





@pytest.fixture
def valid_cv_data():
    """Valid CV data for successful test cases."""
    return {
        "name": "George",
        "surname": "Jordan",
        "birthdate": "25/12/1990",
        "degree": "BSc Computer Science",
        "job_count": "3",
        "phone": "+35799123456",  # assumes your validate_phone allows leading +
        "email": "george.jordan@example.com",
        "skill_count": "5",
    }


@pytest.fixture
def api_session():
    """Create a requests session."""
    return requests.Session()


@pytest.fixture
def temp_pdf_file(tmp_path: Path) -> Path:
    """Temporary PDF path; pytest will clean it up automatically."""
    return tmp_path / "generated_cv.pdf"


@pytest.fixture
def temp_image_file(tmp_path: Path) -> Path:
    """Create a temporary dummy image file for upload tests."""
    file_path = tmp_path / "test_avatar.png"
    Image.new("RGB", (1, 1), "black").save(file_path, "PNG")
    return file_path



def _validate_all_fields(session, cv_data):
    """Helper to run validation for all fields and return the validated data."""
    validated_data = {}
    for field, value in cv_data.items():
        res = session.post(f"{BASE_URL}/validate", json={"field": field, "value": value})
        res.raise_for_status()
        data = res.json()
        assert data.get("ok"), f"Validation failed for '{field}': {data.get('error')}"
        assert "value" in data, "Successful validation response must include a 'value' key."
        validated_data[field] = data["value"]
    return validated_data

# Tests cases


def test_full_cv_generation_success_no_picture(api_session, valid_cv_data, temp_pdf_file):
    """
    End-to-end happy path:
    - validate each field
    - call /generate-cv without picture
    - assert that a sane PDF is returned
    """
    # 1. Validate all fields using the helper function.
    validated_data = _validate_all_fields(api_session, valid_cv_data)
    # 2. No picture for this test
    validated_data["picture_path"] = ""

    # 3. Generate the CV
    cv_res = api_session.post(f"{BASE_URL}/generate-cv", json=validated_data)
    cv_res.raise_for_status()

    # 4. Check response looks like a PDF
    content_type = cv_res.headers.get("Content-Type", "")
    assert content_type.startswith("application/pdf"), f"Unexpected Content-Type: {content_type}"

    pdf_bytes = cv_res.content
    assert pdf_bytes.startswith(b"%PDF"), "Response does not look like a valid PDF file."

    # 5. Save and verify the generated PDF
    temp_pdf_file.write_bytes(pdf_bytes)

    assert temp_pdf_file.exists(), "PDF file was not created."
    assert temp_pdf_file.stat().st_size > 500, "Generated PDF file seems too small."


def test_full_cv_generation_with_picture(api_session, valid_cv_data, temp_pdf_file, temp_image_file):
    """
    End-to-end happy path WITH picture:
    - upload picture
    - validate each field
    - call /generate-cv with picture_path
    - assert that a sane PDF is returned
    """
    # 1. Upload picture
    with open(temp_image_file, "rb") as f:
        files = {"file": (temp_image_file.name, f, "image/png")}
        res = api_session.post(f"{BASE_URL}/upload-picture", files=files)

    res.raise_for_status()
    data = res.json()

    assert data.get("ok"), f"Picture upload failed: {data.get('error')}"
    # FIX: The API returns 'path', not 'picture_path'.
    assert "path" in data, "Upload response should contain 'path'."
    picture_path = data["path"]
    assert isinstance(picture_path, str) and picture_path.strip(), "path must be a non-empty string."

    # 2. Validate fields
    validated_data = _validate_all_fields(api_session, valid_cv_data)

    # 3. Use the uploaded picture
    validated_data["picture_path"] = picture_path

    # 4. Generate CV
    cv_res = api_session.post(f"{BASE_URL}/generate-cv", json=validated_data)
    cv_res.raise_for_status()

    content_type = cv_res.headers.get("Content-Type", "")
    assert content_type.startswith("application/pdf"), f"Unexpected Content-Type: {content_type}"

    pdf_bytes = cv_res.content
    assert pdf_bytes.startswith(b"%PDF"), "Response does not look like a valid PDF file."

    temp_pdf_file.write_bytes(pdf_bytes)
    assert temp_pdf_file.stat().st_size > 500, "Generated PDF with picture seems too small."

    # Cleanup the file that was saved to the server's 'uploads' folder.
    if os.path.exists(picture_path):
        os.remove(picture_path)


def test_validation_fails_for_invalid_email(api_session):
    """
    /validate should reject an invalid email but still respond with 200.
    """
    field = "email"
    invalid_value = "not-an-email"

    res = api_session.post(f"{BASE_URL}/validate", json={"field": field, "value": invalid_value})
    res.raise_for_status()  # expect 200
    data = res.json()

    assert not data.get("ok"), "Validation should have failed for an invalid email, but it passed."
    assert "error" in data, "The error response should contain an 'error' key."
    assert isinstance(data["error"], str), "The error message should be a string."


@pytest.mark.parametrize(
    "field, invalid_value",
    [
        ("name", ""),              # empty name
        ("name", "George123"),     # contains numbers
        ("name", "A"),             # too short
        ("surname", ""),           # empty surname
        ("degree", "   "),         # empty degree
        ("birthdate", "1990-12-25"),  # wrong format
        ("birthdate", "25/12/2099"),  # future date
        ("phone", "1234"),              # too short
        ("phone", "1234567890123456"),  # too long
        ("phone", "abcdefg"),           # non-numeric (if you still require digits)
        ("job_count", "-1"),       # negative
        ("job_count", "11"),       # out of range (> 10) if that's your rule
        ("skill_count", "-5"),     # negative
        ("skill_count", "25"),     # out of range (> 20) if that's your rule
    ],
)
def test_validation_fails_for_invalid_fields(api_session, field, invalid_value):
    """
    Hammer /validate with various invalid inputs.
    """
    res = api_session.post(f"{BASE_URL}/validate", json={"field": field, "value": invalid_value})
    res.raise_for_status()
    data = res.json()

    assert not data.get("ok"), f"Validation should have failed for {field}={invalid_value!r}, but it passed."
    assert "error" in data, f"Error message missing for field '{field}'."
    assert isinstance(data["error"], str), "Error message should be a string."


def test_picture_upload_success(api_session, temp_image_file):
    """
    /upload-picture should accept a valid image file and return a picture_path.
    """
    with open(temp_image_file, "rb") as f:
        files = {"file": (temp_image_file.name, f, "image/png")}
        res = api_session.post(f"{BASE_URL}/upload-picture", files=files)

    res.raise_for_status()
    data = res.json()

    assert data.get("ok"), f"Picture upload failed: {data.get('error')}"
    # FIX: The API returns 'path', not 'picture_path'.
    assert "path" in data, "Response from successful upload should contain 'path'."
    picture_path = data["path"]
    assert isinstance(picture_path, str) and picture_path.strip(), "path must be a non-empty string."

    # Cleanup the uploaded file to keep the test environment clean.
    if os.path.exists(picture_path):
        os.remove(picture_path)


def test_picture_upload_fails_for_invalid_file_type(api_session, tmp_path):
    """
    /upload-picture should reject a file with a non-allowed extension.
    """
    invalid_file = tmp_path / "document.txt"
    invalid_file.write_text("this is not an image")

    with open(invalid_file, "rb") as f:
        files = {"file": (invalid_file.name, f, "text/plain")}
        res = api_session.post(f"{BASE_URL}/upload-picture", files=files)

    # Either your backend returns 400, or 200 with ok=False.
    assert res.status_code in (200, 400), f"Unexpected status code: {res.status_code}"

    data = res.json()
    assert not data.get("ok"), "Request should have failed for an invalid file type."

    error_msg = str(data.get("error", "")).lower()
   
    assert "invalid" in error_msg and ("type" in error_msg or "file" in error_msg), \
        f"Unexpected error message: {data.get('error')}"
