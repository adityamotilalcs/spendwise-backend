from django.urls import path
from . import views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('register/', views.register_user),
    path('login/', obtain_auth_token),
    path('transactions/', views.TransactionListCreate.as_view()),
    path('transactions/<int:pk>/', views.TransactionDelete.as_view()),
]