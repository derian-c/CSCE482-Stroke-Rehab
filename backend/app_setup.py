from flask import Flask, jsonify
from extensions import db
import os
from dotenv import load_dotenv
from auth import requires_auth, AuthError

def create_app():
  load_dotenv()
  app = Flask(__name__)
  app.config.update({
    'TESTING': True,
    'SQLALCHEMY_DATABASE_URI': os.environ.get('TEST_DATABASE_URL')
  })
  from controllers.patient import patients
  app.register_blueprint(patients)

  from controllers.physician import physicians
  app.register_blueprint(physicians)

  from controllers.admin import admins
  app.register_blueprint(admins)

  from controllers.chat_message import chat_messages
  app.register_blueprint(chat_messages)

  from controllers.device import devices
  app.register_blueprint(devices)

  from controllers.medication import medications
  app.register_blueprint(medications)

  from controllers.motion_file import motion_files
  app.register_blueprint(motion_files)

  from controllers.motion_readings import motion_readings
  app.register_blueprint(motion_readings)

  from controllers.patient_document import patient_documents
  app.register_blueprint(patient_documents)

  

  @app.errorhandler(AuthError)
  def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response

  @app.route("/api/private")
  @requires_auth(allowed_roles=[])
  def private():
    response = "Hello from a private endpoint! You need to be authenticated to see this."
    return jsonify(message=response)

  db.init_app(app)
  return app