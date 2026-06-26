import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_supabase_url: str = os.getenv("SUPABASE_URL", "")
_supabase_key: str = os.getenv("SUPABASE_ANON_KEY", "")

if not _supabase_url or not _supabase_key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in backend/.env")

supabase: Client = create_client(_supabase_url, _supabase_key)
