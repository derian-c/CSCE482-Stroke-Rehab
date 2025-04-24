from flask import Blueprint, jsonify, request, g
from extensions import db
from models.motion_reading import MotionReading
from auth import requires_auth

motion_readings = Blueprint('motion_readings', __name__, url_prefix='/motion_readings')

@motion_readings.route('/<int:motion_file_id>', methods=['GET'])
@requires_auth
def get_motion_readings(motion_file_id):
  if 'Physician' not in g.current_user_roles and 'Patient' not in g.current_user_roles:
    return jsonify({'error': 'Not authorized'}), 401
  motion_readings = db.session.scalars(db.select(MotionReading).filter_by(motion_file_id=motion_file_id))
  return jsonify([mr.dict() for mr in motion_readings])
