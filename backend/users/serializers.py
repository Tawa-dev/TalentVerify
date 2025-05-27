from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        # fields = ['id', 'email', 'first_name', 'last_name', 'role', 'password', 'company']
        fields = ['id', 'email', 'role', 'password']
        read_only_fields = ['id']
    

    def create(self, validated_data):
        """Create and return a new user with encrypted password."""
        # call create_user method from UserManager
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'general_user')
        )
        
        # Add company if it exists in validated_data
        if 'company' in validated_data:
            user.company = validated_data['company']
            user.save()
            
        return user


 