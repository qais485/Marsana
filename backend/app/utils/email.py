import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailSendError(Exception):
    pass


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    if not all(
        [
            settings.SMTP_HOST,
            settings.SMTP_USER,
            settings.SMTP_PASSWORD,
            settings.EMAIL_FROM,
        ]
    ):
        raise EmailSendError("SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM in .env")

    msg = MIMEMultipart("alternative")
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
        logger.info("Email sent to %s", to_email)
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error("SMTP authentication failed: %s", e)
        raise EmailSendError(f"SMTP authentication failed: {e}") from e
    except smtplib.SMTPConnectError as e:
        logger.error("SMTP connection failed: %s", e)
        raise EmailSendError(f"SMTP connection failed: {e}") from e
    except Exception as e:
        logger.exception("Failed to send email to %s", to_email)
        raise EmailSendError(f"Failed to send email: {e}") from e
