"""
WSGI config for spendwise_backend project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spendwise_backend.settings')

# 1. Start Django First (Loads settings and models)
application = get_wsgi_application()

# 2. Apply the Patch AFTER Django is running (Safe Mode)
# -------------------------------------------------------
from rest_framework.authtoken.models import Token
from django.db import models
Token.objects = models.Manager()
# -------------------------------------------------------

app = application