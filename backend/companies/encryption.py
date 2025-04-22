import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings
import dotenv

# Load environment variables from .env file
dotenv.load_dotenv()

# Get encryption key from environment or generate one
def get_encryption_key():
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        # For development only - in production, use an environment variable
        if settings.DEBUG:
            # Generate a consistent key from the Django secret key
            salt = b'talent_verify_salt'
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode()))
            return key
        else:
            raise ValueError("Encryption key not found in environment variables")
    
    # Convert string key to bytes if needed
    if isinstance(key, str):
        key = key.encode()
    
    # Ensure key is valid base64
    try:
        # Pad the key if needed
        padded_key = key + b'=' * (4 - len(key) % 4) if len(key) % 4 else key
        # Attempt to decode and encode to verify it's valid base64
        return base64.urlsafe_b64encode(base64.urlsafe_b64decode(padded_key))
    except Exception:
        # If the key is already formatted correctly but not valid base64,
        # we might be dealing with a raw key
        try:
            # Try to ensure it's at least 32 bytes for Fernet
            if len(key) < 32:
                raise ValueError("Key is too short")
            # Return a valid base64 encoded key
            return base64.urlsafe_b64encode(key[:32])
        except Exception as e:
            raise ValueError(f"Invalid encryption key format: {str(e)}")

_fernet_instance = None

def get_fernet():
    global _fernet_instance
    if _fernet_instance is None:
        key = get_encryption_key()
        # key should already be bytes and base64 encoded from get_encryption_key
        _fernet_instance = Fernet(key)
    return _fernet_instance

def encrypt_field(value):
    """Encrypt a field value"""
    if value is None:
        return None
    
    value_str = str(value)
    fernet = get_fernet()
    return fernet.encrypt(value_str.encode()).decode()

def decrypt_field(encrypted_value):
    """Decrypt a field value"""
    if encrypted_value is None:
        return None
        
    fernet = get_fernet()
    try:
        return fernet.decrypt(encrypted_value.encode()).decode()
    except Exception as e:
        # Return an error indicator instead of failing completely
        return f"[Decryption Error: {str(e)}]"