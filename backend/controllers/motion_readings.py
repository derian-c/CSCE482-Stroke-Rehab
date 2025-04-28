from flask import Blueprint, jsonify, request, g
from extensions import db
from models.motion_reading import MotionReading
from auth import requires_auth

motion_readings = Blueprint('motion_readings', __name__, url_prefix='/motion_readings')

@motion_readings.route('/<int:motion_file_id>', methods=['GET'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def get_motion_readings(motion_file_id):
  motion_readings = db.session.scalars(db.select(MotionReading).filter_by(motion_file_id=motion_file_id))
  return jsonify([mr.dict() for mr in motion_readings])
