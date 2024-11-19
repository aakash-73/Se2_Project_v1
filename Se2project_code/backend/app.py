from datetime import timedelta
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from controller.studentuser_controller import studentuser_controller
from controller.professoruser_controller import professoruser_controller
from controller.chatbot_controller import chatbot_controller
from config import Config
from controller import auth_controller, syllabus_controller
from groq import Groq
import logging

# Initialize Flask application
app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = '199d3cc197e2211649ac7c405c23d53cdf94ba9442ca726f'

# Initialize CORS with specific configurations
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Set session lifetime
app.permanent_session_lifetime = timedelta(days=1)

# Enable debug-level logging
logging.basicConfig(level=logging.DEBUG)

# Health check route
@app.route('/health', methods=['GET'])
def health_check():
    logging.debug("[DEBUG] Health check endpoint called.")
    return jsonify({"status": "ok", "message": "API is running"}), 200

# Home route
@app.route('/')
def home():
    logging.debug("[DEBUG] Home endpoint called.")
    return "Welcome to the Syllabus Chatbot API!"

# Authentication routes
app.add_url_rule('/register', 'register', auth_controller.register, methods=['POST'])
app.add_url_rule('/login', 'login', auth_controller.login, methods=['POST'])

# Syllabus routes
app.add_url_rule('/add_syllabus', 'add_syllabus', syllabus_controller.add_syllabus, methods=['POST'])
app.add_url_rule('/syllabi', 'get_professor_syllabi', syllabus_controller.get_professor_syllabi, methods=['GET'])
app.add_url_rule('/syllabi/all', 'get_syllabi', syllabus_controller.get_syllabi, methods=['GET'])
app.add_url_rule('/get_pdf/<pdf_id>', 'get_pdf_file', syllabus_controller.get_pdf_file, methods=['GET'])
app.add_url_rule('/syllabus/<pdf_id>', 'get_single_syllabus', syllabus_controller.get_single_syllabus, methods=['GET'])
app.add_url_rule('/update_syllabus/<pdf_id>', 'update_syllabus', syllabus_controller.update_syllabus, methods=['PUT'])
app.add_url_rule('/delete_syllabus/<pdf_id>', 'delete_syllabus', syllabus_controller.delete_syllabus, methods=['DELETE'])
app.add_url_rule('/extract_pdf_content/<pdf_id>', 'extract_pdf_content', syllabus_controller.extract_pdf_content, methods=['GET'])

# Register blueprints for student, professor, and chatbot controllers
app.register_blueprint(studentuser_controller, url_prefix='/students')
app.register_blueprint(professoruser_controller, url_prefix='/professors')
app.register_blueprint(chatbot_controller, url_prefix='/chatbot')

# Handle OPTIONS requests for CORS preflight
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        logging.debug("[DEBUG] Handling OPTIONS preflight request.")
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200

# Error handling for unexpected server errors
@app.errorhandler(500)
def internal_server_error(e):
    logging.error(f"[ERROR] Internal server error: {e}")
    return jsonify({"error": "An unexpected internal server error occurred."}), 500

# Error handling for 404 Not Found
@app.errorhandler(404)
def not_found_error(e):
    logging.warning(f"[WARNING] Resource not found: {e}")
    return jsonify({"error": "The requested resource was not found."}), 404

# Run the Flask application
if __name__ == "__main__":
    logging.info("[INFO] Starting Flask server on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
