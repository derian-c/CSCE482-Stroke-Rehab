import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from classes import Base, Patient, Physician
from auth import requires_auth, AuthError

# Create database engine and configure with app
load_dotenv()

db_url = os.environ.get('DATABASE_URL_LOCAL')
db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
db.init_app(app)

# Get list of all patients
@app.route('/api/patients', methods=['GET'])
def get_patients():
  patients = db.session.execute(db.select(Patient)).scalars()
  return jsonify([patient.dict() for patient in patients])

# Get info for one patient
@app.route('/api/patients/<int:id>', methods=['GET'])
def get_patient(id):
  patient = db.session.get(Patient, id)
  return jsonify(patient.dict())

# Create a patient with a name, email address, and physician name
@app.route('/api/patients/create', methods=['POST'])
def create_patient():
  data = request.get_json()
  name = data.get('name')
  email_address = data.get('email_address')
  physician_name = data.get('physician_name')
  patient = Patient(name=name,email_address=email_address)
  physician = db.session.execute(db.select(Physician).filter_by(name=physician_name)).scalar_one()
  patient.physician_id = physician.id
  db.session.add(patient)
  db.session.commit()
  return jsonify(patient.dict())

# Get list of all physicians
@app.route('/api/physicians', methods=['GET'])
def get_physicians():
  physicians = db.session.execute(db.select(Physician)).scalars()
  return jsonify([physician.dict() for physician in physicians])

# Get info for one physician
@app.route('/api/physicians/<int:id>', methods=['GET'])
def get_physician(id):
  physician = db.session.get(Physician, id)
  return jsonify(physician.dict())

# Create a physician with a name and email address
@app.route('/api/physicians/create', methods=['POST'])
def create_physician():
  data = request.get_json()
  name = data.get('name')
  email_address = data.get('email_address')
  physician = Physician(name=name,email_address=email_address)
  db.session.add(physician)
  db.session.commit()
  return jsonify(physician.dict())

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