from flask import Blueprint
from extensions import db
from models.physician import Physician
from models.patient import Patient

patients = Blueprint('patients', __name__, url_prefix='/patients')

# Get info for all patients
@patients.route('/', methods=['GET'])
def get_patients():
  patients = db.session.execute(db.select(Patient)).scalars()
  return jsonify([patient.dict() for patient in patients])

# Get info for one patient by id
@patients.route('/<int:id>', methods=['GET'])
def get_patient(id):
  patient = db.session.get(Patient, id)
  return jsonify(patient.dict())

# Create a patient with a name, email address, and physician name
@patients.route('/create', methods=['POST'])
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