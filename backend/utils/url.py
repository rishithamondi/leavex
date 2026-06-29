import os

def get_frontend_url() -> str:
    """
    Get the frontend base URL.
    Checks FRONTEND_URL first, then NEXT_PUBLIC_APP_URL,
    and defaults to http://localhost:3000.
    """
    return os.getenv("FRONTEND_URL") or os.getenv("NEXT_PUBLIC_APP_URL") or "http://localhost:3000"

def get_verification_url(token: str) -> str:
    """
    Generate the verification link for a given token.
    """
    if not token:
        return ""
    return f"{get_frontend_url()}/verify/{token}"
