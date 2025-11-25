import yagmail
import random
import string

yag = yagmail.SMTP("hereiamteam3@gmail.com", "egpt fuvt jyhm jmag")


def forgot_password(to_email):
    #generate 10 character random password
    characters = string.ascii_letters + string.digits
    new_password = ''.join(random.choice(characters) for _ in range(10))

    yag.send(
        to=to_email,
        subject="Here I Am: Forgot Password",
        contents=("You have requested to reset your password.\n"
                  "Your password has been automatically changed to: \n"
                  +new_password+"\n"
                  "You can change this password in the profile section after you sign in again."
                  )
    )
    print("Email Sent!")
    return new_password

def sign_up(to_email):
    yag.send(
        to=to_email,
        subject="Here I Am: Sign Up",
        contents=("You have successfully signed up to Here I Am!\n"
                  "Welcome aboard!")
    )
    print("Email Sent!")

def test_connection():
    yag.send(
        to="hereiamteam3@gmail.com",
        subject="Here I Am: Test from Yagmail",
        contents="If you see this, Yagmail works!"
    )
    print("Email Sent!")