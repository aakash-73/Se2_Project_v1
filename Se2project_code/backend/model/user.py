# models/user.py
from mongoengine import Document, StringField

class User(Document):
    first_name = StringField(required=True)
    last_name = StringField(required=True)
    username = StringField(required=True, unique=True)
    password = StringField(required=True)
    user_type = StringField(required=True, choices=['student', 'professor'])
    email = StringField(required=True, unique=True)