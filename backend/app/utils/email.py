import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailSendError(Exception):
    pass


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
        raise EmailSendError(
            "SMTP not configured - set SMTP_HOST, SMTP_USER, SMTP_PASSWORD"
        )

    from_email = settings.EMAIL_FROM or settings.SMTP_USER
    if not from_email:
        raise EmailSendError("EMAIL_FROM not configured")

    msg = MIMEMultipart("alternative")
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(from_email, [to_email], msg.as_string())

        logger.info("Email sent to %s via SMTP", to_email)
        return True

    except Exception as e:
        logger.exception("Failed to send email via SMTP")
        raise EmailSendError(f"Failed to send email: {e}") from e
