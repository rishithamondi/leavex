import os

def get_frontend_url() -> str:
    """
    Get the frontend base URL.
    Checks FRONTEND_URL first, then NEXT_PUBLIC_APP_URL,
    and defaults to http://localhost:3000.
    """
    url = os.getenv("FRONTEND_URL") or os.getenv("NEXT_PUBLIC_APP_URL")
    if url:
        return url
    
    # Auto-detect Render environment and default to production frontend URL
    if os.getenv("RENDER") == "true":
        return "https://leavex-hms.vercel.app"
        
    return "http://localhost:3000"

def get_verification_url(token: str) -> str:
    """
    Generate the verification link for a given token.
    """
    if not token:
        return ""
    return f"{get_frontend_url()}/verify/{token}"
