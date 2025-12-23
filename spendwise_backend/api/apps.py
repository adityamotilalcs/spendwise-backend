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
            # Force the Token model to have a Manager
            Token.objects = models.Manager()
        except ImportError:
            pass