from flask import Blueprint, jsonify
from extensions import db
from models.physician import Physician

physicians = Blueprint('physicians', __name__, url_prefix='/physicians')

# Get list of all physicians
@physicians.route('/', methods=['GET'])
def get_physicians():
  physicians = db.session.execute(db.select(Physician)).scalars()
  return jsonify([physician.dict() for physician in physicians])

# Get info for one physician by id
@physicians.route('/<int:id>', methods=['GET'])
def get_physician(id):
  physician = db.session.get(Physician, id)
  if physician:
    return jsonify(physician.dict())
  return jsonify({'error': 'Physician does not exist'}), 422

# Update info for one patient by id
@physicians.route('/<int:id>', methods=['PUT'])
def update_patient(id):
  physician = db.session.get(Physician, id)
  if physician:
    data = request.get_json()
    physician.name = data.get('name')
    physician.email_address = data.get('email_address')
    db.session.commit()
    return jsonify(physician.dict())
  return jsonify({'error': 'Physician does not exist'}), 422

# Create a physician with a name and email address
@physicians.route('/', methods=['POST'])
def create_physician():
  data = request.get_json()
  name = data.get('name')
  email_address = data.get('email_address')
  physician = db.session.scalars(db.select(Physician).filter_by(name=name,email_address=email_address)).first()
  if physician:
    return jsonify({'error': 'Physician already exists'}), 422
  physician = Physician(name=name,email_address=email_address)
  db.session.add(physician)
  db.session.commit()
  return jsonify(physician.dict())

# Delete physician by id
@physicians.route('/<int:id>/delete', methods=['DELETE'])
def delete_physician(id):
  physician = db.session.get(Physician, id)
  if physician
    db.session.delete(physician)
    db.session.commit()
  else:
    return jsonify({'error': 'Physician does not exist'}), 422