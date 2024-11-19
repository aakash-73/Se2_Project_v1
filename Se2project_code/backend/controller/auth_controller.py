# controllers/auth_controller.py
from flask import jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from model.user import User
import re

def register():
    first_name = request.json.get('first_name')
    last_name = request.json.get('last_name')
    email = request.json.get('email')
    password = request.json.get('password')
    confirm_password = request.json.get('confirm_password')
    user_type = request.json.get('user_type')

    # Validate input fields
    if not (first_name and last_name and email and password and confirm_password and user_type):
        return jsonify({"error": "All fields are required"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    # Create a username based on email prefix
    username = email.split('@')[0]
    hashed_password = generate_password_hash(password)

    try:
        # Save new user to database
        user = User(
            first_name=first_name,
            last_name=last_name,
            username=username,
            password=hashed_password,
            user_type=user_type,
            email=email
        )
        user.save()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 400
    

def login():
    identifier = request.json.get('username')  # Can be username or email
    password = request.json.get('password')
    
    # Determine if identifier is an email
    if re.match(r"[^@]+@[^@]+\.[^@]+", identifier):
        user = User.objects(email=identifier).first()  # Search by email
    else:
        user = User.objects(username=identifier).first()  # Search by username
    
    if user and check_password_hash(user.password, password):
        session['user_id'] = str(user.id)
        session['username'] = user.username
        session['user_type'] = user.user_type
        session.permanent = True  # Ensure session persistence if configured with `permanent_session_lifetime`

        print("Session after login:", dict(session))  # Debug: Check session after login
        return jsonify({"message": "Login successful!", "user_type": user.user_type, "username": user.username}), 200

    return jsonify({"error": "Invalid username/email or password"}), 401
