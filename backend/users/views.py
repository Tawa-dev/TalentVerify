from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer
from .permissions import IsAdminOrTalentVerifyStaff, IsAdminOrTalentVerifyStaffOrCompanyAdmin, IsCompanyAdmin
import string
import secrets

# helper function to generate secure passwords
def generate_secure_password(length=12):
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        # Only Talent Verify staff can manage users
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'list']:
            permission_classes = [IsAdminOrTalentVerifyStaff]
        else:
            # Users can view their own profile
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        # Admin and Talent Verify staff can see all users
        if user.is_talent_verify_user:
            return User.objects.all()
        # All other users can only see themselves
        else:
            return User.objects.filter(id=user.id)
    
    # @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    # def register(self, request):
    #     serializer = UserRegistrationSerializer(data=request.data)
    #     if serializer.is_valid():
    #         user = serializer.save()
    #         refresh = RefreshToken.for_user(user)
    #         return Response({
    #             'user': UserSerializer(user).data,
    #             'refresh': str(refresh),
    #             'access': str(refresh.access_token),
    #         }, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrTalentVerifyStaff])
    def create_company_user(self, request):
        """Create a company user with generated credentials"""
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            # Generate a secure password if not provided
            if 'password' not in request.data or not request.data['password']:
                password = generate_secure_password()
                serializer.validated_data['password'] = password
            else:
                password = request.data['password']
                
            user = serializer.save()
            
            # Return the user details and the generated password
            return Response({
                'user': UserSerializer(user).data,
                'password': password,  # Only returned once at creation
                'message': 'User created successfully. Please share these credentials securely.'
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)