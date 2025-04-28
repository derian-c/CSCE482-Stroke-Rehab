import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_migrate import Migrate
from extensions import db, socket
from models.chat import Chat
from models.chat_message import ChatMessage
from models.device import Device
from models.user import User
from models.patient_physician import PatientPhysician
from models.motion_file import Motion_File
from models.medication import Medication
from models.motion_reading import MotionReading
import controllers.messaging
import controllers.connection
from auth import requires_auth, AuthError
from talisman import Talisman
from models.patient_document import PatientDocument
from datetime import datetime, timedelta, timezone
from azure.storage.blob import generate_container_sas, ContainerSasPermissions, BlobClient, ContainerClient, ContentSettings
import requests
import math


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

from controllers.patient_document import patient_documents
app.register_blueprint(patient_documents)

from controllers.motion_file import motion_files
app.register_blueprint(motion_files)

from controllers.medication import medications
app.register_blueprint(medications)

from controllers.motion_readings import motion_readings
app.register_blueprint(motion_readings)

socket.init_app(app=app, cors_allowed_origins=frontend_url)


@app.errorhandler(AuthError)
def handle_auth_error(ex):
  response = jsonify(ex.error)
  response.status_code = ex.status_code
  return response

# This needs authentication
@app.route("/api/private")
@requires_auth(allowed_roles=[])
def private():
  response = "Hello from a private endpoint! You need to be authenticated to see this."
  return jsonify(message=response)

@app.route('/sas_token/<string:container_name>',methods=['GET'])
@requires_auth(allowed_roles=['Patient', 'Physician'])
def get_sas_token(container_name):
  sas_token = generate_container_sas(
    account_name='capstorage2025',
    container_name=container_name,
    account_key=os.environ.get('AZURE_ACCESS_KEY'),
    permission=ContainerSasPermissions(read=True, write=True, delete=True),
    expiry=datetime.now(timezone.utc) + timedelta(hours=1)  # Token valid for 1 hour
  )
  return jsonify({'token': sas_token})

@app.route('/file_upload', methods=['POST'])
def file_upload():

  # Get file data from blob
  data = request.get_json()
  filename = data.get('filename')
  device_id = data.get('device_id')
  account_name = 'capstorage2025'
  account_key = os.environ.get('AZURE_ACCESS_KEY')
  blob = BlobClient(account_url=f'https://{account_name}.blob.core.windows.net',
                    container_name='motion-files',
                    blob_name=filename,
                    credential=account_key)
  downloader = blob.download_blob(max_concurrency=1, encoding='UTF-8')
      
  file_data = downloader.readall()
  # Send file to converter
  files = {'file': (filename, file_data)}
  converter_ip = os.environ.get('CONVERTER_IP_ADDRESS')
  response = requests.post(f'http://{converter_ip}:5050/convert', files=files)

  # Receive file and upload
  converted_file = response.content
  container = ContainerClient(account_url=f'https://{account_name}.blob.core.windows.net',
                              container_name='motion-files',
                              credential=account_key)
  
  device = db.session.get(Device,device_id)
  new_filename = f'{device.patient.id}_{datetime.now(timezone.utc)}.gltf'
  new_blob = container.upload_blob(name=new_filename,
                        data=converted_file,
                        overwrite=True,
                        content_settings=ContentSettings(content_type='model/gltf+json'))
  # Map file to database
  motion_file = Motion_File(name=new_filename,
                            type='gltf',
                            url=new_blob.url,
                            patient_id=device.patient.id)
  db.session.add(motion_file)
  db.session.flush()

  # Parse sto file and determine min and max values 
  farr = file_data.split('\n')
  labelarr = farr[4].split()
  min_max_dict = {}
  for line in farr[5:]:
    readings = line.split()
    for i in range(len(readings)):
      double_reading = float(readings[i])*180/math.pi
      if double_reading != 0:
        if min_max_dict.get(labelarr[i]):
          min_max_dict[labelarr[i]][0] = min(min_max_dict[labelarr[i]][0],double_reading)
          min_max_dict[labelarr[i]][1] = max(min_max_dict[labelarr[i]][1],double_reading)
        else:
          min_max_dict[labelarr[i]] = [double_reading,double_reading]
  motion_readings = []
  for (key, [minim,maxim]) in min_max_dict.items():
    if key != 'time':
      motion_reading = MotionReading(name=key,min=minim,max=maxim,motion_file_id=motion_file.id)
      db.session.add(motion_reading)
      db.session.flush()
      motion_readings.append(motion_reading)

  db.session.commit()
  # Send new file message to physician
  chat_id = db.session.scalars(db.select(Chat).filter_by(patient_id=device.patient.id)).first().id
  file_dict = motion_file.dict()
  # datetime is not JSON serializable
  file_dict['createdAt'] = str(file_dict['createdAt'])
  socket.emit('new_file',data={'motion_file':file_dict,'motion_readings':[mr.dict() for mr in motion_readings]},to=chat_id)
  return jsonify({'message': 'Successfully uploaded file'})

if __name__ == '__main__':
  socket.run(app,debug=True,port=8000)
