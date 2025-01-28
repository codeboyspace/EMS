# api/models.py
from django.db import models

# Create your models here.


class Token(models.Model):
    id = models.AutoField(primary_key=True)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    user_id = models.IntegerField()
    is_used = models.BooleanField(default=False)

class Event(models.Model):
    category = models.CharField(max_length=100)
    place = models.CharField(max_length=255)
    time = models.TimeField()
    date = models.DateField()
    description = models.TextField()
    organizer = models.CharField(max_length=100)

    def serialize(self):
        return {
            "category": self.category,
            "place": self.place,
            "time": self.time.strftime("%H:%M"),
            "date": self.date.strftime("%Y-%m-%d"),
            "description": self.description,
            "organizer": self.organizer,
        }

class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=10, null=True)
    country = models.CharField(max_length=63)

class Admin(models.Model):
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)

    def _str_(self) -> str:
         return self.name 
