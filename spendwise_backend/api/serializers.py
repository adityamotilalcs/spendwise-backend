from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction
# 1. Add this import for the JWT Login
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'description', 'amount', 'date', 'transaction_type', 'category'] 

# 2. Add this NEW class at the bottom to fix the Login 500 Error
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        # This line fixes the crash by converting the ID to a string
        token['user_id'] = str(user.id) 

        return token