# api/urls.py
from . import views
from django.urls import path
from .views import RegistrationView, LoginView, ForgotPasswordView, ResetPasswordView , AdminRegisterView , AdminLoginView

urlpatterns = [
    path("admin/register", AdminRegisterView.as_view(), name="admin_register"),
    path('admin/login', AdminLoginView.as_view(), name='admin_login'),
    path("register/", RegistrationView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("forgotPassword", ForgotPasswordView.as_view(), name="forgotPassword"),
    path("resetPassword", ResetPasswordView.as_view(), name="resetPassword"),
    path("admin/events", views.get_events, name="get_events"),
    path("admin/users/add_user", views.add_user, name="add_user"),
    path("admin/events/create", views.create_event, name="create_events"),
    path("admin/users", views.get_users, name="get_users"),
]