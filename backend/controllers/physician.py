from flask import Blueprint, jsonify, request
from extensions import db
from models.physician import Physician
from auth import requires_auth

physicians = Blueprint('physicians', __name__, url_prefix='/physicians')

# Get list of all physicians
@physicians.route('/', methods=['GET'])
@requires_auth
def get_physicians():
  physicians = db.session.execute(db.select(Physician)).scalars()
  return jsonify([physician.dict() for physician in physicians])

# Get info for one physician by id
@physicians.route('/<int:id>', methods=['GET'])
@requires_auth
def get_physician(id):
  physician = db.session.get(Physician, id)
  if physician:
    return jsonify(physician.dict())
  return jsonify({'error': 'Physician does not exist'}), 422

# Update info for one physician by id
@physicians.route('/<int:id>', methods=['PUT'])
@requires_auth
def update_patient(id):
  physician = db.session.get(Physician, id)
  if physician:
    data = request.get_json()
    physician.first_name = data.get('first_name')
    physician.last_name = data.get('last_name')
    physician.email_address = data.get('email_address')
    db.session.commit()
    return jsonify(physician.dict())
  return jsonify({'error': 'Physician does not exist'}), 422

# Create a physician with a name and email address
@physicians.route('/', methods=['POST'])
@requires_auth
def create_physician():
  data = request.get_json()
  first_name = data.get('first_name')
  last_name = data.get('last_name')
  email_address = data.get('email_address')
  physician = db.session.scalars(db.select(Physician).filter_by(first_name=first_name,last_name=last_name,email_address=email_address)).first()
  if physician:
    return jsonify({'error': 'Physician already exists'}), 422
  physician = Physician(first_name=first_name,last_name=last_name,email_address=email_address)
  db.session.add(physician)
  db.session.commit()
  return jsonify(physician.dict())

# Delete physician by id
@physicians.route('/<int:id>', methods=['DELETE'])
@requires_auth
def delete_physician(id):
  physician = db.session.get(Physician, id)
  if physician:
    db.session.delete(physician)
    db.session.commit()
    return jsonify({'message': 'Physician deleted successfully'})
  return jsonify({'error': 'Physician does not exist'}), 422