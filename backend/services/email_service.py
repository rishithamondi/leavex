import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("email_service")

# SMTP Credentials & Configuration
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = os.getenv("SMTP_PORT")
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_FROM = os.getenv("SMTP_FROM", "LeaveX Portal <noreply@leavex.com>")

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an email using standard smtplib. Fails gracefully if not configured or on connection errors."""
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        logger.warning("Email configurations (SMTP_HOST, SMTP_USER, or SMTP_PASS) are missing. Gracefully skipping email dispatch.")
        return False
        
    try:
        port = int(SMTP_PORT) if SMTP_PORT else 587
        
        # Create message container
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_FROM
        msg['To'] = to_email
        
        # Attach HTML content
        part = MIMEText(html_content, 'html')
        msg.attach(part)
        
        # Connect to SMTP server
        if port == 465:
            server = smtplib.SMTP_SSL(SMTP_HOST, port, timeout=10)
        else:
            server = smtplib.SMTP(SMTP_HOST, port, timeout=10)
            server.starttls()
            
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_FROM, to_email, msg.as_string())
        server.quit()
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email} due to error: {str(e)}")
        # Fail gracefully: do not bubble up exceptions to block API responses
        return False

def send_leave_approved_email(to_email: str, student_name: str, leave_type: str, start_date: str, end_date: str, remarks: str = None) -> bool:
    """Sends a professional leave approval notification email."""
    subject = "Leave Application Approved - LeaveX"
    app_url = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
    
    remarks_section = ""
    if remarks:
        remarks_section = f"""
        <div style="border-left: 4px solid #4f46e5; background-color: #f5f3ff; border-radius: 4px; padding: 16px; margin: 24px 0; font-style: italic;">
          <span style="font-size: 12px; color: #4f46e5; font-weight: 700; display: block; margin-bottom: 4px; font-style: normal; text-transform: uppercase; letter-spacing: 0.05em;">Warden Remarks:</span>
          "{remarks}"
        </div>
        """
        
    html_content = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>{subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">LeaveX Portal</h1>
          </div>
          <!-- Body -->
          <div style="padding: 30px; color: #374151; line-height: 1.6;">
            <h2 style="color: #111827; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Hello, {student_name}</h2>
            <p>Your leave application has been approved by the hostel administration. You are permitted to check out during the specified period.</p>
            
            <!-- Status Alert Box -->
            <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0;">
              <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px; letter-spacing: 0.05em;">Application Decision</span>
              <span style="font-size: 22px; font-weight: 800; color: #10b981; text-transform: uppercase;">APPROVED</span>
            </div>

            <!-- Details Container -->
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Leave Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4b5563; font-weight: 500;">Leave Type:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">{leave_type}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4b5563; font-weight: 500;">Start Date:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">{start_date}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4b5563; font-weight: 500;">End Date:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">{end_date}</td>
                </tr>
              </table>
            </div>

            {remarks_section}
            
            <!-- Button -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="{app_url}/login" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">View Leave History</a>
            </div>
          </div>
          <!-- Footer -->
          <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
            This is an automated notification from the LeaveX platform. Please do not reply directly to this email.<br>&copy; LeaveX Administration
          </div>
        </div>
      </body>
    </html>
    """
    return send_email(to_email, subject, html_content)
