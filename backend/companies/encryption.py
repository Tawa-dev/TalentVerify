from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
import base64

class EncryptedField(models.Field):
    """Base class for encrypted fields."""
    
    def __init__(self, *args, **kwargs):
        self.fernet = Fernet(force_bytes(settings.FERNET_KEYS[0]))
        super().__init__(*args, **kwargs)
    
    def get_internal_type(self):
        return "TextField"
    
    def get_db_prep_value(self, value, connection, prepared=False):
        if value is None:
            return None
        
        # Encrypt the value before storing it
        value = force_bytes(value)
        encrypted_value = self.fernet.encrypt(value)
        return base64.b64encode(encrypted_value).decode('ascii')
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        
        # Decrypt the value from the database
        try:
            encrypted_value = base64.b64decode(value)
            decrypted_value = self.fernet.decrypt(encrypted_value)
            return force_str(decrypted_value)
        except Exception:
            return None


class EncryptedCharField(EncryptedField):
    """CharField that transparently encrypts its value."""
    
    def __init__(self, max_length=255, *args, **kwargs):
        self.max_length = max_length
        super().__init__(*args, **kwargs)
    
    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs['max_length'] = self.max_length
        return name, path, args, kwargs


class EncryptedEmailField(EncryptedField):
    """EmailField that transparently encrypts its value."""
    
    def formfield(self, **kwargs):
        from django.forms import EmailField
        defaults = {'form_class': EmailField}
        defaults.update(kwargs)
        return super().formfield(**defaults)