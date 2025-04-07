import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings

# Get encryption key from environment or generate one
def get_encryption_key():
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        # For development only - in production, use an environment variable
        if settings.DEBUG:
            # Generate a key from the Django secret key
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
    return key.encode()

def get_fernet():
    key = get_encryption_key()
    return Fernet(key)

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
    return fernet.decrypt(encrypted_value.encode()).decode()