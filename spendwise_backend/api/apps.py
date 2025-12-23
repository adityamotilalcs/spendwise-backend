from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # 🚑 FIX FOR DJONGO + DRF TOKEN ERROR
        # This runs exactly when Django starts the API app
        try:
            from rest_framework.authtoken.models import Token
            from django.db import models
            
            # FIX: Use 'add_to_class' instead of direct assignment.
            # This ensures the Manager knows it belongs to the Token model.
            Token.add_to_class('objects', models.Manager())
            
        except ImportError:
            pass