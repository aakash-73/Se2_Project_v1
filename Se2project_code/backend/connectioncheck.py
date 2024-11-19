from bson import ObjectId
from config import fs

pdf_id = "6727db474114faf5e4ab5993"  # Replace with your actual PDF ID

try:
    file_data = fs.get(ObjectId(pdf_id))
    print("Successfully retrieved PDF from GridFS.")
except Exception as e:
    print(f"Error retrieving PDF: {e}")
