from cryptography.fernet import Fernet
from app.core.config import settings
import base64

def get_encryption_key():
    return base64.urlsafe_b64encode(settings.SECRET_KEY[:32].encode().ljust(32)[:32])

def encrypt_credentials(user_id: str, password: str) -> str:
    f = Fernet(get_encryption_key())
    credentials = f"{user_id}:{password}"
    encrypted = f.encrypt(credentials.encode())
    return encrypted.decode()

def decrypt_credentials(encrypted_data: str) -> tuple[str, str]:
    f = Fernet(get_encryption_key())
    decrypted = f.decrypt(encrypted_data.encode())
    credentials = decrypted.decode()
    user_id, password = credentials.split(":", 1)
    return user_id, password
