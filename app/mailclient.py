import smtplib
from email.message import EmailMessage

class SendEmail:
    def __init__(self):
        self.email = "no-reply@bittrey.com"
        self.password = "you think i would make this a actual password?"
        self.mail_server = 'pen.boxsecured.com'
        
    def registrationEmail(self,email):
        self.EMAIL_ADDRESS = email
        
        msg = EmailMessage()
        msg['Subject'] = 'bittrey registration'
        msg['From'] = f"{self.email}"
        msg['To'] = f"{self.EMAIL_ADDRESS}"

        msg.set_content('thank you for registering')

        msg.add_alternative("""\
        <!DOCTYPE html>
        <html>
            <body style="color:white;">
                <h1 style="color:SlateGray;">thank you for registering</h1>
                <h2> """ f"{self.EMAIL_ADDRESS}"
            """</body>
        </html>
        """, subtype='html')


        with smtplib.SMTP_SSL(f'{self.mail_server}', 465) as smtp:
            smtp.login(f"{self.email}", f"{self.password}")
            smtp.send_message(msg)
    
    def TokenEmail(self,email,token):
        self.EMAIL_ADDRESS = email
        self.tok = token
        
        msg = EmailMessage()
        msg['Subject'] = 'bittrey sign Token'
        msg['From'] = f"{self.email}"
        msg['To'] = f"{self.EMAIL_ADDRESS}"

        msg.set_content(f'your sign on token is {self.tok} if this wasnt you please reset your password')

        msg.add_alternative("""\
        <!DOCTYPE html>
        <html>
            <body style="color:white;">
                <h1 style="color:SlateGray;">thank you for registering</h1>
                <h2 style="color:Black;"> """ f"your sign on token is {self.tok}"
            """</body>
        </html>
        """, subtype='html')


        with smtplib.SMTP_SSL(f'{self.mail_server}', 465) as smtp:
            smtp.login(f"{self.email}", f"{self.password}")
            smtp.send_message(msg)
    
    def passwordresetEmail(self,email,token):
        self.EMAIL_ADDRESS = email
        self.reset = token
        
        msg = EmailMessage()
        msg['Subject'] = 'bittrey password reset'
        msg['From'] = f"{self.email}"
        msg['To'] = f"{self.EMAIL_ADDRESS}"

        msg.set_content('This is a plain text email')

        msg.add_alternative("""\
        <!DOCTYPE html>
        <html>
            <body style="color:white;">
                <h1 style="color:SlateGray;">thank you for registering</h1>
                <h2 style="color:Black;"> """ f"your sign on token is {self.reset}""</h2>"
                f"<p style=""color:Black;"">please copy the token to <a>https://bittrey.com/?password</a> to reset your password</p>"
            """</body>
        </html>
        """, subtype='html')


        with smtplib.SMTP_SSL(f'{self.mail_server}', 465) as smtp:
            smtp.login(f"{self.email}", f"{self.password}")
            smtp.send_message(msg)
    
               
            
# if __name__ == "__main__":
#     SendEmail("","blsdasdank")