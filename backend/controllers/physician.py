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
  return jsonify(physician.dict())

# Create a physician with a name and email address
@physicians.route('/create', methods=['POST'])
def create_physician():
  data = request.get_json()
  name = data.get('name')
  email_address = data.get('email_address')
  physician = Physician(name=name,email_address=email_address)
  db.session.add(physician)
  db.session.commit()
  return jsonify(physician.dict())