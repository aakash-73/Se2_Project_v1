from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from controller.studentuser_controller import studentuser_controller
from controller.professoruser_controller import professoruser_controller
from config import Config
from controller import auth_controller, syllabus_controller

app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = '199d3cc197e2211649ac7c405c23d53cdf94ba9442ca726f'

# Configure CORS to allow credentials and specify allowed origins
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

app.permanent_session_lifetime = timedelta(days=1)

# Define routes
app.add_url_rule('/', 'home', lambda: "Welcome to the Syllabus Chatbot API!", methods=['GET'])
app.add_url_rule('/register', 'register', auth_controller.register, methods=['POST'])
app.add_url_rule('/login', 'login', auth_controller.login, methods=['POST'])
app.add_url_rule('/add_syllabus', 'add_syllabus', syllabus_controller.add_syllabus, methods=['POST'])
app.add_url_rule('/syllabi', 'get_professor_syllabi', syllabus_controller.get_professor_syllabi, methods=['GET'])  # For professors
app.add_url_rule('/syllabi/all', 'get_syllabi', syllabus_controller.get_syllabi, methods=['GET'])  # For students
app.add_url_rule('/get_pdf/<pdf_id>', 'get_pdf_file', syllabus_controller.get_pdf_file, methods=['GET'])
app.add_url_rule('/syllabus/<pdf_id>', 'get_single_syllabus', syllabus_controller.get_single_syllabus, methods=['GET'])
app.add_url_rule('/update_syllabus/<pdf_id>', 'update_syllabus', syllabus_controller.update_syllabus, methods=['PUT'])
app.add_url_rule('/delete_syllabus/<pdf_id>', 'delete_syllabus', syllabus_controller.delete_syllabus, methods=['DELETE'])

# Register the studentuser_controller blueprint with a URL prefix
app.register_blueprint(studentuser_controller, url_prefix='/students')
app.register_blueprint(professoruser_controller, url_prefix='/professors')

if __name__ == "__main__":
    app.run(debug=True)
