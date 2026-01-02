import logging
import os
import smtplib
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


def send_email(to_email, subject, body, attachment_path=None):
    """
    Envoie un email si la configuration SMTP est disponible.
    Retourne True en cas de succès, False si l'envoi est ignoré ou échoue.
    """

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    from_name = os.getenv("MAIL_FROM_NAME", "FacePresence")

    if not (smtp_host and smtp_user and smtp_pass):
        logger.warning(
            "SMTP configuration incomplete (host/user/pass). "
            "Email send skipped to avoid crash."
        )
        return False

    msg = MIMEMultipart()
    msg["From"] = f"{from_name} <{smtp_user}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    if attachment_path:
        part = MIMEBase("application", "pdf")
        with open(attachment_path, "rb") as f:
            part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f'attachment; filename="{os.path.basename(attachment_path)}"'
        )
        msg.attach(part)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        logger.info("Email envoyé à %s", to_email)
        return True
    except Exception as exc:
        logger.error("Échec d'envoi email: %s", exc)
        return False
