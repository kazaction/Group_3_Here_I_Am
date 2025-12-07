import sqlite3


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
