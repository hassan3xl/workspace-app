from .base import *
import os
import sys
# pyrefly: ignore [missing-import]
import dj_database_url
import socket

DEBUG = True
hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
INTERNAL_IPS = [ip[:-1] + "1" for ip in ips] + ["127.0.0.1"]


# Load configuration from src.config
from src.config import (
    ALLOWED_ORIGINS, 
    ALLOWED_HOSTS, 
    SECRET_KEY as CONFIG_SECRET_KEY,
    PRODUCTION_DB,
    DOCKER_DB,
    LOCAL_DB,
    CORS_ALLOWED_ORIGINS,
)

# Use config values (SECRET_KEY from base is a default, override with env if needed)
SECRET_KEY = CONFIG_SECRET_KEY
ALLOWED_HOSTS = ALLOWED_HOSTS
ALLOWED_ORIGINS = ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS=CORS_ALLOWED_ORIGINS

db_url = (
    os.environ.get("LOCAL_DB")
    or os.environ.get("DOCKER_DB")
    or os.environ.get("SQLITE_DB")
)

ssl_require = False
if db_url and "neon.tech" in db_url:
    ssl_require = True

DATABASES = {
    "default": dj_database_url.config(
        default=db_url,
        # default=os.getenv("PRODUCTION_DB"),
        conn_max_age=600,
        ssl_require=ssl_require,
    )
}   

STORAGES = {
    # Media: Goes to Cloudinary
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    
    # Static: Stays local (or use WhiteNoise in production)
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}


# CACHES = {
#     "default": {
#         "BACKEND": "django_redis.cache.RedisCache",
#         "LOCATION": os.getenv("REDIS_URL", "redis://redis:6379/1"),
#         "OPTIONS": {
#             "CLIENT_CLASS": "django_redis.client.DefaultClient",
#         },
#     }
# }

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"



# At the bottom of settings.py
if DEBUG:
    DEBUG_TOOLBAR_CONFIG = {
        "SHOW_TOOLBAR_CALLBACK": lambda request: True,
    }


# Check if we are running pytest or standard django tests
TESTING = 'pytest' in sys.modules or 'test' in sys.argv

# ONLY load Debug Toolbar if we are NOT testing
if not TESTING:
    # 1. Add the App
    INSTALLED_APPS += ['debug_toolbar']
    
    # 2. Add the Middleware (Insert at the top is best)
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
    
    # 3. Add the Config
    DEBUG_TOOLBAR_CONFIG = {
        "SHOW_TOOLBAR_CALLBACK": lambda request: True,
    }
    
    # 4. Internal IPs (Docker fix)
    import socket
    try:
        hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
        INTERNAL_IPS = [ip[:-1] + "1" for ip in ips] + ["127.0.0.1"]
    except Exception:
        INTERNAL_IPS = ["127.0.0.1"]


from src.config import RESEND_API_KEY
import os

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.resend.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'resend'
# Try to get from environ, fallback to the one loaded by dotenv in config
EMAIL_HOST_PASSWORD = os.environ.get('RESEND_API_KEY', RESEND_API_KEY)
DEFAULT_FROM_EMAIL = 'Quantum Stack Inventory <noreply@mail.qstack.com.ng>'