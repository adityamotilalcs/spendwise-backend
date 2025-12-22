from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth Endpoints
    path('register/', views.register_user, name='register'),
    
    # IMPORTANT: This line uses your new custom view to fix the Login crash
    path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Transaction Endpoints
    path('transactions/', views.TransactionListCreate.as_view(), name='transaction-list-create'),
    path('transactions/delete/<int:pk>/', views.TransactionDelete.as_view(), name='delete-transaction'),
]