import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from extensions import db
from models.patient import Patient
from models.physician import Physician
from models.admin import Admin
from auth import requires_auth, AuthError
from talisman import Talisman

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
frontend_url = os.environ.get('FRONTEND_URL')

app = Flask(__name__)
Talisman(app)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.url_map.strict_slashes = False

CORS(app,resources={r'/*': {'origins': frontend_url}})
db.init_app(app)
migrate = Migrate(app,db)

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

# This needs authentication
@app.route("/api/private")
@requires_auth
def private():
  response = "Hello from a private endpoint! You need to be authenticated to see this."
  return jsonify(message=response)


if __name__ == '__main__':
  app.run(debug=True,port=8000)
