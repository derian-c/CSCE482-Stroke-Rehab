from flask import Blueprint, jsonify, request, g
from extensions import db
from models.user import User
from auth import requires_auth, AUTH0_DOMAIN
from auth0 import delete_auth0_user
import requests
import os

physicians = Blueprint('physicians', __name__, url_prefix='/physicians')

# Get list of all physicians
@physicians.route('/', methods=['GET'])
@requires_auth(allowed_roles=['Admin'])
def get_physicians():
  physicians = db.session.scalars(db.select(User).filter_by(is_physician=True))
  return jsonify([physician.dict() for physician in physicians])

# Get info for one physician by id
@physicians.route('/<int:id>', methods=['GET'])
@requires_auth(allowed_roles=['Physician', 'Admin'])
def get_physician(id):
  physician = db.session.get(User, id)
  # Physician must exist
  if physician and physician.is_physician:
    return jsonify(physician.dict())
  return jsonify({'error': 'Physician does not exist'}), 422

# Update info for one physician by id
@physicians.route('/<int:id>', methods=['PUT'])
@requires_auth(allowed_roles=['Admin'])
def update_physician(id):
  physician = db.session.get(User, id)
  # Physician must exist
  if physician and physician.is_physician:
    data = request.get_json()
    # Update physician using keys and values from json
    for key, value in data.items():
        setattr(physician, key, value)
    db.session.commit()
    return jsonify(physician.dict())
  return jsonify({'error': 'Physician does not exist'}), 422

# Create a physician with a name and email address
@physicians.route('/', methods=['POST'])
@requires_auth(allowed_roles=['Admin'])
def create_physician():
  data = request.get_json()
  first_name = data.get('first_name')
  last_name = data.get('last_name')
  email_address = data.get('email_address')
  # Try to find physician
  physician = db.session.scalars(db.select(User).filter_by(email_address=email_address)).first()
  if physician:
    if physician.is_physician:
      return jsonify({'error': 'Physician already exists'}), 422
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
  if auth0_users and 'Physician' not in g.current_user_roles:
    pending = False
    role = os.environ.get('AUTH0_PHYSICIAN_ROLE_ID')
    requests.post('https://'+AUTH0_DOMAIN+'/api/v2/roles/'+role+'/users',
                      headers={'Authorization': 'Bearer '+management_token},
                      json={'users': [user['user_id'] for user in auth0_users]})
  physician = User(first_name=first_name,last_name=last_name,email_address=email_address,is_physician=True,pending=pending)
  db.session.add(physician)
  db.session.commit()
  return jsonify(physician.dict())

# Delete physician by id
@physicians.route('/<int:id>', methods=['DELETE'])
@requires_auth(allowed_roles=['Admin'])
def delete_physician(id):
  physician = db.session.get(User, id)
  if physician and physician.is_physician:
    delete_auth0_user(physician.email_address)
    db.session.delete(physician)
    db.session.commit()
    return jsonify({'message': 'Physician deleted successfully'})
  return jsonify({'error': 'Physician does not exist'}), 422
