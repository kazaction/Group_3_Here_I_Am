import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from email_services import forgot_password
from email_services import sign_up
from email_services import test_connection

email = "hereiamteam3@gmail.com"

print("connection test:")
test_connection()

print("Sign up email test:")
sign_up(email)

new_pass = forgot_password(email)

print("New password generated:", new_pass)
