from flask import Blueprint, jsonify, request
from sqlalchemy import null
from extensions import db
from models.device import Device
from models.user import User
from auth import requires_auth

devices = Blueprint('devices', __name__, url_prefix='/devices')

# Get all devices
@devices.route('/', methods=['GET'])
@requires_auth
def get_devices():
  devices = db.session.execute(db.select(Device)).scalars()
  return jsonify([device.dict() for device in devices])

# Get device by id
@devices.route('/<int:id>', methods=['GET'])
@requires_auth
def get_device(id):
  device = db.session.get(Device, id)
  if device:
    return jsonify(device.dict())
  return jsonify({'error': 'Device does not exist'}), 422

# Create a new device
@devices.route('/', methods=['POST'])
@requires_auth
def create_device():
  # Create an unassigned device
  device = Device()
  db.session.add(device)
  db.session.commit()
  return jsonify(device.dict())

# Assign device to a patient
@devices.route('/<int:id>/assign', methods=['PUT'])
@requires_auth
def assign_device(id):
  device = db.session.get(Device, id)
  if not device:
    return jsonify({'error': 'Device does not exist'}), 422
  
  data = request.get_json()
  patient_id = data.get('patient_id')
  
  # # First, remove any existing assignment for this device
  # if device.patient:
  #   db.session.delete(device.patient)
  #   db.session.flush()
  
  # If patient_id is None, we're just unassigning the device
  if patient_id is None:
    db.patient_id = None
    db.session.commit()
    return jsonify(device.dict())
  
  # Check if patient exists
  patient = db.session.get(User, patient_id)
  if not patient or not patient.is_patient:
    return jsonify({'error': 'Patient does not exist'}), 422
  
  # Check if patient already has a device
  if patient.device:
    return jsonify({'error': 'Patient already has a device assigned'}), 422
  
  # Create the assignment
  patient.device = device
  db.session.commit()
  return jsonify(device.dict())

# Delete device
@devices.route('/<int:id>', methods=['DELETE'])
@requires_auth
def delete_device(id):
  device = db.session.get(Device, id)
  if not device:
    return jsonify({'error': 'Device does not exist'}), 422
  
  db.session.delete(device)
  db.session.commit()
  return jsonify({'message': 'Device deleted successfully'})

# Get device for a patient
@devices.route('/patient/<int:patient_id>', methods=['GET'])
@requires_auth
def get_patient_device(patient_id):
  assignment = db.session.query(Device).filter_by(patient_id=patient_id).one()
  if assignment:
    return jsonify(assignment.dict())
  return jsonify({'error': 'No device assigned to this patient'}), 404

# Get all unassigned devices
@devices.route('/unassigned', methods=['GET'])
@requires_auth
def get_unassigned_devices():
  # Get devices that don't have a patient assignment
  unassigned_devices = []
  devices = db.session.query(Device).filter_by(patient_id = None).all()
  for device in devices:
    if not device.patient:
      unassigned_devices.append(device.dict())
  return jsonify(unassigned_devices)
