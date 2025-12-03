import sys
import os
import sqlite3
from io import BytesIO

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from upload_services import save_file

user_id = 1
event_id = 123
file_content = b"Hello, this is a test file!"
file_name = "test_file.txt"

# Mock a "FileStorage"-like object
class MockFileStorage:
    def __init__(self, filename, data):
        self.filename = filename
        self.stream = BytesIO(data)

    def read(self):
        return self.stream.read()

mock_file = MockFileStorage(file_name, file_content)

print("Saving file to database...")
saved_filename = save_file(mock_file, user_id, event_id)
print("File saved with filename:", saved_filename)

conn = sqlite3.connect("./db/database.db")
cursor = conn.cursor()
cursor.execute(
    "SELECT filename, filedata, user_id, event_id FROM uploads WHERE filename = ?",
    (saved_filename,)
)
row = cursor.fetchone()
conn.close()

if row:
    print("File verified in database!")
    print("Filename:", row[0])
    print("User ID:", row[2])
    print("Event ID:", row[3])
    print("File data:", row[1])
else:
    print("File not found in database.")
