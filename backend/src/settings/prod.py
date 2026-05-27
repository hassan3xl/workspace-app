from .base import *
import os
import dj_database_url

DEBUG = False

SECRET_KEY = os.environ["SECRET_KEY"]

from ..config import (
    CORS_ALLOWED_ORIGINS,
    ALLOWED_HOSTS,
    ALLOWED_ORIGINS,
    PRODUCTION_DB,
)
CORS_ALLOWED_ORIGINS=CORS_ALLOWED_ORIGINS
ALLOWED_ORIGINS=ALLOWED_ORIGINS
ALLOWED_HOSTS=ALLOWED_HOSTS


DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get("PRODUCTION_DB"),
        conn_max_age=600,
        ssl_require=True,
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


# Free-tier friendly cache
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

LOGGING = {
    "version": 1,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
}


SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")


