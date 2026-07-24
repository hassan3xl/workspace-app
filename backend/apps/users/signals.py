

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.core.cache import cache
from allauth.socialaccount.signals import pre_social_login, social_account_added
from allauth.account.signals import user_signed_up
from .models import Profile

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)


def format_person_name(name_str):
    if not name_str:
        return ""
    # Format name into Title Case for each word
    return " ".join([word.capitalize() for word in name_str.strip().split()])


def sync_google_profile_data(user, extra_data):
    if not user or not extra_data:
        return

    profile, _ = Profile.objects.get_or_create(user=user)

    given_name = str(extra_data.get("given_name", "") or "").strip()
    family_name = str(extra_data.get("family_name", "") or "").strip()
    full_name = str(extra_data.get("name", "") or "").strip()

    first_name = ""
    last_name = ""

    if given_name or family_name:
        first_name = given_name
        last_name = family_name
    elif full_name:
        parts = full_name.split()
        if len(parts) == 1:
            first_name = parts[0]
        elif len(parts) >= 2:
            first_name = parts[0]
            last_name = " ".join(parts[1:])
    elif user.email:
        email_prefix = user.email.split("@")[0]
        parts = email_prefix.replace(".", " ").replace("_", " ").split()
        if len(parts) == 1:
            first_name = parts[0]
        elif len(parts) >= 2:
            first_name = parts[0]
            last_name = " ".join(parts[1:])

    formatted_first = format_person_name(first_name)
    formatted_last = format_person_name(last_name)

    updated = False

    if formatted_first and (not profile.first_name or profile.first_name != formatted_first):
        profile.first_name = formatted_first
        updated = True

    if formatted_last and (not profile.last_name or profile.last_name != formatted_last):
        profile.last_name = formatted_last
        updated = True

    # Format or set a clean username if missing or default user-xxxxxx
    if not profile.username or profile.username.startswith("user-"):
        clean_base = f"{formatted_first}{formatted_last}".lower().replace(" ", "")
        if not clean_base and user.email:
            clean_base = user.email.split("@")[0].lower()
        if clean_base:
            candidate = clean_base
            counter = 1
            while Profile.objects.filter(username=candidate).exclude(id=profile.id).exists():
                candidate = f"{clean_base}{counter}"
                counter += 1
            profile.username = candidate
            updated = True

    if updated:
        profile.save()
        cache.delete(f"user_profile:{user.id}")


@receiver(social_account_added)
def on_social_account_added(request, sociallogin, **kwargs):
    if sociallogin and sociallogin.account:
        sync_google_profile_data(sociallogin.user, sociallogin.account.extra_data)


@receiver(pre_social_login)
def on_pre_social_login(request, sociallogin, **kwargs):
    if sociallogin and sociallogin.account:
        sync_google_profile_data(sociallogin.user, sociallogin.account.extra_data)

