from flask import Blueprint, jsonify, request
from extensions import db
from models.chat import Chat
from models.chat_message import ChatMessage
from auth import requires_auth

chat_messages = Blueprint('chat_messages', __name__, url_prefix='/chat_messages')

@chat_messages.route('/<int:patient_id>/<int:physician_id>', methods=['GET'])
@requires_auth
def get_chat_messages(patient_id,physician_id):
  chat_id = db.session.query(Chat).filter_by(patient_id=patient_id,physician_id=physician_id).first().id
  chat_messages = db.session.execute(db.select(ChatMessage).filter_by(chat_id=chat_id)).scalars()
  return jsonify([chat_message.dict() for chat_message in chat_messages])