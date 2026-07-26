import pytest
from django.contrib.auth import get_user_model
from allauth.socialaccount.models import SocialAccount, SocialLogin
from allauth.socialaccount.signals import pre_social_login
from django.test import RequestFactory

User = get_user_model()


@pytest.mark.django_db
def test_pre_social_login_connects_existing_user():
    """
    Test that when a social login occurs for an email that is already registered
    in the database, pre_social_login connects the SocialAccount to the existing user
    so that auto-signup does not raise 'A user with this email already exists'.
    """
    email = "existing_user@example.com"
    existing_user = User.objects.create_user(
        email=email,
        password="Password123!"
    )

    account = SocialAccount(
        provider="google",
        uid="1234567890",
        extra_data={"email": email, "given_name": "Test", "family_name": "User"}
    )
    sociallogin = SocialLogin(account=account, user=User(email=email))

    assert not sociallogin.is_existing

    request = RequestFactory().get("/")

    # Send pre_social_login signal
    pre_social_login.send(
        sender=SocialLogin,
        request=request,
        sociallogin=sociallogin
    )

    # After signal execution, sociallogin should be connected to existing_user
    assert sociallogin.is_existing
    assert sociallogin.user == existing_user
    assert SocialAccount.objects.filter(user=existing_user, provider="google").exists()


@pytest.mark.django_db
def test_pre_social_login_new_user_does_not_fail():
    """
    Test that when a social login occurs for a brand new user email,
    pre_social_login passes without errors allowing normal signup flow.
    """
    email = "brand_new_user@example.com"

    account = SocialAccount(
        provider="google",
        uid="9876543210",
        extra_data={"email": email, "given_name": "New", "family_name": "User"}
    )
    sociallogin = SocialLogin(account=account, user=User(email=email))

    assert not sociallogin.is_existing

    request = RequestFactory().get("/")

    pre_social_login.send(
        sender=SocialLogin,
        request=request,
        sociallogin=sociallogin
    )

    assert not sociallogin.is_existing
