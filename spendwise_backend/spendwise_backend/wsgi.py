"""
WSGI config for spendwise_backend project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spendwise_backend.settings')

application = get_wsgi_application()

# --- ADD THIS LINE BELOW ---
app = application