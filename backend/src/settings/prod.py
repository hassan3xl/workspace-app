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


# Free-tier friendly cache
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',  # captures every request + errors
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'WARNING',  # set to DEBUG to see every SQL query
            'propagate': False,
        },
    },
}


SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")


