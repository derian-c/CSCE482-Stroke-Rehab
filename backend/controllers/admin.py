from flask import Blueprint, jsonify, request
from extensions import db
from models.user import User
from auth import requires_auth

admins = Blueprint('admins', __name__, url_prefix='/admins')

# Get list of all admins
@admins.route('/', methods=['GET'])
@requires_auth
def get_admins():
  admins = db.session.scalars(db.select(User).filter_by(is_admin=True))
  return jsonify([admin.dict() for admin in admins])

# Get info for one admin by id
@admins.route('/<int:id>', methods=['GET'])
@requires_auth
def get_admin(id):
  admin = db.session.get(User, id)
  # Admin must exist
  if admin and admin.is_admin:
    return jsonify(admin.dict())
  return jsonify({'error': 'Admin does not exist'}), 422

# Update info for one admin by id
@admins.route('/<int:id>', methods=['PUT'])
@requires_auth
def update_admin(id):
  admin = db.session.get(User, id)
  # Admin must exist
  if admin and admin.is_admin:
    data = request.get_json()
    # Update admin using keys and values from json
    for key, value in data.items():
        setattr(admin, key, value)
    db.session.commit()
    return jsonify(admin.dict())
  return jsonify({'error': 'Admin does not exist'}), 422

# Create an admin with a name and email address
@admins.route('/', methods=['POST'])
@requires_auth
def create_admin():
  data = request.get_json()
  first_name = data.get('first_name')
  last_name = data.get('last_name')
  email_address = data.get('email_address')
  admin = db.session.scalars(db.select(User).filter_by(email_address=email_address)).first()
  if admin:
    if admin.is_admin:
      return jsonify({'error': 'Admin already exists'}), 422
    return jsonify({'error': 'User already exists'}), 422
  admin = User(first_name=first_name,last_name=last_name,email_address=email_address,is_admin=True)
  db.session.add(admin)
  db.session.commit()
  return jsonify(admin.dict())

# Delete admin by id
@admins.route('/<int:id>', methods=['DELETE'])
@requires_auth
def delete_admin(id):
  admin = db.session.get(User, id)
  if admin and admin.is_admin:
    db.session.delete(admin)
    db.session.commit()
    return jsonify({'message': 'Admin deleted successfully'})
  return jsonify({'error': 'Admin does not exist'}), 422