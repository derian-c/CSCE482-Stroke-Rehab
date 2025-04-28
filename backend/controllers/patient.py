from flask import Blueprint, jsonify, request, g
from extensions import db
from models.user import User
from models.patient_physician import PatientPhysician
from models.chat import Chat
from auth import requires_auth, AUTH0_DOMAIN
from auth0 import delete_auth0_user
import requests
import os

patients = Blueprint('patients', __name__, url_prefix='/patients')

# Get info for all patients
@patients.route('/', methods=['GET'])
@requires_auth(allowed_roles=['Physician'])
def get_patients():
  patients = db.session.scalars(db.select(User).filter_by(is_patient=True))
  return jsonify([patient.dict() for patient in patients])

# Get info for one patient by id
@patients.route('/<int:id>', methods=['GET'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def get_patient(id):
  patient = db.session.get(User, id)
  # User must exist and be a patient
  if patient and patient.is_patient:
    return jsonify(patient.dict())
  return jsonify({'error': 'Patient does not exist'}), 422

# Update info for one patient by id
@patients.route('/<int:id>', methods=['PUT'])
@requires_auth(allowed_roles=['Physician'])
def update_patient(id):
  patient = db.session.get(User, id)
  if patient and patient.is_patient:
    data = request.get_json()
    # Update patient using keys and values from json
    for key, value in data.items():
        setattr(patient, key, value)
    db.session.commit()
    return jsonify(patient.dict())
  return jsonify({'error': 'Patient does not exist'}), 422

# Create a patient with a name, email address, and physician id
@patients.route('/', methods=['POST'])
@requires_auth(allowed_roles=['Physician'])
def create_patient():
  data = request.get_json()
  first_name = data.get('first_name')
  last_name = data.get('last_name')
  email_address = data.get('email_address')
  physician_id = data.get('physician_id')
  # Try to find patient
  patient = db.session.scalars(db.select(User).filter_by(email_address=email_address)).first()
  if patient:
    if patient.is_patient:
      return jsonify({'error': 'Patient already exists'}), 422
    return jsonify({'error': 'User already exists'}), 422
  
  AUTH0_MANAGEMENT_ID = os.environ.get('AUTH0_MANAGEMENT_ID')
  AUTH0_MANAGEMENT_SECRET = os.environ.get('AUTH0_MANAGEMENT_SECRET')
  body= {
      'grant_type': 'client_credentials',
      'client_id': AUTH0_MANAGEMENT_ID,
      'client_secret': AUTH0_MANAGEMENT_SECRET,
      'audience': 'https://'+AUTH0_DOMAIN+'/api/v2/'
  }
  # Get management token to get current user's info
  management_token = requests.post('https://'+AUTH0_DOMAIN+'/oauth/token',
                                  data=body).json().get('access_token')
  pending = True
  # Returns a list of users with that email due to there being different providers
  auth0_users = requests.get('https://'+AUTH0_DOMAIN+'/api/v2/users-by-email',
                              headers={'Authorization': 'Bearer '+management_token},
                              params={'email': email_address}).json()
  # Update user's roles in Auth0
  if auth0_users and 'Patient' not in g.current_user_roles:
    pending = False
    role = os.environ.get('AUTH0_PATIENT_ROLE_ID')
    requests.post('https://'+AUTH0_DOMAIN+'/api/v2/roles/'+role+'/users',
                      headers={'Authorization': 'Bearer '+management_token},
                      json={'users': [user['user_id'] for user in auth0_users]})
    
  patient = User(first_name=first_name,last_name=last_name,email_address=email_address,is_patient=True,pending=pending)
  db.session.add(patient)
  db.session.commit()
  # Try to find the physician
  physician = db.session.get(User, physician_id)
  if not physician or not physician.is_physician:
    return jsonify({'error': 'Physician does not exist'}), 422
  # Create dependent models
  patient_physician = PatientPhysician(patient_id=patient.id,physician_id=physician.id)
  chat = Chat(patient_id=patient.id,physician_id=physician.id)
  db.session.add(chat)
  db.session.add(patient_physician)
  db.session.commit()
  return jsonify(patient.dict())

# Delete patient by id
@patients.route('/<int:id>', methods=['DELETE'])
@requires_auth(allowed_roles=['Physician'])
def delete_patient(id):
  patient = db.session.get(User, id)
  # Patient has to exist
  if patient and patient.is_patient:
    delete_auth0_user(patient.email_address)
    db.session.execute(db.delete(PatientPhysician).filter_by(patient_id=id))
    db.session.delete(patient)
    db.session.commit()
    return jsonify({'message': 'Patient deleted successfully'})
  return jsonify({'error': 'Patient does not exist'}), 422
