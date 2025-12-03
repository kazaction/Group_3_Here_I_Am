import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from email_services import forgot_password
from email_services import sign_up
from email_services import test_connection
from email_services import event_reminder
from email_services import event_creation


email = "hereiamteam3@gmail.com"
title = "Test event"
description = "Test description"
start_time_utc = "2023-03-20 12:00"
importance = 3

print("connection test:")
test_connection()

print("Sign up email test:")
sign_up(email)

new_pass = forgot_password(email)

print("New password generated:", new_pass)

event_creation(email, title, description, start_time_utc, importance)

event_reminder(email, title, description, start_time_utc, importance)