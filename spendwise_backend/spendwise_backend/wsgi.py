"""
WSGI config for spendwise_backend project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spendwise_backend.settings')

# -------------------------------------------------------
# 🚑 FIX FOR DJONGO + DRF TOKEN ERROR
# This MUST run before the application starts
# -------------------------------------------------------
from rest_framework.authtoken.models import Token
from django.db import models
Token.objects = models.Manager()
# -------------------------------------------------------

application = get_wsgi_application()
app = application