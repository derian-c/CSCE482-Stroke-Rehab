from flask import Blueprint, jsonify, request
from extensions import db
from models.admin import Admin

admins = Blueprint('admins', __name__, url_prefix='/admins')

# Get list of all admins
@admins.route('/', methods=['GET'])
def get_admins():
  admins = db.session.execute(db.select(Admin)).scalars()
  return jsonify([admin.dict() for admin in admins])

# Get info for one admin by id
@admins.route('/<int:id>', methods=['GET'])
def get_admin(id):
  admin = db.session.get(Admin, id)
  if admin:
    return jsonify(admin.dict())
  return jsonify({'error': 'Admin does not exist'}), 422

# Update info for one admin by id
@admins.route('/<int:id>', methods=['PUT'])
def update_patient(id):
  admin = db.session.get(Admin, id)
  if admin:
    data = request.get_json()
    admin.name = data.get('name')
    admin.email_address = data.get('email_address')
    db.session.commit()
    return jsonify(admin.dict())
  return jsonify({'error': 'Admin does not exist'}), 422

# Create an admin with a name and email address
@admins.route('/', methods=['POST'])
def create_admin():
  data = request.get_json()
  name = data.get('name')
  email_address = data.get('email_address')
  admin = db.session.scalars(db.select(Admin).filter_by(name=name,email_address=email_address)).first()
  if admin:
    return jsonify({'error': 'admin already exists'}), 422
  admin = Admin(name=name,email_address=email_address)
  db.session.add(admin)
  db.session.commit()
  return jsonify(admin.dict())

# Delete admin by id
@admins.route('/<int:id>', methods=['DELETE'])
def delete_admin(id):
  admin = db.session.get(Admin, id)
  if admin:
    db.session.delete(admin)
    db.session.commit()
    return jsonify({'message': 'Admin deleted successfully'})
  return jsonify({'error': 'Admin does not exist'}), 422