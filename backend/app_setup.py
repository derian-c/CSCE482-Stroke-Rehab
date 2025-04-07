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

  @app.errorhandler(AuthError)
  def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response

  @app.route("/api/private")
  @requires_auth
  def private():
    response = "Hello from a private endpoint! You need to be authenticated to see this."
    return jsonify(message=response)

  db.init_app(app)
  return app