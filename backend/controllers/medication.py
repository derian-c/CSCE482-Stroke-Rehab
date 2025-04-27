from flask import Blueprint, jsonify, request, g
from extensions import db
from models.medication import Medication
from models.user import User
from datetime import datetime
from auth import requires_auth
from sqlalchemy.sql import func

medications = Blueprint('medications', __name__, url_prefix='/medications')

# Get all medications for a specific patient
@medications.route('/patient/<int:patient_id>', methods=['GET'])
@requires_auth
def get_patient_medications(patient_id):
    if 'Patient' not in g.current_user_roles and 'Physician' not in g.current_user_roles:
      return jsonify({'error': 'Not authorized'}), 401
    patient = db.session.get(User, patient_id)
    if not patient or not patient.is_patient:
        return jsonify({'error': 'Patient does not exist'}), 422
    
    medications = db.session.scalars(db.select(Medication).filter_by(patient_id=patient_id)).all()
    return jsonify([medication.dict() for medication in medications])

# Get a specific medication by id
@medications.route('/<int:id>', methods=['GET'])
@requires_auth
def get_medication(id):
    if 'Patient' not in g.current_user_roles and 'Physician' not in g.current_user_roles:
      return jsonify({'error': 'Not authorized'}), 401
    medication = db.session.get(Medication, id)
    if medication:
        return jsonify(medication.dict())
    return jsonify({'error': 'Medication does not exist'}), 422

# Create a new medication for a patient
@medications.route('/', methods=['POST'])
@requires_auth
def create_medication():
    if 'Patient' not in g.current_user_roles and 'Physician' not in g.current_user_roles:
      return jsonify({'error': 'Not authorized'}), 401
    data = request.get_json()
    
    patient_id = data.get('patient_id')
    name = data.get('name')
    dosage = data.get('dosage')
    instructions = data.get('instructions')
    
    # Validate required fields
    if not all([patient_id, name, dosage, instructions]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Verify patient exists
    patient = db.session.get(User, patient_id)
    if not patient or not patient.is_patient:
        return jsonify({'error': 'Patient does not exist'}), 422
    
    # Create medication
    medication = Medication(
        patient_id=patient_id,
        name=name,
        dosage=dosage,
        instructions=instructions
    )
    
    db.session.add(medication)
    db.session.commit()
    
    return jsonify(medication.dict()), 201

# Update a medication
@medications.route('/<int:id>', methods=['PUT'])
@requires_auth
def update_medication(id):
    if 'Patient' not in g.current_user_roles and 'Physician' not in g.current_user_roles:
      return jsonify({'error': 'Not authorized'}), 401
    medication = db.session.get(Medication, id)
    if not medication:
        return jsonify({'error': 'Medication does not exist'}), 422
    
    data = request.get_json()
    
    # Update medication using keys and values from json
    for key, value in data.items():
        setattr(medication, key, value)
    
    db.session.commit()
    return jsonify(medication.dict())

# Log medication intake (update last_taken timestamp)
@medications.route('/<int:id>/log', methods=['POST'])
@requires_auth
def log_medication(id):
    if 'Patient' not in g.current_user_roles and 'Physician' not in g.current_user_roles:
      return jsonify({'error': 'Not authorized'}), 401
    medication = db.session.get(Medication, id)
    if not medication:
        return jsonify({'error': 'Medication does not exist'}), 422
    
    # Update last_taken timestamp to current time
    medication.last_taken = func.now()
    db.session.commit()
    
    return jsonify(medication.dict())

# Delete a medication
@medications.route('/<int:id>', methods=['DELETE'])
@requires_auth
def delete_medication(id):
    if 'Patient' not in g.current_user_roles and 'Physician' not in g.current_user_roles:
      return jsonify({'error': 'Not authorized'}), 401
    medication = db.session.get(Medication, id)
    if not medication:
        return jsonify({'error': 'Medication does not exist'}), 422
    
    db.session.delete(medication)
    db.session.commit()
    
    return jsonify({'message': 'Medication deleted successfully'})
