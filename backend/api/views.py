# api/views.py
from django.contrib.auth.hashers import check_password
from django.shortcuts import render
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.files.storage import default_storage

from .models import User, Token, Admin , Event
from .serializers import UserSerializer, TokenSerializer
from django.conf import settings
from datetime import datetime, timedelta
import json
from pymongo import MongoClient
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import hashlib
import uuid
from django.utils import timezone

SALT = "8b4f6b2cc1868d75ef79e5cfb8779c11b6a374bf0fce05b485581bf4e1e25b96c8c2855015de8449"
URL = "http://localhost:3000"


def mail_template(content, button_url, button_text):
    return f"""<!DOCTYPE html>
            <html>
            <body style="text-align: center; font-family: "Verdana", serif; color: #000;">
                <div style="max-width: 600px; margin: 10px; background-color: #fafafa; padding: 25px; border-radius: 20px;">
                <p style="text-align: left;">{content}</p>
                <a href="{button_url}" target="_blank">
                    <button style="background-color: #444394; border: 0; width: 200px; height: 30px; border-radius: 6px; color: #fff;">{button_text}</button>
                </a>
                <p style="text-align: left;">
                    If you are unable to click the above button, copy paste the below URL into your address bar
                </p>
                <a href="{button_url}" target="_blank">
                    <p style="margin: 0px; text-align: left; font-size: 10px; text-decoration: none;">{button_url}</p>
                </a>
                </div>
            </body>
            </html>"""


# Create your views here.
class ResetPasswordView(APIView):
    def post(self, request, format=None):
        user_id = request.data["id"]
        token = request.data["token"]
        password = request.data["password"]

        token_obj = Token.objects.filter(
            user_id=user_id).order_by("-created_at")[0]
        if token_obj.expires_at < timezone.now():
            return Response(
                {
                    "success": False,
                    "message": "Password Reset Link has expired!",
                },
                status=status.HTTP_200_OK,
            )
        elif token_obj is None or token != token_obj.token or token_obj.is_used:
            return Response(
                {
                    "success": False,
                    "message": "Reset Password link is invalid!",
                },
                status=status.HTTP_200_OK,
            )
        else:
            token_obj.is_used = True
            hashed_password = make_password(password=password, salt=SALT)
            ret_code = User.objects.filter(
                id=user_id).update(password=hashed_password)
            if ret_code:
                token_obj.save()
                return Response(
                    {
                        "success": True,
                        "message": "Your password reset was successfully!",
                    },
                    status=status.HTTP_200_OK,
                )


class ForgotPasswordView(APIView):
    def post(self, request, format=None):
        email = request.data["email"]
        user = User.objects.get(email=email)
        created_at = timezone.now()
        expires_at = timezone.now() + timezone.timedelta(1)
        salt = uuid.uuid4().hex
        token = hashlib.sha512(
            (str(user.id) + user.password + created_at.isoformat() + salt).encode(
                "utf-8"
            )
        ).hexdigest()
        token_obj = {
            "token": token,
            "created_at": created_at,
            "expires_at": expires_at,
            "user_id": user.id,
        }
        serializer = TokenSerializer(data=token_obj)
        if serializer.is_valid():
            serializer.save()
            subject = "Forgot Password Link"
            content = mail_template(
                "We have received a request to reset your password. Please reset your password using the link below.",
                f"{URL}/resetPassword?id={user.id}&token={token}",
                "Reset Password",
            )
            send_mail(
                subject=subject,
                message=content,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                html_message=content,
            )
            return Response(
                {
                    "success": True,
                    "message": "A password reset link has been sent to your email.",
                },
                status=status.HTTP_200_OK,
            )
        else:
            error_msg = ""
            for key in serializer.errors:
                error_msg += serializer.errors[key][0]
            return Response(
                {
                    "success": False,
                    "message": error_msg,
                },
                status=status.HTTP_200_OK,
            )
# Initialize MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["EventManagement"]  # Database name
events_collection = db["Events"]  # Events collection
users_collection = db["Users"]  # Users collection
moderator_collection = db["Moderator"]
admin_collection = db["Admin"]


# Get all events
@csrf_exempt
def get_events(request):
    if request.method == "GET":
        try:
            events = list(events_collection.find())
            # Converting ObjectId to string for JSON compatibility
            for event in events:
                event["_id"] = str(event["_id"])
            return JsonResponse({"events": events}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# Create a new event
@csrf_exempt
def create_event(request):
    if request.method == "POST":
        try:
            # Extracting form data
            category = request.POST.get("category")
            place = request.POST.get("place")
            time = request.POST.get("time")
            date = request.POST.get("date")
            description = request.POST.get("description")
            organizer = request.POST.get("organizer")
            image = request.FILES.get("image")  # This is for the image file

            # Handle file upload if image is provided
            image_path = None
            if image:
                image_path = default_storage.save(image.name, image)

            # Create the event dictionary
            event = {
                "category": category,
                "place": place,
                "time": time,
                "date": date,
                "description": description,
                "organizer": organizer,
                "image": image_path,
            }

            # Insert into the MongoDB collection
            result = events_collection.insert_one(event)
            event["_id"] = str(result.inserted_id)  # Add the new MongoDB _id field to the response

            return JsonResponse({"message": "Event added successfully!", "event": event}, status=201)

        except Exception as e:
            print(f"Error: {e}")  # Log the error to the console
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)

