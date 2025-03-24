from flask import Blueprint, jsonify, request
from extensions import db
from models.physician import Physician
from models.patient import Patient
from models.chat import Chat
from models.chat_message import ChatMessage

chat_messages = Blueprint('chat_messages', __name__, url_prefix='/chat_messages')

@chat_messages.route('/', methods=['GET'])
def get_chat_messages():
  data = request.get_json();
  patient_id = data.get('patient_id')
  physician_id = data.get('physician_id')
  chat_messages = db.session.execute(db.select(ChatMessage).filter_by(patient_id=patient_id,physician_id=physician_id)).scalars()
  return jsonify([chat_message.dict() for chat_message in chat_messages])