import io
from flask import jsonify, request, send_file, session
from config import db, fs
from bson import ObjectId
from model.syllabus import Syllabus

def allowed_file(filename):
    """Check if the uploaded file is a PDF."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'pdf'

def add_syllabus():
    """Add a new syllabus and store the PDF file in GridFS."""
    try:
        print("Session data in add_syllabus:", dict(session))  # Debug log

        # Get the username from the session
        username = session.get('username')
        if not username:
            return jsonify({"error": "User is not logged in"}), 401

        # Retrieve form data
        course_id = request.form.get('course_id')
        course_name = request.form.get('course_name')
        department_id = request.form.get('department_id')
        department_name = request.form.get('department_name')
        syllabus_description = request.form.get('syllabus_description')
        file = request.files.get('syllabus_pdf')

        # Check if all required fields and file are present
        if not (course_id and course_name and department_id and department_name and syllabus_description and file and allowed_file(file.filename)):
            return jsonify({"error": "All fields are required, and the file must be a PDF"}), 400

        # Store the PDF file in GridFS
        pdf_file_id = fs.put(file, filename=file.filename, content_type='application/pdf')

        # Save syllabus data in MongoDB, setting uploaded_by to the logged-in username
        syllabus = Syllabus(
            course_id=course_id,
            course_name=course_name,
            department_id=department_id,
            department_name=department_name,
            syllabus_description=syllabus_description,
            syllabus_pdf=str(pdf_file_id),
            uploaded_by=username
        )
        syllabus.save()
        return jsonify({"message": "Syllabus added successfully!", "pdf_file_id": str(pdf_file_id)}), 201

    except Exception as e:
        return jsonify({"error": f"Failed to add syllabus: {str(e)}"}), 500

def get_professor_syllabi():
    """Retrieve syllabi uploaded by a specific professor."""
    username = request.args.get('username') or session.get('username')
    print(f"Received request to fetch syllabi for username: '{username}'")  # Debug log

    try:
        if username:
            # Fetch syllabi uploaded by the specified username
            syllabi = Syllabus.objects(uploaded_by=username)
        else:
            # Fetch all syllabi if no username is specified
            syllabi = Syllabus.objects()

        syllabus_list = [{
            "course_id": s.course_id,
            "course_name": s.course_name,
            "department_id": s.department_id,
            "department_name": s.department_name,
            "professor": s.uploaded_by,
            "syllabus_description": s.syllabus_description,
            "syllabus_pdf": s.syllabus_pdf
        } for s in syllabi]

        print("Returning syllabus list:", syllabus_list)  # Debug log
        return jsonify(syllabus_list), 200

    except Exception as e:
        print(f"Error fetching syllabi for {username}: {str(e)}")  # Detailed error log
        return jsonify({"error": f"Failed to retrieve syllabi: {str(e)}"}), 500

def get_pdf_file(pdf_id):
    """Retrieve a PDF file from GridFS by its ID."""
    try:
        file_data = fs.get(ObjectId(pdf_id))
        return send_file(
            io.BytesIO(file_data.read()),
            mimetype='application/pdf',
            as_attachment=False,
            download_name=file_data.filename
        )
    except Exception as e:
        return jsonify({"error": f"PDF file not found: {str(e)}"}), 404
    
def get_single_syllabus(pdf_id):
    """Retrieve a single syllabus by its PDF ID."""
    try:
        # Check if the pdf_id is a valid ObjectId
        if not ObjectId.is_valid(pdf_id):
            return jsonify({"error": "Invalid syllabus ID"}), 400

        syllabus = Syllabus.objects(syllabus_pdf=pdf_id).first()  # Match by `syllabus_pdf` field
        if not syllabus:
            return jsonify({"error": "Syllabus not found"}), 404

        syllabus_data = {
            "id": str(syllabus.id),
            "course_id": syllabus.course_id,
            "course_name": syllabus.course_name,
            "department_id": syllabus.department_id,
            "department_name": syllabus.department_name,
            "syllabus_description": syllabus.syllabus_description,
            "syllabus_pdf": syllabus.syllabus_pdf,
            "uploaded_by": syllabus.uploaded_by
        }
        return jsonify(syllabus_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve syllabus: {str(e)}"}), 500

def update_syllabus(pdf_id):
    """Update a syllabus and optionally replace its PDF."""
    if 'username' not in session:
        return jsonify({"error": "User is not logged in"}), 401

    try:
        syllabus = Syllabus.objects(syllabus_pdf=pdf_id).first()
        if not syllabus:
            return jsonify({"error": "Syllabus not found"}), 404

        syllabus.course_id = request.form.get('course_id', syllabus.course_id)
        syllabus.course_name = request.form.get('course_name', syllabus.course_name)
        syllabus.department_id = request.form.get('department_id', syllabus.department_id)
        syllabus.department_name = request.form.get('department_name', syllabus.department_name)
        syllabus.syllabus_description = request.form.get('syllabus_description', syllabus.syllabus_description)

        new_file = request.files.get('syllabus_pdf')
        if new_file and allowed_file(new_file.filename):
            fs.delete(ObjectId(pdf_id))
            new_pdf_id = fs.put(new_file, filename=new_file.filename, content_type='application/pdf')
            syllabus.syllabus_pdf = str(new_pdf_id)

        syllabus.save()
        return jsonify({"message": "Syllabus updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to update syllabus: {str(e)}"}), 500

def delete_syllabus(pdf_id):
    """Delete a syllabus and its associated PDF from the database."""
    if 'username' not in session:
        return jsonify({"error": "User is not logged in"}), 401

    try:
        syllabus = Syllabus.objects(syllabus_pdf=pdf_id).first()
        if not syllabus:
            return jsonify({"error": "Syllabus not found"}), 404

        fs.delete(ObjectId(pdf_id))
        syllabus.delete()
        return jsonify({"message": "Syllabus deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to delete syllabus: {str(e)}"}), 500
