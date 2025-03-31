from flask import Blueprint, jsonify, request
from extensions import db
from models.physician import Physician
from models.patient import Patient
from models.chat import Chat
from models.chat_message import ChatMessage
from auth import requires_auth

patients = Blueprint('patients', __name__, url_prefix='/patients')

# Get info for all patients
@patients.route('/', methods=['GET'])
@requires_auth
def get_patients():
  patients = db.session.execute(db.select(Patient)).scalars()
  return jsonify([patient.dict() for patient in patients])

# Get info for one patient by id
@patients.route('/<int:id>', methods=['GET'])
@requires_auth
def get_patient(id):
  patient = db.session.get(Patient, id)
  if patient:
    return jsonify(patient.dict())
  return jsonify({'error': 'Patient does not exist'}), 422

# Update info for one patient by id
@patients.route('/<int:id>', methods=['PUT'])
@requires_auth
def update_patient(id):
  patient = db.session.get(Patient, id)
  if patient:
    data = request.get_json()
    patient.first_name = data.get('first_name')
    patient.last_name = data.get('last_name')
    patient.email_address = data.get('email_address')
    patient.physician_id = data.get('physician_id')
    db.session.commit()
    return jsonify(patient.dict())
  return jsonify({'error': 'Patient does not exist'}), 422

# Create a patient with a name, email address, and physician name
@patients.route('/', methods=['POST'])
@requires_auth
def create_patient():
  data = request.get_json()
  first_name = data.get('first_name')
  last_name = data.get('last_name')
  email_address = data.get('email_address')
  physician_first_name = data.get('physician_first_name')
  physician_last_name = data.get('physician_last_name')
  patient = db.session.scalars(db.select(Patient).filter_by(first_name=first_name,last_name=last_name,email_address=email_address)).first()
  if patient:
    return jsonify({'error': 'Patient already exists'}), 422
  patient = Patient(first_name=first_name,last_name=last_name,email_address=email_address)
  physician = db.session.scalars(db.select(Physician).filter_by(first_name=physician_first_name,last_name=physician_last_name)).first()
  if not physician:
    return jsonify({'error': 'Physician does not exist'}), 422
  patient.physician_id = physician.id
  db.session.add(patient)
  db.session.commit()
  chat = Chat(patient_id=patient.id,physician_id=physician.id)
  db.session.add(chat)
  db.session.commit()
  return jsonify(patient.dict())

# Delete patient by id
@patients.route('/<int:id>', methods=['DELETE'])
@requires_auth
def delete_patient(id):
  patient = db.session.get(Patient, id)
  if patient:
    db.session.delete(patient)
    db.session.commit()
    return jsonify({'message': 'Patient deleted successfully'})
  return jsonify({'error': 'Patient does not exist'}), 422