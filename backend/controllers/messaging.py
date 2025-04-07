from extensions import socket, db
from flask_socketio import join_room, leave_room
from models.chat import Chat
from models.chat_message import ChatMessage

@socket.on('join')
def on_join(data):
  patient_id = data['patient_id']
  physician_id = data['physician_id']
  chat_id = db.session.query(Chat).filter_by(patient_id=patient_id,physician_id=physician_id).first().id
  join_room(chat_id)

@socket.on('leave')
def on_leave(data):
  patient_id = data['patient_id']
  physician_id = data['physician_id']
  chat_id = db.session.query(Chat).filter_by(patient_id=patient_id,physician_id=physician_id).first().id
  leave_room(chat_id)

@socket.on('message')
def on_message(data):
  patient_id = data['patient_id']
  physician_id = data['physician_id']
  chat_id = db.session.query(Chat).filter_by(patient_id=patient_id,physician_id=physician_id).first().id
  content = data['content']
  sender = data['sender']
  chat_message = ChatMessage(chat_id=chat_id,sender=sender,content=content)
  db.session.add(chat_message)
  db.session.commit()
  chat_json = chat_message.dict()
  chat_json['timestamp'] = str(chat_json['timestamp'])
  socket.send(chat_json,to=chat_id)