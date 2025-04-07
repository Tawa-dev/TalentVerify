from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer
from .permissions import IsAdminOrTalentVerifyStaff, IsCompanyAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsAdminOrTalentVerifyStaff|IsCompanyAdmin]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrTalentVerifyStaff|IsCompanyAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        # Admin and Talent Verify staff can see all users
        if user.is_talent_verify_user:
            return User.objects.all()
        # Company admins can see users within their company
        elif user.role == User.ROLE_COMPANY_ADMIN and user.company:
            return User.objects.filter(company=user.company)
        # Regular users can only see themselves
        else:
            return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)