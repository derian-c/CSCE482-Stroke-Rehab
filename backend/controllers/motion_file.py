from flask import Blueprint, jsonify, request, g
from sqlalchemy import except_, null
from extensions import db
from models.motion_file import Motion_File
from models.user import User
from auth import requires_auth
from datetime import datetime
from azure.storage.blob import BlobClient
from dotenv import load_dotenv
import os


load_dotenv()

motion_files = Blueprint('motion_files', __name__, url_prefix='/motion_files')

# Get all motion_files
@motion_files.route('/', methods=['GET'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def get_motion_files():
  motion_files = db.session.execute(db.select(Motion_File)).scalars()
  return jsonify([motion_file.dict() for motion_file in motion_files])

# Get motion_file by id
@motion_files.route('<int:id>', methods=['GET'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def get_motion_file(id):
  motion_file = db.session.get(Motion_File, id)
  if motion_file:
    return jsonify(motion_file.dict())
  return jsonify({'error': 'Motion_File does not exist'}), 422

# Create a new motion_file
@motion_files.route('/create', methods=['POST'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def create_motion_file():
  request_data = request.get_json()

  if not request_data or 'type' not in request_data or 'url' not in request_data or 'name' not in request_data or 'email' not in request_data:
        return jsonify({'error': 'Missing required fields: url, file_name, type, and/or email'}), 400

  patient = db.session.query(User).filter_by(email_address=request_data['email']).first()
  if not patient or not patient.is_patient:
        return jsonify({'error': f'No patient found with email: {request_data["email"]}'}), 404

  motion_file = Motion_File(
      url=request_data['url'],
      name=request_data['name'],
      patient_id=patient.id,
      type=request_data['type']
  )
  db.session.add(motion_file)
  db.session.commit()

  return jsonify(motion_file.dict())

# Assign motion_file to a patient
@motion_files.route('/<int:id>/assign', methods=['PUT'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def assign_motion_file(id):
  motion_file = db.session.get(Motion_File, id)
  if not motion_file:
    return jsonify({'error': 'Motion_File does not exist'}), 422
  
  data = request.get_json()
  if not data or 'patient_id' not in data:
        return jsonify({'error': 'Missing required fields: patient_id'}), 400

  patient_id = data.get('patient_id')
  
  # # First, remove any existing assignment for this motion_file
  # if motion_file.patient:
  #   db.session.delete(motion_file.patient)
  #   db.session.flush()
  
  # If patient_id is None, we're just unassigning the motion_file
  # if patient_id is None:
  #   motion_file.patient_id = None
  #   db.session.commit()
  #   return jsonify(motion_file.dict())
  
  # Check if patient exists
  patient = db.session.get(User, patient_id)
  if not patient or not patient.is_patient:
    return jsonify({'error': 'Patient does not exist'}), 422
  
  
  # Create the assignment
  motion_file.patient_id = patient.id
  db.session.commit()
  return jsonify(motion_file.dict())

# Delete motion_file
@motion_files.route('/delete/<int:id>', methods=['DELETE'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def delete_motion_file(id):
  motion_file = db.session.get(Motion_File, id)
  if not motion_file:
    return jsonify({'error': 'Motion_File does not exist'}), 422
  
  # Delete blob as well
  account_name = 'capstorage2025'
  account_key = os.environ.get('AZURE_ACCESS_KEY')
  blob = BlobClient(account_url=f'https://{account_name}.blob.core.windows.net',
                      container_name='motion-files',
                      blob_name=motion_file.name,
                      credential=account_key)
  blob.delete_blob()
  db.session.delete(motion_file)
  db.session.commit()
  return jsonify({'message': 'Motion_File deleted successfully'})

# Get motion_files for a patient
@motion_files.route('/patient/<int:patient_id>', methods=['GET'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def get_patient_motion_files(patient_id):
  assignments = db.session.query(Motion_File).filter_by(patient_id=patient_id).all()
  if assignments:
    return jsonify([assignment.dict() for assignment in assignments])
  return jsonify({'error': 'No motion_file assigned to this patient'}), 404


# Get motion_files for a patient after given date
@motion_files.route('patient/<int:patient_id>/after/<date>', methods=['GET'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def get_patient_motion_files_after_date(patient_id, date):
  try:
    target_date = datetime.strptime(date, '%Y-%m-%d')
    assignments = db.session.query(Motion_File).filter(Motion_File.patient_id==patient_id, Motion_File.createdAt >= target_date).all()
    if assignments:
      return jsonify([assignment.dict() for assignment in assignments])
    return jsonify({'error': f'No motion_files found for patient {patient_id} after {date}'}), 404

  except ValueError:
      return jsonify({'error': 'Invalid date format. Please use YYYY-MM-DD'}), 400
