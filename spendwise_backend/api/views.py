# api/views.py

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Transaction
from .serializers import TransactionSerializer, UserSerializer

# ✅ NEW IMPORTS FOR STANDARD TOKENS
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

# --- 1. REGISTER USER ---
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 2. LOGIN VIEW (Standard Token Version) ---
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        # Verify credentials
        user = authenticate(username=username, password=password)
        
        if user:
            # ✅ Create or Get the Simple Token (Never Expires)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,   # Sends '9f8e7d...'
                'username': user.username
            })
        else:
            return Response(
                {'error': 'Invalid Credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

# --- 3. TRANSACTIONS (Unchanged) ---
class TransactionListCreate(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionDelete(generics.DestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)