from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import logging

from .models import User
from .serializers import UserSerializer

from .permissions import IsTalentVerify

logger = logging.getLogger(__name__)

# Custom JWT response to include user details
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    def validate(self, attrs):
        # Original token validation
        data = super().validate(attrs)
        
        # Add user details to response
        user = self.user
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'name': user.get_full_name() or user.email,
            'role': user.role
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response(
                {"detail": "Invalid email or password."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class CustomTokenRefreshView(TokenRefreshView):
    """Custom token refresh view with enhanced error handling."""
    
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            return Response(
                {"detail": "Invalid or expired token"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class UserViewSet(viewsets.ModelViewSet):
    """API endpoint for users."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Override to set custom permissions based on action.
        - Only talent_verify users can create company users
        """
        if self.action == 'me':
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'register':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated, IsTalentVerify]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user information."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def register(self, request, *args, **kwargs):
        """Create a new general user and return tokens."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        
        return Response({
            'user': serializer.data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def create_company_user(self, request, *args, **kwargs):
        """
        Create a new user. Only talent_verify users can create accounts for company_users.
        """

        # Assign company_user role to the company user
        request.data['role'] = 'company_user'

        # Check if user is talent_verify (already handled by permissions)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        """Save the new user instance."""
        serializer.save()