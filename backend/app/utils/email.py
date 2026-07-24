import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


class EmailSendError(Exception):
    pass


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    if not settings.RESEND_API_KEY:
        raise EmailSendError(
            "RESEND_API_KEY not configured - set it in .env or Render environment"
        )

    from_email = settings.RESEND_FROM_EMAIL or settings.EMAIL_FROM
    if not from_email:
        raise EmailSendError("RESEND_FROM_EMAIL not configured")

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }

    try:
        with httpx.Client(timeout=30) as client:
            response = client.post(
                RESEND_API_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
            )

        if response.status_code != 200:
            error_detail = response.text
            logger.error("Resend API error %s: %s", response.status_code, error_detail)
            raise EmailSendError(f"Resend API returned {response.status_code}: {error_detail}")

        logger.info("Email sent to %s via Resend", to_email)
        return True

    except EmailSendError:
        raise
    except Exception as e:
        logger.exception("Failed to send email via Resend")
        raise EmailSendError(f"Failed to send email: {e}") from e