# Get all users (Admin)
@csrf_exempt
def get_users(request):
    if request.method == "GET":
        try:
            users = list(users_collection.find({"is_staff": True}, {"_id": 0, "id": 1, "username": 1}))
            return JsonResponse({"users": users}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# Add a new user (Admin)
@csrf_exempt
def add_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            role = data.get("role")
            if not username and not role:
                return JsonResponse({"error": "Username is required"}, status=400)
            user = {
                "username": username,
                "role": role,
                "is_staff": True,
            }
            if role == "moderator":
                result = moderator_collection.insert_one(user,role)
            elif role == "admin":
                result = admin_collection.insert_one(user,role)
            user["_id"] = str(result.inserted_id)  # Add the new MongoDB _id field to the response
            return JsonResponse({"message": "User added successfully!", "user": user}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)

class AdminRegisterView(APIView):
    def _init_(self, **kwargs):
        super()._init_(**kwargs)
        # Establish connection to MongoDB
        self.client = MongoClient("mongodb://localhost:27017/")
        self.db = self.client["EventManagement"]  # Database name
        self.collection = self.db["Admin"]  # Collection name

    def post(self, request, format=None):
        try:
            username = request.data.get("username")
            password = request.data.get("password")

            if not username or not password:
                return Response({"success": False, "message": "All fields are required!"}, status=400)

            # Check if username already exists in MongoDB
            if self.collection.find_one({"username": username}):
                return Response({"success": False, "message": "Username already exists!"}, status=400)

            # Insert new admin data into MongoDB
            self.collection.insert_one({
                "username": username,
                "password": make_password(password),  # Hash the password
            })

            return Response({"success": True, "message": "Admin registered successfully!"}, status=201)
        except Exception as e:
            return Response({"success": False, "message": f"An error occurred: {str(e)}"}, status=500)
        


class LoginView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def post(self, request, format=None):
        client = MongoClient("mongodb://localhost:27017/")  # Establish connection
        try:
            db = client["EventManagement"]  # Database name
            collection = db["Users"]  # Users collection

            email = request.data.get("email")
            password = request.data.get("password")

            # Validate input
            if not email or not password:
                return Response(
                    {"success": False, "message": "Email and password are required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Find the user by email in the MongoDB users collection
            user = collection.find_one({"email": email})
            if not user:
                return Response(
                    {"success": False, "message": "Invalid Login Credentials!"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # Check if the provided password matches the stored hashed password
            if not check_password(password, user["password"]):
                return Response(
                    {"success": False, "message": "Invalid Login Credentials!"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            return Response(
                {"success": True, "message": "You are now logged in!"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        finally:
            # Close the MongoDB connection
            client.close()

class RegistrationView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.client = MongoClient("mongodb://localhost:27017/")
        self.db = self.client["EventManagement"]
        self.collection = self.db["Users"]

    def post(self, request, format=None):
        try:
            # Validate input fields
            required_fields = ["email", "password", "name"]
            for field in required_fields:
                if field not in request.data:
                    raise KeyError(field)

            # Hash the password
            password = request.data["password"]
            hashed_password = make_password(password)

            # Check if email already exists
            if self.collection.find_one({"email": request.data["email"]}):
                return Response(
                    {"success": False, "message": "Email already exists!"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Insert the user data
            self.collection.insert_one({
                "email": request.data["email"],
                "password": hashed_password,
                "name": request.data.get("name"),
                "country": request.data.get("country"),
                "phone": request.data.get("phone"),
            })

            return Response(
                {"success": True, "message": "You are now registered on our website!"},
                status=status.HTTP_201_CREATED,
            )
        except KeyError as e:
            return Response(
                {"success": False, "message": f"Missing field: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            print(f"Server error: {str(e)}")  # Log for debugging
            return Response(
                {"success": False, "message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )



class AdminLoginView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Establish connection to MongoDB
        self.client = MongoClient("mongodb://localhost:27017/")
        self.db = self.client["EventManagement"]  # Database name
        self.collection = self.db["Admin"]  # Collection name

    def post(self, request, format=None):
        try:
            username = request.data.get("username")
            password = request.data.get("password")

            if not username or not password:
                return Response(
                    {"success": False, "message": "All fields are required!"},
                    status=400,
                )

            # Find user in MongoDB
            user = self.collection.find_one({"username": username})
            if not user:
                return Response(
                    {"success": False, "message": "Invalid Login Credentials!"},
                    status=200,
                )

            # Validate password
            if not check_password(password, user["password"]):
                return Response(
                    {"success": False, "message": "Invalid Login Credentials!"},
                    status=200,
                )

            return Response(
                {"success": True, "message": "You are now logged in!"},
                status=200,
            )
        except Exception as e:
            return Response(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )

        