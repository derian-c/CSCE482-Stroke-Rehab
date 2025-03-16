from flask import Flask
from extensions import db
import os
from dotenv import load_dotenv

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

  db.init_app(app)
  return app