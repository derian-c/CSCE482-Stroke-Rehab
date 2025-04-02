import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_socketio import SocketIO, join_room, leave_room
from extensions import db
from models.patient import Patient
from models.physician import Physician
from models.admin import Admin
from models.chat import Chat
from models.chat_message import ChatMessage
from models.device import Device
from models.motion_file import Motion_File
from auth import requires_auth, AuthError
from talisman import Talisman

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
frontend_url = os.environ.get('FRONTEND_URL')

app = Flask(__name__)
Talisman(app)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.url_map.strict_slashes = False

CORS(app,resources={r'/*': {'origins': frontend_url}})
db.init_app(app)
migrate = Migrate(app,db)

from controllers.patient import patients
app.register_blueprint(patients)

from controllers.physician import physicians
app.register_blueprint(physicians)

from controllers.admin import admins
app.register_blueprint(admins)

from controllers.chat_message import chat_messages
app.register_blueprint(chat_messages)

from controllers.device import devices
app.register_blueprint(devices)

from controllers.motion_file import motion_files
app.register_blueprint(motion_files)

sock = SocketIO(app, cors_allowed_origins=frontend_url)

@sock.on('join')
def on_join(data):
  patient_id = data['patient_id']
  physician_id = data['physician_id']
  chat_id = db.session.query(Chat).filter_by(patient_id=patient_id,physician_id=physician_id).first().id
  join_room(chat_id)

@sock.on('leave')
def on_leave(data):
  patient_id = data['patient_id']
  physician_id = data['physician_id']
  chat_id = db.session.query(Chat).filter_by(patient_id=patient_id,physician_id=physician_id).first().id
  leave_room(chat_id)

@sock.on('message')
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
  sock.send(chat_json,to=chat_id)


@app.errorhandler(AuthError)
def handle_auth_error(ex):
  response = jsonify(ex.error)
  response.status_code = ex.status_code
  return response

# This needs authentication
@app.route("/api/private")
@requires_auth
def private():
  response = "Hello from a private endpoint! You need to be authenticated to see this."
  return jsonify(message=response)


if __name__ == '__main__':
  sock.run(app,debug=True,port=8000)
