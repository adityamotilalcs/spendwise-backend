# api/urls.py
from django.urls import path
from .views import register_user, LoginView, TransactionListCreate, TransactionDelete # <--- Import LoginView

urlpatterns = [
    path('register/', register_user, name='register'),
    
    # ✅ CHANGE THIS LINE:
    path('login/', LoginView.as_view(), name='login'), 
    
    path('transactions/', TransactionListCreate.as_view(), name='transactions'),
    path('transactions/<int:pk>/', TransactionDelete.as_view(), name='delete-transaction'),
]