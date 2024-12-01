from models.user import User

# Update users to ensure the 'status' field is set
for user in User.objects():
    if not hasattr(user, 'status'):
        user.status = "approved"  # Default status for existing users
        user.save()

print("Migration completed.")
